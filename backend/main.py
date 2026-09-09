import os
import uuid
from datetime import datetime
from uuid import uuid4

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

import models

from database import Base, engine, get_db

from models import (
    ServiceCategory,
    Service,
    AdminUser,
    SiteSetting,
    ContactEnquiry,
    ClientReview,
    Client,
    Offer,
)

from schemas import (
    ServiceCreate,
    ServiceUpdate,
    CategoryCreate,
    CategoryUpdate,
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostResponse,
    ServiceCategoryResponse,
    AdminUserCreate,
    AdminUserUpdate,
    AdminUserResponse,
    SiteSettingsUpdate,
    SiteSettingsResponse,
    ContactEnquiryCreate,
    ContactEnquiryUpdate,
    ContactEnquiryResponse,
    ClientReviewCreate,
    ClientReviewUpdate,
    ClientReviewResponse,
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    OfferCreate,
    OfferUpdate,
    OfferResponse,
)

from auth import (
    get_current_admin,
    hash_password,
    verify_password,
    create_access_token,
)


# =====================================================
# APP
# =====================================================

app = FastAPI(
    title="Research Guru API",
    version="1.0.0",
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",#chnage this to frontend url after deployment
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# DATABASE
# =====================================================

Base.metadata.create_all(bind=engine)


# =====================================================
# FILE UPLOADS
# =====================================================

UPLOAD_DIR = "uploads/blog"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True,
)

SITE_UPLOAD_DIR = "uploads/site"

os.makedirs(
    SITE_UPLOAD_DIR,
    exist_ok=True,
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)


# =====================================================
# SEED INITIAL SERVICES
# =====================================================

def seed_services(db: Session):
    categories = {
        "Implementation": {
            "description": (
                "Research-focused technical implementation across "
                "multiple academic and applied domains."
            ),
            "icon": "Code2",
        },
        "Writing": {
            "description": (
                "Academic and research writing support for papers, "
                "theses, dissertations, reviews, and documentation."
            ),
            "icon": "PenTool",
        },
        "Publication": {
            "description": (
                "Support for preparing and positioning research "
                "for suitable publication opportunities."
            ),
            "icon": "Award",
        },
    }

    # ---------------------------------------------------------
    # CREATE CATEGORIES IF THEY DO NOT EXIST
    # ---------------------------------------------------------

    category_objects = {}

    for name, data in categories.items():
        category = (
            db.query(ServiceCategory)
            .filter(ServiceCategory.name == name)
            .first()
        )

        if not category:
            category = ServiceCategory(
                name=name,
                description=data["description"],
                icon=data["icon"],
                is_active=True,
            )
            db.add(category)
            db.flush()

        else:
            category.description = data["description"]
            category.icon = data["icon"]
            category.is_active = True

        category_objects[name] = category

    db.flush()

    # ---------------------------------------------------------
    # IMPLEMENTATION DOMAINS
    # ---------------------------------------------------------

    implementation_domains = [
        "Computer Science",
        "Information Technology",
        "Medical & Healthcare",
        "Engineering",
        "Life Sciences",
        "Environmental Science",
        "Social Sciences",
        "Management & Commerce",
        "Education",
    ]

    # ---------------------------------------------------------
    # WRITING SERVICES
    # ---------------------------------------------------------

    writing_services = [
        "Research Paper Writing",
        "Thesis & Dissertation",
        "Literature Review",
        "Review Paper",
        "Conference Paper",
        "Research Documentation",
    ]

    # ---------------------------------------------------------
    # PUBLICATION SERVICES
    # ---------------------------------------------------------

    publication_services = [
        "SCI Journals",
        "Scopus Journals",
        "Annexure Journals",
        "Journal Selection",
        "Manuscript Preparation",
        "Submission Support",
    ]

    service_groups = {
        "Implementation": implementation_domains,
        "Writing": writing_services,
        "Publication": publication_services,
    }

    # ---------------------------------------------------------
    # SYNCHRONIZE SERVICES
    # ---------------------------------------------------------

    for category_name, service_names in service_groups.items():
        category = category_objects[category_name]

        existing_services = (
            db.query(Service)
            .filter(Service.category_id == category.id)
            .order_by(Service.display_order.asc())
            .all()
        )

        # Update existing services first
        for index, service_name in enumerate(service_names):
            if index < len(existing_services):
                service = existing_services[index]
                service.name = service_name
                service.display_order = index
                service.is_active = True

            else:
                service = Service(
                    category_id=category.id,
                    name=service_name,
                    description=None,
                    display_order=index,
                    is_active=True,
                )
                db.add(service)

        # Remove extra old services
        if len(existing_services) > len(service_names):
            for service in existing_services[len(service_names):]:
                db.delete(service)

    db.commit()

