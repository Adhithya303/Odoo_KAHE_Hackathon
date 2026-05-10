import sys
import os

# Ensure the backend directory is in the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.destination import Destination
from seed_from_csv import get_image_url

def update_images():
    engine = create_engine(settings.DATABASE_URL, echo=False)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        from app.models.trip import Trip, TripStop, TripNote
        from app.models.budget import Expense, ExpenseCategory
        from app.models.activity import Activity, TripStopActivity
        from app.models.checklist import PackingChecklist, ChecklistCategory
        from app.models.community import CommunityPost, CommunityComment
        destinations = session.query(Destination).all()
        updated_count = 0
        for dest in destinations:
            if 'unsplash.com' not in dest.cover_image_url:
                print(f"Non-unsplash URL for {dest.name}: {dest.cover_image_url}")
            
            new_url = get_image_url(dest.name)
            if dest.cover_image_url != new_url:
                dest.cover_image_url = new_url
                updated_count += 1
        
        session.commit()
        print(f"Successfully updated cover images for {updated_count} destinations. Total destinations in DB: {len(destinations)}")
    except Exception as e:
        session.rollback()
        print(f"Error updating images: {e}")
    finally:
        session.close()

if __name__ == '__main__':
    update_images()
