import getpass

from database import SessionLocal
from models import AdminUser
from auth import hash_password


def main():
    db = SessionLocal()

    try:
        username = input("Admin username: ").strip()

        if not username:
            print("Username cannot be empty.")
            return

        existing = (
            db.query(AdminUser)
            .filter(AdminUser.username == username)
            .first()
        )

        if existing:
            print("That username already exists.")
            return

        password = getpass.getpass("Admin password: ")
        confirm_password = getpass.getpass(
            "Confirm password: "
        )

        if password != confirm_password:
            print("Passwords do not match.")
            return

        if len(password) < 8:
            print("Password must be at least 8 characters.")
            return

        admin = AdminUser(
            username=username,
            password_hash=hash_password(password),
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print()
        print("Admin user created successfully.")
        print(f"Username: {username}")

    finally:
        db.close()


if __name__ == "__main__":
    main()