# =====================================================
# ROOT
# =====================================================

@app.get("/")
def root():
    return {
        "message": "Research Guru API is running"
    }


# =====================================================
# PUBLIC SERVICES
# =====================================================

@app.get(
    "/api/services",
    response_model=list[ServiceCategoryResponse],
)
def get_services(
    db: Session = Depends(get_db),
):
    categories = (
        db.query(ServiceCategory)
        .filter(
            ServiceCategory.is_active == True
        )
        .all()
    )

    category_order = {
        "Implementation": 1,
        "Writing": 2,
        "Publication": 3,
    }

    categories.sort(
        key=lambda category: category_order.get(
            category.name,
            999
        )
    )

    for category in categories:
        category.services = [
            service
            for service in category.services
            if service.is_active
        ]

        category.services.sort(
            key=lambda service: service.display_order
        )

    return categories

# =====================================================
# PUBLIC - OFFERS
# =====================================================

@app.get(
    "/api/offers",
    response_model=list[OfferResponse],
)
def get_offers(
    db: Session = Depends(get_db),
):
    return (
        db.query(Offer)
        .filter(
            Offer.is_active == True
        )
        .order_by(
            Offer.display_order,
            Offer.id,
        )
        .all()
    )


# =====================================================
# ADMIN - OFFERS
# =====================================================

