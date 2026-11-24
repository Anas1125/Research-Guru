from sqlalchemy import Column, BigInteger, Integer, String, Text, Boolean, ForeignKey, LargeBinary, DateTime, func
from sqlalchemy.orm import relationship

from database import Base


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)

    services = relationship(
        "Service",
        back_populates="category",
        cascade="all, delete-orphan",
    )


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(
        Integer,
        ForeignKey("service_categories.id"),
        nullable=False,
    )
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

    category = relationship(
        "ServiceCategory",
        back_populates="services",
    )


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

class SiteSetting(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)

    category = Column(String(100), nullable=True)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)

    featured_image = Column(String(500), nullable=True)

    is_published = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)

    published_at = Column(String(50), nullable=True)
    created_at = Column(String(50), nullable=True)

class ContactEnquiry(Base):
    __tablename__ = "contact_enquiries"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)

    research_area = Column(String(200), nullable=True)
    service = Column(String(200), nullable=True)
    research_stage = Column(String(200), nullable=True)

    message = Column(Text, nullable=True)

    coupon = Column(
        String(100),
        nullable=True,
    )

    status = Column(
        String(50),
        nullable=False,
        default="New",
    )

    created_at = Column(
        String(50),
        nullable=False,
    )

class ClientReview(Base):
    __tablename__ = "client_reviews"

    id = Column(Integer, primary_key=True, index=True)

    client_name = Column(String(200), nullable=False)
    designation = Column(String(200), nullable=True)

    rating = Column(Integer, nullable=False, default=5)
    review = Column(Text, nullable=False)

    photo_url = Column(String(500), nullable=True)

    is_published = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)

    created_at = Column(String(50), nullable=False)

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(200), nullable=False)

    logo_url = Column(String(500), nullable=True)

    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

    created_at = Column(String(50), nullable=False)

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    discount_type = Column(
        String(50),
        nullable=False,
        default="percentage",
    )

    discount_value = Column(
        String(50),
        nullable=True,
    )

    offer_code = Column(
        String(100),
        nullable=True,
    )

    start_date = Column(
        String(50),
        nullable=False,
    )

    end_date = Column(
        String(50),
        nullable=False,
    )

    cta_text = Column(
        String(100),
        nullable=True,
        default="Get Started",
    )

    cta_link = Column(
        String(500),
        nullable=True,
        default="/contact",
    )

    is_active = Column(
        Boolean,
        default=True,
    )

    display_order = Column(
        Integer,
        default=0,
    )

    created_at = Column(
        String(50),
        nullable=False,
    )

class StoredFile(Base):
    """
    Uploaded images kept in the database (Neon PostgreSQL in
    production) so they persist on Vercel's read-only,
    ephemeral serverless filesystem.
    """

    __tablename__ = "stored_files"

    id = Column(String(32), primary_key=True)
    folder = Column(String(50), nullable=False, index=True)
    filename = Column(String(100), nullable=False)
    original_name = Column(String(255), nullable=True)
    content_type = Column(String(100), nullable=False)
    size = Column(Integer, nullable=False)
    data = Column(LargeBinary, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


class RateLimitBucket(Base):
    """Shared, short-lived counters for serverless API rate limits."""
    __tablename__ = "rate_limit_buckets"

    key = Column(String(64), primary_key=True)
    window_start = Column(BigInteger, primary_key=True)
    expires_at = Column(BigInteger, nullable=False, index=True)
    count = Column(Integer, nullable=False)


class AdminSession(Base):
    """Opaque, revocable administrator sessions; only token digests persist."""
    __tablename__ = "admin_sessions"

    token_hash = Column(String(64), primary_key=True)
    admin_id = Column(Integer, ForeignKey("admin_users.id", ondelete="CASCADE"), nullable=False, index=True)
    binding = Column(String(64), nullable=False)
    expires_at = Column(BigInteger, nullable=False, index=True)
