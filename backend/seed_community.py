"""Seed sample community posts, comments, likes, and chat messages.

Recommended setup order:
1. Run `traveloop_db_setup.sql`
2. Run `backend/sql/community_chat_setup.sql`
3. Run this script: `python backend/seed_community.py`
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.database import SessionLocal, engine, Base
import app.models.user  # noqa
import app.models.trip  # noqa
import app.models.community  # noqa
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.models.user import User
from app.models.trip import Trip
from app.models.community import CommunityPost, CommunityComment, CommunityLike, CommunityChatMessage


POST_BODIES = [
    "Just wrapped up an amazing coastal trip. Sharing a few budget tips, local food stops, and places that were actually worth the hype.",
    "This mountain itinerary turned out better than expected. Early starts, light packing, and local transport made the whole trip smoother.",
    "If anyone is planning a short weekend escape, this route worked really well and stayed within budget without feeling rushed.",
]

CHAT_MESSAGES = [
    "Hi everyone! Any suggestions for a 3-day budget-friendly hill station trip?",
    "If you love local food, try to ask taxi drivers and homestay owners where they eat instead of searching only on maps.",
    "Best tip from my last trip: keep one flexible day in your itinerary.",
    "Does anyone have a good packing checklist for beach plus trekking in one trip?",
]


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS community_chat_messages (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                user_id INT UNSIGNED NOT NULL,
                room VARCHAR(50) NOT NULL DEFAULT 'general',
                content TEXT NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_room_created (room, created_at)
            )
        """))
        has_destination_tag = db.execute(text("SHOW COLUMNS FROM community_posts LIKE 'destination_tag'")).first()
        if not has_destination_tag:
            try:
                db.execute(text("ALTER TABLE community_posts ADD COLUMN destination_tag VARCHAR(100) NULL"))
            except SQLAlchemyError:
                db.rollback()
        db.commit()

        users = db.query(User).order_by(User.id).all()
        trips = db.query(Trip).order_by(Trip.id).all()

        if not users:
            print("No users found. Create users first, then rerun this script.")
            return

        if not trips:
            print("No trips found. Create or seed trips first, then rerun this script.")
            return

        if db.query(CommunityPost).first() or db.query(CommunityChatMessage).first():
            print("Community data already exists. Skipping to avoid duplicates.")
            return

        created_posts = []
        for index, trip in enumerate(trips[: min(3, len(trips))]):
            owner = next((u for u in users if u.id == trip.user_id), users[index % len(users)])
            title = f"{trip.name} Travel Notes"
            body = POST_BODIES[index % len(POST_BODIES)]
            destination_tag = None
            if trip.stops:
                first_stop = trip.stops[0]
                destination_tag = first_stop.destination.name if first_stop.destination else first_stop.custom_place

            post = CommunityPost(
                user_id=owner.id,
                trip_id=trip.id,
                title=title,
                body=body,
                destination_tag=destination_tag,
                cover_image_url=trip.cover_photo_url,
                is_published=True,
                views=10 + (index * 7),
            )
            db.add(post)
            db.flush()
            created_posts.append(post)

        for index, post in enumerate(created_posts):
            commenter = users[(index + 1) % len(users)]
            comment = CommunityComment(
                post_id=post.id,
                user_id=commenter.id,
                content="Love this plan. The pacing looks really practical and beginner-friendly.",
            )
            db.add(comment)

            liker = users[index % len(users)]
            like = CommunityLike(user_id=liker.id, post_id=post.id)
            db.add(like)

        for index, chat_text in enumerate(CHAT_MESSAGES):
            author = users[index % len(users)]
            msg = CommunityChatMessage(
                user_id=author.id,
                room="general",
                content=chat_text,
            )
            db.add(msg)

        db.commit()
        print(f"Seeded {len(created_posts)} community posts and {len(CHAT_MESSAGES)} chat messages.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
