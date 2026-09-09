from pydantic import BaseModel, ConfigDict
from typing import List, Optional

from pydantic import BaseModel, ConfigDict
from typing import Optional

from pydantic import BaseModel, ConfigDict
from typing import Optional


class AdminUserCreate(BaseModel):
    username: str
    password: str
class AdminUserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
class AdminUserResponse(BaseModel):
    id: int
    username: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
class ServiceCreate(BaseModel):
    category_id: int
    name: str
    description: Optional[str] = None
    display_order: int = 0

class ServiceUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class ServiceResponse(BaseModel):
    id: int
    category_id: int
    name: str
    description: Optional[str] = None
    display_order: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
    
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    display_order: int = 0

class ServiceResponse(ServiceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ServiceCategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    services: List[ServiceResponse] = []

    model_config = ConfigDict(from_attributes=True)
class BlogPostCreate(BaseModel):
    title: str
    slug: str
    category: Optional[str] = None
    excerpt: Optional[str] = None
    content: str
    featured_image: Optional[str] = None
    is_published: bool = False
    display_order: int = 0
class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featured_image: Optional[str] = None
    is_published: Optional[bool] = None
    display_order: Optional[int] = None

class BlogPostResponse(BaseModel):
    id: int
    title: str
    slug: str
    category: Optional[str] = None
    excerpt: Optional[str] = None
    content: str
    featured_image: Optional[str] = None
    is_published: bool
    display_order: int
    published_at: Optional[str] = None
    created_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SiteSettingsUpdate(BaseModel):
    site_name: Optional[str] = None

    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None

    home_background: Optional[str] = None
    home_intro_image: Optional[str] = None
    about_background: Optional[str] = None
    services_background: Optional[str] = None
    offers_background: Optional[str] = None
    contact_background: Optional[str] = None

    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_address: Optional[str] = None
    contact_whatsapp: Optional[str] = None
    contact_hours: Optional[str] = None

class SiteSettingsResponse(SiteSettingsUpdate):
    model_config = ConfigDict(from_attributes=True)

class ContactEnquiryCreate(BaseModel):
    name: str
    phone: str
    email: str
    research_area: Optional[str] = None
    service: Optional[str] = None
    research_stage: Optional[str] = None
    message: Optional[str] = None

class ContactEnquiryUpdate(BaseModel):
    status: Optional[str] = None
class ContactEnquiryResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str
    research_area: Optional[str] = None
    service: Optional[str] = None
    research_stage: Optional[str] = None
    message: Optional[str] = None
    status: str
    created_at: str

    model_config = ConfigDict(from_attributes=True)

class ClientReviewCreate(BaseModel):
    client_name: str
    designation: Optional[str] = None
    rating: int = 5
    review: str
    photo_url: Optional[str] = None
    is_published: bool = False
    display_order: int = 0
class ClientReviewUpdate(BaseModel):
    client_name: Optional[str] = None
    designation: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None
    photo_url: Optional[str] = None
    is_published: Optional[bool] = None
    display_order: Optional[int] = None
    created_at: Optional[str] = None

class ClientReviewResponse(BaseModel):
    id: int
    client_name: str
    designation: Optional[str] = None
    rating: int
    review: str
    photo_url: Optional[str] = None
    is_published: bool
    display_order: int
    created_at: str

    model_config = ConfigDict(from_attributes=True)

# =====================================================
# CLIENTS
# =====================================================

class ClientCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    is_active: bool = True
    display_order: int = 0


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None
class ClientResponse(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    is_active: bool
    display_order: int
    created_at: str

    model_config = ConfigDict(from_attributes=True)

# =====================================================
# OFFERS
# =====================================================

class OfferCreate(BaseModel):
    title: str
    description: Optional[str] = None

    discount_type: str = "percentage"
    discount_value: Optional[str] = None
    offer_code: Optional[str] = None

    start_date: str
    end_date: str

    cta_text: Optional[str] = "Get Started"
    cta_link: Optional[str] = "/contact"

    is_active: bool = True
    display_order: int = 0

class OfferUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

    discount_type: Optional[str] = None
    discount_value: Optional[str] = None
    offer_code: Optional[str] = None

    start_date: Optional[str] = None
    end_date: Optional[str] = None

    cta_text: Optional[str] = None
    cta_link: Optional[str] = None

    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class OfferResponse(BaseModel):
    id: int

    title: str
    description: Optional[str] = None

    discount_type: str
    discount_value: Optional[str] = None
    offer_code: Optional[str] = None

    start_date: str
    end_date: str

    cta_text: Optional[str] = None
    cta_link: Optional[str] = None

    is_active: bool
    display_order: int
    created_at: str

    model_config = ConfigDict(from_attributes=True)