@app.get(
    "/api/admin/offers",
    response_model=list[OfferResponse],
)
def admin_get_offers(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    return (
        db.query(Offer)
        .order_by(
            Offer.display_order,
            Offer.id,
        )
        .all()
    )


@app.post(
    "/api/admin/offers",
    response_model=OfferResponse,
)
def admin_create_offer(
    data: OfferCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    title = data.title.strip()

    if not title:
        raise HTTPException(
            status_code=400,
            detail="Offer title is required.",
        )

    if not data.start_date:
        raise HTTPException(
            status_code=400,
            detail="Start date is required.",
        )

    if not data.end_date:
        raise HTTPException(
            status_code=400,
            detail="End date is required.",
        )

    if data.start_date >= data.end_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date.",
        )

    offer = Offer(
        title=title,
        description=data.description,
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        offer_code=data.offer_code,
        start_date=data.start_date,
        end_date=data.end_date,
        cta_text=data.cta_text,
        cta_link=data.cta_link,
        is_active=data.is_active,
        display_order=data.display_order,
        created_at=datetime.now().isoformat(),
    )

    db.add(offer)
    db.commit()
    db.refresh(offer)

    return offer


@app.put(
    "/api/admin/offers/{offer_id}",
    response_model=OfferResponse,
)
def admin_update_offer(
    offer_id: int,
    data: OfferUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    offer = (
        db.query(Offer)
        .filter(
            Offer.id == offer_id
        )
        .first()
    )

    if not offer:
        raise HTTPException(
            status_code=404,
            detail="Offer not found.",
        )

    updates = data.model_dump(
        exclude_unset=True
    )

    new_start_date = updates.get(
        "start_date",
        offer.start_date,
    )

    new_end_date = updates.get(
        "end_date",
        offer.end_date,
    )

    if new_start_date >= new_end_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date.",
        )

    if "title" in updates:
        title = (
            updates["title"] or ""
        ).strip()

        if not title:
            raise HTTPException(
                status_code=400,
                detail="Offer title is required.",
            )

        updates["title"] = title

    for key, value in updates.items():
        setattr(
            offer,
            key,
            value,
        )

    db.commit()
    db.refresh(offer)

    return offer


@app.delete(
    "/api/admin/offers/{offer_id}"
)
def admin_delete_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    offer = (
        db.query(Offer)
        .filter(
            Offer.id == offer_id
        )
        .first()
    )

    if not offer:
        raise HTTPException(
            status_code=404,
            detail="Offer not found.",
        )

    db.delete(offer)
    db.commit()

    return {
        "message": "Offer deleted successfully"
    }

# =====================================================
# PUBLIC - CLIENT REVIEWS
# =====================================================

@app.post(
    "/api/reviews",
    response_model=ClientReviewResponse,
)
def submit_client_review(
    data: ClientReviewCreate,
    db: Session = Depends(get_db),
):
    review = ClientReview(
        client_name=data.client_name,
        designation=data.designation,
        rating=data.rating,
        review=data.review,
        photo_url=data.photo_url,
        is_published=False,
        display_order=0,
        created_at=datetime.now().isoformat(),
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@app.get(
    "/api/reviews",
    response_model=list[ClientReviewResponse],
)
def get_published_reviews(
    db: Session = Depends(get_db),
):
    return (
        db.query(ClientReview)
        .filter(
            ClientReview.is_published == True
        )
        .order_by(
            ClientReview.display_order,
            ClientReview.id,
        )
        .all()
    )

# =====================================================
# PUBLIC - CLIENTS
# =====================================================

@app.get(
    "/api/clients",
    response_model=list[ClientResponse],
)
def get_clients(
    db: Session = Depends(get_db),
):
    return (
        db.query(Client)
        .filter(
            Client.is_active == True
        )
        .order_by(
            Client.display_order,
            Client.id,
        )
        .all()
    )

# =====================================================
# ADMIN - CLIENTS
# =====================================================

@app.get(
    "/api/admin/clients",
    response_model=list[ClientResponse],
)
def admin_get_clients(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    return (
        db.query(Client)
        .order_by(
            Client.display_order,
            Client.id,
        )
        .all()
    )


@app.post(
    "/api/admin/clients",
    response_model=ClientResponse,
)
def admin_create_client(
    data: ClientCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    client = Client(
        name=data.name,
        logo_url=data.logo_url,
        is_active=data.is_active,
        display_order=data.display_order,
        created_at=datetime.now().isoformat(),
    )

    db.add(client)
    db.commit()
    db.refresh(client)

    return client


@app.put(
    "/api/admin/clients/{client_id}",
    response_model=ClientResponse,
)
def admin_update_client(
    client_id: int,
    data: ClientUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    client = (
        db.query(Client)
        .filter(
            Client.id == client_id
        )
        .first()
    )

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found.",
        )

    updates = data.model_dump(
        exclude_unset=True
    )

    for key, value in updates.items():
        setattr(client, key, value)

    db.commit()
    db.refresh(client)

    return client


@app.delete(
    "/api/admin/clients/{client_id}"
)
def admin_delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    client = (
        db.query(Client)
        .filter(
            Client.id == client_id
        )
        .first()
    )

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found.",
        )

    db.delete(client)
    db.commit()

    return {
        "message": "Client deleted successfully"
    }

# =====================================================
# ADMIN - CLIENT LOGO UPLOAD
# =====================================================

@app.post("/api/admin/clients/upload-logo")
def upload_client_logo(
    file: UploadFile = File(...),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".svg",
    }

    original_name = file.filename or ""
    extension = os.path.splitext(
        original_name
    )[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, JPEG, PNG, WEBP, "
                "and SVG images are allowed."
            ),
        )

    upload_directory = "uploads/clients"
    os.makedirs(
        upload_directory,
        exist_ok=True,
    )

    filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    file_path = os.path.join(
        upload_directory,
        filename,
    )

    with open(file_path, "wb") as buffer:
        buffer.write(
            file.file.read()
        )

    return {
        "image_url": (
            f"/uploads/clients/{filename}"
        )
    }


# =====================================================
# ADMIN - CLIENT REVIEWS
# =====================================================

@app.get(
    "/api/admin/reviews",
    response_model=list[ClientReviewResponse],
)
def admin_get_reviews(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    return (
        db.query(ClientReview)
        .order_by(
            ClientReview.display_order,
            ClientReview.id,
        )
        .all()
    )


@app.post(
    "/api/admin/reviews",
    response_model=ClientReviewResponse,
)
def admin_create_review(
    data: ClientReviewCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 1 and 5.",
        )

    review = ClientReview(
        client_name=data.client_name,
        designation=data.designation,
        rating=data.rating,
        review=data.review,
        photo_url=data.photo_url,
        is_published=data.is_published,
        display_order=data.display_order,
        created_at=datetime.now().isoformat(),
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@app.put(
    "/api/admin/reviews/{review_id}",
    response_model=ClientReviewResponse,
)
def admin_update_review(
    review_id: int,
    data: ClientReviewUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    review = (
        db.query(ClientReview)
        .filter(
            ClientReview.id == review_id
        )
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found.",
        )

    updates = data.model_dump(
        exclude_unset=True
    )

    if "rating" in updates:
        if updates["rating"] < 1 or updates["rating"] > 5:
            raise HTTPException(
                status_code=400,
                detail="Rating must be between 1 and 5.",
            )

    for key, value in updates.items():
        setattr(review, key, value)

    db.commit()
    db.refresh(review)

    return review


@app.delete(
    "/api/admin/reviews/{review_id}"
)
def admin_delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    review = (
        db.query(ClientReview)
        .filter(
            ClientReview.id == review_id
        )
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found.",
        )

    db.delete(review)
    db.commit()

    return {
        "message": "Review deleted successfully"
    }

@app.post(
    "/api/admin/reviews/upload-photo"
)
def upload_review_photo(
    file: UploadFile = File(...),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    original_name = file.filename or ""
    extension = os.path.splitext(
        original_name
    )[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG, and WEBP images are allowed.",
        )

    upload_directory = "uploads/reviews"

    os.makedirs(
        upload_directory,
        exist_ok=True,
    )

    filename = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    file_path = os.path.join(
        upload_directory,
        filename,
    )

    with open(file_path, "wb") as buffer:
        buffer.write(
            file.file.read()
        )

    return {
        "image_url":
            f"/uploads/reviews/{filename}"
    }

# =====================================================
# STARTUP
# =====================================================

@app.on_event("startup")
def startup():
    db = next(get_db())

    try:
        seed_services(db)
    finally:
        db.close()


# =====================================================
# ADMIN AUTHENTICATION
# =====================================================

@app.post("/api/auth/login")
def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    admin = (
        db.query(AdminUser)
        .filter(
            AdminUser.username == form_data.username
        )
        .first()
    )

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=403,
            detail="This admin account is inactive",
        )

    if not verify_password(
        form_data.password,
        admin.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    token = create_access_token(
        {
            "sub": admin.username,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": admin.username,
    }


# =====================================================
# ADMIN USER MANAGEMENT
# =====================================================

@app.get(
    "/api/admin/users",
    response_model=list[AdminUserResponse],
)
def get_admin_users(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    return (
        db.query(AdminUser)
        .order_by(AdminUser.id.asc())
        .all()
    )


@app.post(
    "/api/admin/users",
    response_model=AdminUserResponse,
)
def create_admin_user(
    data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    username = data.username.strip()

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username is required",
        )

    if not data.password:
        raise HTTPException(
            status_code=400,
            detail="Password is required",
        )

    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters",
        )

    existing = (
        db.query(AdminUser)
        .filter(
            AdminUser.username == username
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    user = AdminUser(
        username=username,
        password_hash=hash_password(
            data.password
        ),
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@app.put(
    "/api/admin/users/{user_id}",
    response_model=AdminUserResponse,
)
def update_admin_user(
    user_id: int,
    data: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    user = (
        db.query(AdminUser)
        .filter(
            AdminUser.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Admin user not found",
        )

    updates = data.model_dump(
        exclude_unset=True
    )

    # -----------------------------
    # USERNAME
    # -----------------------------

    if "username" in updates:
        username = (
            updates["username"] or ""
        ).strip()

        if not username:
            raise HTTPException(
                status_code=400,
                detail="Username cannot be empty",
            )

        existing = (
            db.query(AdminUser)
            .filter(
                AdminUser.username == username,
                AdminUser.id != user_id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Username already exists",
            )

        user.username = username

    # -----------------------------
    # PASSWORD
    # -----------------------------

    if "password" in updates:
        password = updates["password"]

        if password:
            if len(password) < 8:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Password must be at least "
                        "8 characters"
                    ),
                )

            user.password_hash = hash_password(
                password
            )

    # -----------------------------
    # ACTIVE STATUS
    # -----------------------------

    if "is_active" in updates:
        requested_active = updates[
            "is_active"
        ]

        if (
            requested_active is False
            and user.is_active
        ):
            active_count = (
                db.query(AdminUser)
                .filter(
                    AdminUser.is_active == True
                )
                .count()
            )

            if active_count <= 1:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "The last active admin "
                        "cannot be disabled"
                    ),
                )

            user.is_active = False

        else:
            user.is_active = requested_active

    db.commit()
    db.refresh(user)

    return user


@app.delete(
    "/api/admin/users/{user_id}"
)
def delete_admin_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    user = (
        db.query(AdminUser)
        .filter(
            AdminUser.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Admin user not found",
        )

    total_users = (
        db.query(AdminUser).count()
    )

    # NEVER DELETE THE LAST ADMIN
    if total_users <= 1:
        raise HTTPException(
            status_code=400,
            detail=(
                "The last admin user "
                "cannot be deleted"
            ),
        )

    # DON'T ALLOW SELF DELETE
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail=(
                "You cannot delete "
                "your own account"
            ),
        )

    db.delete(user)
    db.commit()

    return {
        "message": (
            "Admin user deleted successfully"
        )
    }

# =====================================================
# SITE SETTINGS
# =====================================================

SITE_SETTING_KEYS = [
    "site_name",
    "logo_url",
    "favicon_url",
    "home_background",
    "home_intro_image",
    "about_background",
    "services_background",
    "offers_background",
    "contact_background",
    "contact_phone",
    "contact_email",
    "contact_address",
    "contact_whatsapp",
    "contact_hours",
]


def get_site_settings_dict(db: Session):
    rows = (
        db.query(SiteSetting)
        .filter(
            SiteSetting.key.in_(SITE_SETTING_KEYS)
        )
        .all()
    )

    settings = {
        key: None
        for key in SITE_SETTING_KEYS
    }

    for row in rows:
        settings[row.key] = row.value

    return settings


@app.get(
    "/api/site-settings",
    response_model=SiteSettingsResponse,
)
def get_site_settings(
    db: Session = Depends(get_db),
):
    return get_site_settings_dict(db)


@app.get(
    "/api/admin/site-settings",
    response_model=SiteSettingsResponse,
)
def admin_get_site_settings(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    return get_site_settings_dict(db)


@app.put(
    "/api/admin/site-settings",
    response_model=SiteSettingsResponse,
)
def update_site_settings(
    data: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    update_data = data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setting = (
            db.query(SiteSetting)
            .filter(
                SiteSetting.key == key
            )
            .first()
        )

        if setting:
            setting.value = value
        else:
            setting = SiteSetting(
                key=key,
                value=value,
            )
            db.add(setting)

    db.commit()

    return get_site_settings_dict(db)


@app.post(
    "/api/admin/site-settings/upload"
)
async def upload_site_setting_image(
    setting_key: str,
    file: UploadFile = File(...),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    allowed_keys = {
        "logo_url",
        "favicon_url",
        "home_background",
        "home_intro_image",
        "about_background",
        "services_background",
        "offers_background",
        "contact_background",
    }

    if setting_key not in allowed_keys:
        raise HTTPException(
            status_code=400,
            detail="Invalid site image setting.",
        )

    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/x-icon": ".ico",
        "image/vnd.microsoft.icon": ".ico",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, PNG, WEBP, and ICO "
                "images are allowed."
            ),
        )

    extension = allowed_types[
        file.content_type
    ]

    filename = (
        f"{uuid4().hex}{extension}"
    )

    file_path = os.path.join(
        SITE_UPLOAD_DIR,
        filename,
    )

    try:
        contents = await file.read()

        max_size = 10 * 1024 * 1024

        if len(contents) > max_size:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Image must be smaller "
                    "than 10 MB."
                ),
            )

        with open(
            file_path,
            "wb",
        ) as buffer:
            buffer.write(contents)

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to save image: {error}"
            ),
        )

    image_url = (
        f"/uploads/site/{filename}"
    )

    return {
        "setting_key": setting_key,
        "image_url": image_url,
    }

# =====================================================
# PUBLIC CONTACT ENQUIRIES
# =====================================================

@app.post(
    "/api/contact",
    response_model=ContactEnquiryResponse,
)
def create_contact_enquiry(
    data: ContactEnquiryCreate,
    db: Session = Depends(get_db),
):
    name = data.name.strip()
    phone = data.phone.strip()
    email = data.email.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required.",
        )

    if not phone:
        raise HTTPException(
            status_code=400,
            detail="Phone is required.",
        )

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email is required.",
        )

    enquiry = ContactEnquiry(
        name=name,
        phone=phone,
        email=email,
        research_area=(
            data.research_area.strip()
            if data.research_area
            else None
        ),
        service=(
            data.service.strip()
            if data.service
            else None
        ),
        research_stage=(
            data.research_stage.strip()
            if data.research_stage
            else None
        ),
        message=(
            data.message.strip()
            if data.message
            else None
        ),
        status="New",
        created_at=datetime.now().isoformat(),
    )

    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    return enquiry

# =====================================================
# ADMIN - CONTACT ENQUIRIES
# =====================================================

@app.get(
    "/api/admin/contact",
    response_model=list[ContactEnquiryResponse],
)
def get_contact_enquiries(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    return (
        db.query(ContactEnquiry)
        .order_by(
            ContactEnquiry.id.desc()
        )
        .all()
    )


@app.get(
    "/api/admin/contact/{enquiry_id}",
    response_model=ContactEnquiryResponse,
)
def get_contact_enquiry(
    enquiry_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    enquiry = (
        db.query(ContactEnquiry)
        .filter(
            ContactEnquiry.id == enquiry_id
        )
        .first()
    )

    if not enquiry:
        raise HTTPException(
            status_code=404,
            detail="Contact enquiry not found.",
        )

    return enquiry


@app.put(
    "/api/admin/contact/{enquiry_id}",
    response_model=ContactEnquiryResponse,
)
def update_contact_enquiry(
    enquiry_id: int,
    data: ContactEnquiryUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    enquiry = (
        db.query(ContactEnquiry)
        .filter(
            ContactEnquiry.id == enquiry_id
        )
        .first()
    )

    if not enquiry:
        raise HTTPException(
            status_code=404,
            detail="Contact enquiry not found.",
        )

    if data.status is not None:
        allowed_statuses = {
            "New",
            "Contacted",
            "In Progress",
            "Completed",
        }

        if data.status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid status. Use New, Contacted, "
                    "In Progress, or Completed."
                ),
            )

        enquiry.status = data.status

    db.commit()
    db.refresh(enquiry)

    return enquiry


@app.delete(
    "/api/admin/contact/{enquiry_id}"
)
def delete_contact_enquiry(
    enquiry_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    enquiry = (
        db.query(ContactEnquiry)
        .filter(
            ContactEnquiry.id == enquiry_id
        )
        .first()
    )

    if not enquiry:
        raise HTTPException(
            status_code=404,
            detail="Contact enquiry not found.",
        )

    db.delete(enquiry)
    db.commit()

    return {
        "message": "Contact enquiry deleted successfully"
    }

# =====================================================
# ADMIN - CATEGORIES
# =====================================================

@app.get("/api/admin/categories")
def admin_get_categories(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    return (
        db.query(ServiceCategory)
        .order_by(ServiceCategory.id)
        .all()
    )


@app.post("/api/admin/categories")
def admin_create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    existing = (
        db.query(ServiceCategory)
        .filter(
            ServiceCategory.name == data.name
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Category already exists",
        )

    category = ServiceCategory(
        name=data.name,
        description=data.description,
        icon=data.icon,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@app.put(
    "/api/admin/categories/{category_id}"
)
def admin_update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    category = (
        db.query(ServiceCategory)
        .filter(
            ServiceCategory.id == category_id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    for key, value in data.model_dump(
        exclude_unset=True
    ).items():
        setattr(
            category,
            key,
            value
        )

    db.commit()
    db.refresh(category)

    return category


@app.delete(
    "/api/admin/categories/{category_id}"
)
def admin_delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    category = (
        db.query(ServiceCategory)
        .filter(
            ServiceCategory.id == category_id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    db.delete(category)
    db.commit()

    return {
        "message": "Category deleted"
    }


# =====================================================
# ADMIN - SERVICES
# =====================================================

@app.get("/api/admin/services")
def admin_get_services(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    return (
        db.query(Service)
        .order_by(
            Service.category_id,
            Service.display_order,
        )
        .all()
    )


@app.post("/api/admin/services")
def admin_create_service(
    data: ServiceCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    category = (
        db.query(ServiceCategory)
        .filter(
            ServiceCategory.id
            == data.category_id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    service = Service(
        category_id=data.category_id,
        name=data.name,
        description=data.description,
        display_order=data.display_order,
    )

    db.add(service)
    db.commit()
    db.refresh(service)

    return service


@app.put(
    "/api/admin/services/{service_id}"
)
def admin_update_service(
    service_id: int,
    data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    service = (
        db.query(Service)
        .filter(
            Service.id == service_id
        )
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    for key, value in data.model_dump(
        exclude_unset=True
    ).items():
        setattr(
            service,
            key,
            value
        )

    db.commit()
    db.refresh(service)

    return service


@app.delete(
    "/api/admin/services/{service_id}"
)
def admin_delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    service = (
        db.query(Service)
        .filter(
            Service.id == service_id
        )
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    db.delete(service)
    db.commit()

    return {
        "message": "Service deleted"
    }


# =====================================================
# PUBLIC BLOG
# =====================================================

@app.get(
    "/api/blog",
    response_model=list[BlogPostResponse],
)
def get_blog_posts(
    db: Session = Depends(get_db),
):
    return (
        db.query(models.BlogPost)
        .filter(
            models.BlogPost.is_published == True
        )
        .order_by(
            models.BlogPost.display_order.asc(),
            models.BlogPost.id.desc(),
        )
        .all()
    )


@app.get(
    "/api/blog/{slug}",
    response_model=BlogPostResponse,
)
def get_blog_post(
    slug: str,
    db: Session = Depends(get_db),
):
    post = (
        db.query(models.BlogPost)
        .filter(
            models.BlogPost.slug == slug,
            models.BlogPost.is_published == True,
        )
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Blog post not found",
        )

    return post


# =====================================================
# ADMIN BLOG - LIST
# =====================================================

@app.get(
    "/api/admin/blog",
    response_model=list[BlogPostResponse],
)
def get_admin_blog_posts(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    return (
        db.query(models.BlogPost)
        .order_by(
            models.BlogPost.display_order.asc(),
            models.BlogPost.id.desc(),
        )
        .all()
    )


# =====================================================
# ADMIN BLOG - IMAGE UPLOAD
# =====================================================

@app.post(
    "/api/admin/blog/upload-image"
)
async def upload_blog_image(
    file: UploadFile = File(...),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, PNG, and WEBP "
                "images are allowed."
            ),
        )

    extension = allowed_types[
        file.content_type
    ]

    filename = (
        f"{uuid4().hex}{extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        filename,
    )

    try:
        contents = await file.read()

        # 5 MB limit
        max_size = 5 * 1024 * 1024

        if len(contents) > max_size:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Image must be smaller "
                    "than 5 MB."
                ),
            )

        with open(
            file_path,
            "wb"
        ) as buffer:
            buffer.write(contents)

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to save image: {error}"
            ),
        )

    return {
        "image_url": (
            f"/uploads/blog/{filename}"
        )
    }


# =====================================================
# ADMIN BLOG - CREATE
# =====================================================

@app.post(
    "/api/admin/blog",
    response_model=BlogPostResponse,
)
def create_blog_post(
    blog_data: BlogPostCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    existing = (
        db.query(models.BlogPost)
        .filter(
            models.BlogPost.slug
            == blog_data.slug
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail=(
                "A blog post with this "
                "slug already exists"
            ),
        )

    now = datetime.now().isoformat()

    post = models.BlogPost(
        title=blog_data.title,
        slug=blog_data.slug,
        category=blog_data.category,
        excerpt=blog_data.excerpt,
        content=blog_data.content,
        featured_image=(
            blog_data.featured_image
        ),
        is_published=(
            blog_data.is_published
        ),
        display_order=(
            blog_data.display_order
        ),
        published_at=(
            now
            if blog_data.is_published
            else None
        ),
        created_at=now,
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    return post


# =====================================================
# ADMIN BLOG - UPDATE
# =====================================================

@app.put(
    "/api/admin/blog/{post_id}",
    response_model=BlogPostResponse,
)
def update_blog_post(
    post_id: int,
    blog_data: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    post = (
        db.query(models.BlogPost)
        .filter(
            models.BlogPost.id == post_id
        )
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Blog post not found",
        )

    update_data = blog_data.model_dump(
        exclude_unset=True
    )

    if "slug" in update_data:
        existing = (
            db.query(models.BlogPost)
            .filter(
                models.BlogPost.slug
                == update_data["slug"],
                models.BlogPost.id
                != post_id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail=(
                    "A blog post with this "
                    "slug already exists"
                ),
            )

    was_published = post.is_published

    for field, value in update_data.items():
        setattr(
            post,
            field,
            value
        )

    if (
        not was_published
        and post.is_published
    ):
        post.published_at = (
            datetime.now().isoformat()
        )

    if (
        was_published
        and not post.is_published
    ):
        post.published_at = None

    db.commit()
    db.refresh(post)

    return post


# =====================================================
# ADMIN BLOG - DELETE
# =====================================================

@app.delete(
    "/api/admin/blog/{post_id}"
)
def delete_blog_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(
        get_current_admin
    ),
):
    post = (
        db.query(models.BlogPost)
        .filter(
            models.BlogPost.id == post_id
        )
        .first()
    )

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Blog post not found",
        )

    db.delete(post)
    db.commit()

    return {
        "message": (
            "Blog post deleted successfully"
        )
    }