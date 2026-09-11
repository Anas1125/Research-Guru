import { useEffect, useState } from "react";

import {
  Menu,
  Save,
  Upload,
  Trash2,
  Image as ImageIcon,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";

import {
  apiFetch,
  API_URL,
} from "../utils/api";

function AdminSettings() {
  const navigate = useNavigate();

  /* =====================================================
     STATE
  ====================================================== */

  const [settings, setSettings] = useState({
    site_name: "Research Guru",
    logo_url: "",
    favicon_url: "",
    home_background: "",
    home_intro_image: "",
    about_background: "",
    services_background: "",
    offers_background: "",
    contact_background: "",
    contact_phone: "",
    contact_email: "",
    contact_address: "",
    contact_whatsapp: "",
    contact_hours: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /* =====================================================
     LOAD SETTINGS
  ====================================================== */

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiFetch(
          "/api/admin/site-settings"
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.detail ||
            "Failed to load site settings."
        );
      }

      const data =
        await response.json();

      setSettings({
        site_name:
          data.site_name ||
          "Research Guru",

        logo_url:
          data.logo_url || "",

        favicon_url:
          data.favicon_url || "",

        home_background:
          data.home_background || "",

        home_intro_image:
          data.home_intro_image || "",

        about_background:
          data.about_background || "",

        services_background:
          data.services_background || "",

        offers_background: 
          data.offers_background || "",

        contact_background:
          data.contact_background || "",

        contact_phone:
          data.contact_phone || "",

        contact_email:
          data.contact_email || "",

        contact_address:
          data.contact_address || "",

        contact_whatsapp:
          data.contact_whatsapp || "",

        contact_hours:
          data.contact_hours || "",
      });
    } catch (err) {
      console.error(
        "Failed to load site settings:",
        err
      );

      setError(
        err.message ||
          "Failed to load site settings."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     UPDATE FIELD
  ====================================================== */

  function updateField(
    name,
    value
  ) {
    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* =====================================================
     SAVE SETTINGS
  ====================================================== */

  async function saveSettings() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await apiFetch(
          "/api/admin/site-settings",
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              settings
            ),
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to save site settings."
        );
      }

      setSettings((previous) => ({
        ...previous,
        ...data,
      }));

      setSuccess(
        "Site settings saved successfully."
      );
    } catch (err) {
      console.error(
        "Failed to save site settings:",
        err
      );

      setError(
        err.message ||
          "Failed to save site settings."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     IMAGE UPLOAD
  ====================================================== */

  async function handleImageUpload(
    settingKey,
    file
  ) {
    if (!file) {
      return;
    }

    try {
      setUploading(settingKey);
      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await apiFetch(
          `/api/admin/site-settings/upload?setting_key=${encodeURIComponent(
            settingKey
          )}`,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to upload image."
        );
      }

      if (!data?.image_url) {
        throw new Error(
          "The server did not return an image URL."
        );
      }

      setSettings((previous) => ({
        ...previous,
        [settingKey]:
          data.image_url,
      }));

      setSuccess(
        "Image uploaded successfully. Click Save Settings to save all changes."
      );
    } catch (err) {
      console.error(
        "Failed to upload image:",
        err
      );

      setError(
        err.message ||
          "Failed to upload image."
      );
    } finally {
      setUploading("");
    }
  }

    /* =====================================================
     REMOVE IMAGE
  ====================================================== */

  async function handleImageRemove(settingKey) {
    if (!window.confirm("Are you sure you want to remove this image?")) {
      return;
    }

    try {
      setUploading(settingKey);
      setError("");
      setSuccess("");

      const response = await apiFetch(
        `/api/admin/site-settings/image?setting_key=${encodeURIComponent(
          settingKey
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to remove image."
        );
      }

      setSettings((previous) => ({
        ...previous,
        [settingKey]: "",
      }));

      setSuccess(
        "Image removed successfully."
      );
    } catch (err) {
      console.error(
        "Failed to remove image:",
        err
      );

      setError(
        err.message ||
          "Failed to remove image."
      );
    } finally {
      setUploading("");
    }
  }

  /* =====================================================
     IMAGE URL
  ====================================================== */

  function getImageUrl(path) {
    if (!path) {
      return "";
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `${API_URL}${path}`;
  }

  /* =====================================================
     LOGOUT
  ====================================================== */

  function handleLogout() {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "adminUsername"
    );

    navigate(
      "/admin/login"
    );
  }

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#17213A]">

      {/* =================================================
          DESKTOP SIDEBAR
      ================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 bg-[#17213A] lg:block">
        <AdminSidebar
          currentPage="/admin/settings"
          onLogout={handleLogout}
        />
      </aside>

      {/* =================================================
          MOBILE SIDEBAR
      ================================================== */}

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-pointer bg-black/40 lg:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

          <aside className="fixed inset-y-0 left-0 z-[60] w-72 bg-[#17213A] shadow-2xl lg:hidden">
            <AdminSidebar
              currentPage="/admin/settings"
              mobile
              onClose={() =>
                setSidebarOpen(false)
              }
              onLogout={handleLogout}
            />
          </aside>
        </>
      )}

      {/* =================================================
          MAIN
      ================================================== */}

      <main className="lg:ml-64">

        {/* =================================================
            HEADER
        ================================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="cursor-pointer rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
                aria-label="Open admin menu"
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Administration
                </p>

                <h1 className="mt-1 text-xl font-bold text-[#17213A] sm:text-2xl">
                  Site Settings
                </h1>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Manage branding, page backgrounds and contact information.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={
                saveSettings
              }
              disabled={
                saving || loading
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#17213A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              <span className="hidden sm:inline">
                {saving
                  ? "Saving..."
                  : "Save Settings"}
              </span>
            </button>

          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="shrink-0 cursor-pointer"
                aria-label="Dismiss error"
              >
                <X size={17} />
              </button>

            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================== */}

          {success && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

              <span>
                {success}
              </span>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
                className="shrink-0 cursor-pointer"
                aria-label="Dismiss success"
              >
                <X size={17} />
              </button>

            </div>
          )}

          {/* =================================================
              LOADING
          ================================================== */}

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">

              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">

                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#17213A]" />

                Loading site settings...

              </div>

            </div>
          ) : (
            <div className="space-y-8">

              {/* =================================================
                  BRANDING
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                  <h2 className="text-lg font-bold text-[#17213A]">
                    Branding
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage the website name, logo and favicon.
                  </p>

                </div>

                {/* =================================================
                    WEBSITE NAME
                ================================================== */}

                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                  <label className="block text-sm font-semibold text-[#17213A]">
                    Website Name
                  </label>

                  <p className="mt-1 text-sm text-slate-500">
                    This name will be displayed across the website.
                  </p>

                  <input
                    type="text"
                    value={
                      settings.site_name
                    }
                    onChange={(event) =>
                      updateField(
                        "site_name",
                        event.target.value
                      )
                    }
                    placeholder="Research Guru"
                    className="mt-4 w-full max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10"
                  />

                </div>

                {/* =================================================
                    LOGO + FAVICON
                ================================================== */}

                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">

                  <ImageUploadCard
                    title="Navbar Logo"
                    description="Logo displayed in the website navigation."
                    settingKey="logo_url"
                    onRemove={handleImageRemove}
                    value={
                      settings.logo_url
                    }
                    imageUrl={getImageUrl(
                      settings.logo_url
                    )}
                    uploading={
                      uploading ===
                      "logo_url"
                    }
                    onUpload={
                      handleImageUpload
                    }
                  />

                  <ImageUploadCard
                    title="Favicon"
                    description="Small icon displayed in the browser tab."
                    settingKey="favicon_url"
                    onRemove={handleImageRemove}
                    value={
                      settings.favicon_url
                    }
                    imageUrl={getImageUrl(
                      settings.favicon_url
                    )}
                    uploading={
                      uploading ===
                      "favicon_url"
                    }
                    onUpload={
                      handleImageUpload
                    }
                  />

                </div>

              </section>

              {/* =================================================
                  PAGE BACKGROUNDS
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                  <h2 className="text-lg font-bold text-[#17213A]">
                    Page Backgrounds
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload a background image for each public website page.
                  </p>

                </div>

                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">

                  <ImageUploadCard
                    title="Home Background"
                    description="Background image for the Home page."
                    settingKey="home_background"
                    onRemove={handleImageRemove}
                    value={
                      settings.home_background
                    }
                    imageUrl={getImageUrl(
                      settings.home_background
                    )}
                    uploading={
                      uploading ===
                      "home_background"
                    }
                    onUpload={
                      handleImageUpload
                    }
                  />

                  <ImageUploadCard
                    title="Home Intro Image"
                    description="Image displayed in the Home page research introduction section."
                    settingKey="home_intro_image"
                    value={settings.home_intro_image}
                    onRemove={handleImageRemove}
                    imageUrl={getImageUrl(
                        settings.home_intro_image
                    )}
                    uploading={
                        uploading ===
                        "home_intro_image"
                    }
                    onUpload={
                        handleImageUpload
                    }
                  />

                  <ImageUploadCard
                    title="About Background"
                    description="Background image for the About page."
                    settingKey="about_background"
                    onRemove={handleImageRemove}
                    value={
                      settings.about_background
                    }
                    imageUrl={getImageUrl(
                      settings.about_background
                    )}
                    uploading={
                      uploading ===
                      "about_background"
                    }
                    onUpload={
                      handleImageUpload
                    }
                  />

                  <ImageUploadCard
                    title="Services Background"
                    description="Background image for the Services page."
                    settingKey="services_background"
                    onRemove={handleImageRemove}
                    value={
                      settings.services_background
                    }
                    imageUrl={getImageUrl(
                      settings.services_background
                    )}
                    uploading={
                      uploading ===
                      "services_background"
                    }
                    onUpload={
                      handleImageUpload
                    }
                  />

                  <ImageUploadCard
                    title="Offers Background"
                    description="Background image for the offers page."
                    settingKey="offers_background"
                    onRemove={handleImageRemove}
                    value={
                      settings.offers_background
                    }
                    imageUrl={getImageUrl(
                      settings.offers_background
                    )}
                    uploading={
                      uploading ===
                      "offers_background"
                    }
                    onUpload={
                      handleImageUpload
                    }
                  />

                  <ImageUploadCard
                    title="Contact Background"
                    description="Background image for the Contact page."
                    settingKey="contact_background"
                    onRemove={handleImageRemove}
                    value={
                      settings.contact_background
                    }
                    imageUrl={getImageUrl(
                      settings.contact_background
                    )}
                    uploading={
                      uploading ===
                      "contact_background"
                    }
                    onUpload={
                      handleImageUpload
                    }
                  />

                </div>

              </section>

              {/* =================================================
                  CONTACT INFORMATION
              ================================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                  <h2 className="text-lg font-bold text-[#17213A]">
                    Contact Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    These details will be displayed on the public Contact page.
                  </p>

                </div>

                <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">

                  <ContactField
                    icon={
                      <Phone size={18} />
                    }
                    label="Phone"
                    value={
                      settings.contact_phone
                    }
                    onChange={(value) =>
                      updateField(
                        "contact_phone",
                        value
                      )
                    }
                    placeholder="+91 XXXXX XXXXX"
                  />

                  <ContactField
                    icon={
                      <Mail size={18} />
                    }
                    label="Email"
                    type="email"
                    value={
                      settings.contact_email
                    }
                    onChange={(value) =>
                      updateField(
                        "contact_email",
                        value
                      )
                    }
                    placeholder="example@domain.com"
                  />

                  <ContactField
                    icon={
                      <MessageCircle
                        size={18}
                      />
                    }
                    label="WhatsApp"
                    value={
                      settings.contact_whatsapp
                    }
                    onChange={(value) =>
                      updateField(
                        "contact_whatsapp",
                        value
                      )
                    }
                    placeholder="+91 XXXXX XXXXX"
                  />

                  <ContactField
                    icon={
                      <Clock size={18} />
                    }
                    label="Business Hours"
                    value={
                      settings.contact_hours
                    }
                    onChange={(value) =>
                      updateField(
                        "contact_hours",
                        value
                      )
                    }
                    placeholder="Monday - Saturday, 9:00 AM - 6:00 PM"
                  />

                  <div className="md:col-span-2">

                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#17213A]">
                      <MapPin size={18} />
                      Address
                    </label>

                    <textarea
                      value={
                        settings.contact_address
                      }
                      onChange={(event) =>
                        updateField(
                          "contact_address",
                          event.target.value
                        )
                      }
                      rows={4}
                      placeholder="Enter business address"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10"
                    />

                  </div>

                </div>

              </section>

              {/* =================================================
                  BOTTOM SAVE
              ================================================== */}

              <div className="flex justify-end">

                <button
                  type="button"
                  onClick={
                    saveSettings
                  }
                  disabled={
                    saving
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#17213A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : "Save Settings"}

                </button>

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

/* =====================================================
   IMAGE UPLOAD CARD
====================================================== */

function ImageUploadCard({
  title,
  description,
  settingKey,
  value,
  imageUrl,
  uploading,
  onUpload,
  onRemove,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC]">

      <div className="p-5">

        <div className="mb-4">

          <h3 className="font-semibold text-[#17213A]">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>

        </div>

        {imageUrl ? (
          <div className="relative mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">

            <img
              src={imageUrl}
              alt={title}
              className={
                settingKey ===
                "favicon_url"
                  ? "mx-auto h-28 w-28 object-contain p-4"
                  : "h-48 w-full object-cover"
              }
            />

          </div>
        ) : (
          <div className="mb-4 flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">

            <div className="text-center">

              <ImageIcon
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-2 text-sm font-medium text-slate-400">
                No image uploaded
              </p>

            </div>

          </div>
        )}

        <div className="flex gap-2">

          {/* UPLOAD / REPLACE */}
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#17213A] transition hover:bg-slate-50">

            <Upload size={17} />

            {uploading
              ? "Processing..."
              : value
              ? "Replace Image"
              : "Upload Image"}

            <input
              type="file"
              accept={
                settingKey === "favicon_url"
                  ? ".ico,.png,.jpg,.jpeg,.webp"
                  : ".jpg,.jpeg,.png,.webp"
              }
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                const file =
                  event.target.files?.[0];

                onUpload(
                  settingKey,
                  file
                );

                event.target.value = "";
              }}
            />

          </label>

          {/* REMOVE */}
          {value && (
            <button
              type="button"
              onClick={() =>
                onRemove(settingKey)
              }
              disabled={uploading}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Remove ${title}`}
            >
              <Trash2 size={17} />

              <span className="hidden sm:inline">
                Remove
              </span>
            </button>
          )}

        </div>

        {value && (
          <p className="mt-3 truncate text-xs text-slate-400">
            {value}
          </p>
        )}

      </div>

    </div>
  );
}

/* =====================================================
   CONTACT FIELD
====================================================== */

function ContactField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>

      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#17213A]">
        {icon}
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#17213A] outline-none transition placeholder:text-slate-400 focus:border-[#17213A] focus:ring-2 focus:ring-[#17213A]/10"
      />

    </div>
  );
}

export default AdminSettings;