import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from app.database import SessionLocal
from app.services.auth_service import register_user, create_access_token, create_refresh_token
from app.models.user import User
from app.models.preference import UserPreference
from app.models.destination import Destination
from app.models.trip import Trip
from app.models.community import CommunityPost
from app.models.activity import Activity
from app.models.budget import Expense
from app.models.checklist import PackingChecklist

def create_and_get_token():
    db = SessionLocal()
    try:
        email = "test@example.com"
        password = "password123"
        
        # Check if user already exists
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creating new user: {email}...")
            user = register_user(
                db=db,
                first_name="Test",
                last_name="User",
                email=email,
                password=password
            )
            print("User created successfully.")
        else:
            print(f"User {email} already exists.")
        
        # Generate tokens
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id, db)
        
        print("\n" + "="*50)
        print("AUTHENTICATION DETAILS")
        print("="*50)
        print(f"Email:    {email}")
        print(f"Password: {password}")
        print("-" * 50)
        print("ACCESS TOKEN (JWT):")
        print(access_token)
        print("-" * 50)
        print("REFRESH TOKEN:")
        print(refresh_token)
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_and_get_token()
