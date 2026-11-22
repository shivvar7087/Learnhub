import argparse
import getpass
import re
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, engine
from .models import User
from .security import hash_password


def main():
    parser = argparse.ArgumentParser(description="Create or promote a LearnHub administrator account.")
    parser.add_argument("email", help="Email address for the administrator")
    args = parser.parse_args()
    email = args.email.strip().lower()
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        parser.error("enter a valid email address")
    password = getpass.getpass("Admin password (12+ characters): ")
    if len(password) < 12:
        parser.error("password must be at least 12 characters")
    if password != getpass.getpass("Confirm admin password: "):
        parser.error("passwords do not match")

    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            user = User(
                id=str(uuid4()),
                name=email.split("@", 1)[0],
                email=email,
                password_hash=hash_password(password),
                role="admin",
            )
            db.add(user)
        else:
            user.password_hash = hash_password(password)
            user.role = "admin"
        db.commit()
    print(f"Administrator account provisioned for {email}.")


if __name__ == "__main__":
    main()
