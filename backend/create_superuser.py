"""
Script to create the initial superuser.
Run: python create_superuser.py
"""
import sys
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db.models import Base, User
from app.services.auth_service import get_password_hash, get_user_by_email

def create_superuser(email: str, password: str):
    """Create a superuser."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Check if superuser already exists
        existing_user = get_user_by_email(db, email)
        if existing_user:
            print(f"User with email {email} already exists!")
            return
        
        # Warn if password is too long (bcrypt has 72-byte limit)
        password_bytes = len(password.encode('utf-8'))
        if password_bytes > 72:
            print(f"Warning: Password is {password_bytes} bytes. Bcrypt will truncate to 72 bytes.")
            print("Consider using a shorter password for better security.")
        
        # Create superuser
        hashed_password = get_password_hash(password)
        user = User(
            email=email,
            hashed_password=hashed_password,
            is_superuser=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        print(f"Superuser created successfully with email: {email}")
    except Exception as e:
        print(f"Error creating superuser: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python create_superuser.py <email> <password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    create_superuser(email, password)

