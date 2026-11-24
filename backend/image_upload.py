"""Decode and re-encode untrusted raster uploads before persistence."""
from dataclasses import dataclass
from io import BytesIO
import os

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps

MAX_BYTES = 4 * 1024 * 1024
MAX_EDGE = 4096
MAX_PIXELS = 16_000_000
FORMATS = {
    "JPEG": (".jpg", "image/jpeg", {".jpg", ".jpeg"}, {"image/jpeg"}),
    "PNG": (".png", "image/png", {".png"}, {"image/png"}),
    "WEBP": (".webp", "image/webp", {".webp"}, {"image/webp"}),
    "ICO": (".ico", "image/x-icon", {".ico"}, {"image/x-icon", "image/vnd.microsoft.icon"}),
}
SAFE_CONTENT_TYPES = {entry[1] for entry in FORMATS.values()} | {"image/vnd.microsoft.icon"}


@dataclass(frozen=True)
class SanitizedImage:
    contents: bytes
    extension: str
    content_type: str


class OutputTooLarge(Exception):
    pass


class BoundedBuffer(BytesIO):
    def write(self, data):
        if self.tell() + len(data) > MAX_BYTES:
            raise OutputTooLarge()
        return super().write(data)


def sanitize_image(file: UploadFile, *, allow_ico: bool = False) -> SanitizedImage:
    """Bound reads, verify the actual format, discard metadata and trailing bytes."""
    if file.size is not None and file.size > MAX_BYTES:
        raise HTTPException(413, "Image must be at most 4 MB.")
    data = file.file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image must be at most 4 MB.")
    extension = os.path.splitext(file.filename or "")[1].lower()
    try:
        permitted = ["JPEG", "PNG", "WEBP"] + (["ICO"] if allow_ico else [])
        with Image.open(BytesIO(data), formats=permitted) as source:
            kind = source.format
            suffix, mime, extensions, types = FORMATS[kind]
            if extension not in extensions or file.content_type not in types:
                raise HTTPException(400, "Image format, extension and MIME type must match.")
            width, height = source.size
            if not (0 < width <= MAX_EDGE and 0 < height <= MAX_EDGE and width * height <= MAX_PIXELS):
                raise HTTPException(400, "Image exceeds the maximum dimensions or pixel count.")
            if getattr(source, "n_frames", 1) != 1:
                raise HTTPException(400, "Animated images are not supported.")
            source.verify()
        # Verify checks structure; reopen and decode all pixels before saving.
        with Image.open(BytesIO(data), formats=permitted) as source:
            source.load()
            oriented = ImageOps.exif_transpose(source)
            mode = "RGB" if kind == "JPEG" else "RGBA"
            converted = oriented.convert(mode)
            # A fresh image does not inherit EXIF, ICC profiles, comments or text.
            clean = Image.new(mode, converted.size)
            clean.paste(converted)
            output = BoundedBuffer()
            options = {"quality": 90} if kind in {"JPEG", "WEBP"} else {}
            if kind == "ICO":
                options = {"sizes": [clean.size]}
            clean.save(output, format=kind, **options)
            result = output.getvalue()
            if not result:
                raise ValueError("Empty encoded image")
        if len(result) > MAX_BYTES:
            raise OutputTooLarge()
        return SanitizedImage(result, suffix, mime)
    except HTTPException:
        raise
    except OutputTooLarge:
        raise HTTPException(413, "Re-encoded image exceeds 4 MB. Resize the image and try again.") from None
    except (OSError, ValueError, SyntaxError, KeyError, TypeError, Image.DecompressionBombError):
        raise HTTPException(400, "Invalid or unsupported image file.") from None
