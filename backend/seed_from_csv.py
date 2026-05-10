#!/usr/bin/env python
"""Seed script to populate traveloop with destinations from travel_recommendation_dataset.csv."""

import csv
import sys
from collections import defaultdict
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.destination import Destination, TripType, GroupType, Month, RecommendationProfile
from app.models.trip import Trip, TripStop, TripNote
from app.models.budget import Expense, ExpenseCategory
from app.models.activity import Activity, TripStopActivity
from app.models.checklist import PackingChecklist, ChecklistCategory
from app.models.community import CommunityPost, CommunityComment

# Destination image mapping - curated Unsplash URLs
DESTINATION_IMAGES = {
    # Domestic
    "Pondicherry": "https://images.unsplash.com/photo-1516059912776-2ac2a1178d20?w=500",
    "Mathura Vrindavan": "https://images.unsplash.com/photo-1585572933382-6b7a5889a11b?w=500",
    "Hampi": "https://images.unsplash.com/photo-1566661139104-b0d43cbd2fa4?w=500",
    "Chopta": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Mysuru": "https://images.unsplash.com/photo-1551632786-1d13e6cbfa85?w=500",
    "Rann of Kutch": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=500",
    "Ziro Valley": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Ooty": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500",
    "Amritsar": "https://images.unsplash.com/photo-1585572933382-6b7a5889a11b?w=500",
    "Shimla": "https://images.unsplash.com/photo-1607080591335-e51df1bdc82f?w=500",
    "Varanasi": "https://images.unsplash.com/photo-1566661139104-b0d43cbd2fa4?w=500",
    "Manali": "https://images.unsplash.com/photo-1607080591335-e51df1bdc82f?w=500",
    "Spiti Valley": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Ladakh": "https://images.unsplash.com/photo-1626680880646-d4c5cc1d3d69?w=500",
    "Auli": "https://images.unsplash.com/photo-1607080591335-e51df1bdc82f?w=500",
    "Munnar": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500",
    "Meghalaya": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Coorg": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500",
    "Jaipur": "https://images.unsplash.com/photo-1599661046289-18ceddcdd56a?w=500",
    "Kerala": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500",
    "Sundarbans": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Rajasthan": "https://images.unsplash.com/photo-1599661046289-18ceddcdd56a?w=500",
    "Darjeeling": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Jim Corbett": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Kaziranga": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Andaman Islands": "https://images.unsplash.com/photo-1608508178256-c2b9ba69dce3?w=500",
    "Lakshadweep": "https://images.unsplash.com/photo-1608508178256-c2b9ba69dce3?w=500",
    "Goa": "https://images.unsplash.com/photo-1608508178256-c2b9ba69dce3?w=500",
    "Rishikesh": "https://images.unsplash.com/photo-1585572933382-6b7a5889a11b?w=500",
    "Tirupati": "https://images.unsplash.com/photo-1585572933382-6b7a5889a11b?w=500",
    
    # International
    "Iceland": "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500",
    "Morocco": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Norway": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Cambodia": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Dubai": "https://images.unsplash.com/photo-1512453329849-430a63602d4d?w=500",
    "Mauritius": "https://images.unsplash.com/photo-1608508178256-c2b9ba69dce3?w=500",
    "Zanzibar": "https://images.unsplash.com/photo-1608508178256-c2b9ba69dce3?w=500",
    "Seychelles": "https://images.unsplash.com/photo-1608508178256-c2b9ba69dce3?w=500",
    "Singapore": "https://images.unsplash.com/photo-1576808356033-121d374efada?w=500",
    "Peru": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Nepal": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Mexico": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Australia": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Philippines": "https://images.unsplash.com/photo-1608508178256-c2b9ba69dce3?w=500",
    "Japan": "https://images.unsplash.com/photo-1540959375944-7049f642e9d4?w=500",
    "Costa Rica": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Greece": "https://images.unsplash.com/photo-1606870373235-a659b2b81d7e?w=500",
    "Kenya": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Egypt": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Turkey": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Spain": "https://images.unsplash.com/photo-1569179242473-2e2c22e9a07f?w=500",
    "Malaysia": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Thailand": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Indonesia": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
    "Sri Lanka": "https://images.unsplash.com/photo-1608508178256-c2b9ba69dce3?w=500",
    "Bali": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
    "Maldives": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500",
    "Portugal": "https://images.unsplash.com/photo-1569179242473-2e2c22e9a07f?w=500",
    "Switzerland": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "New Zealand": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Vietnam": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "India": "https://images.unsplash.com/photo-1599661046289-18ceddcdd56a?w=500",
    "Jordan": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Italy": "https://images.unsplash.com/photo-1552832860-cfb67165eaf0?w=500",
    "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500",
    "Bhutan": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Tanzania": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "South Africa": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Czech Republic": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500",
    "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500",
    "Darjeeling": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
    "Mysuru": "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=500",
    "Andaman Islands": "https://images.unsplash.com/photo-1608508178256-c2b9ba69dce3?w=500",
    "Lakshadweep": "https://images.unsplash.com/photo-1608508178256-c2b9ba69dce3?w=500",
    "Coorg": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500",
    "Pondicherry": "https://images.unsplash.com/photo-1516059912776-2ac2a1178d20?w=500",
    "Tanzania": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500",
    "Sri Lanka": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    "Canada": "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?w=500",
}

def get_image_url(destination_name):
    """Get image URL for a destination, with fallback."""
    if destination_name in DESTINATION_IMAGES:
        return DESTINATION_IMAGES[destination_name]
    # Fallback: use provided fallback image for unmapped destinations
    return "https://images.unsplash.com/photo-1503152394-c571994fd383?w=500"


def seed_database():
    """Populate the database with destinations from CSV."""
    engine = create_engine(settings.DATABASE_URL, echo=False)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Seed lookup tables used by preferences and recommendations
        trip_types_data = [
            "Adventure", "Beach", "Cultural", "Nature", "Relaxation",
            "Luxury", "Pilgrimage", "Wildlife", "Romantic", "Family",
            "Food", "Shopping", "Heritage", "Spiritual", "Trekking",
        ]
        trip_type_map = {}
        for tt_name in trip_types_data:
            existing = session.query(TripType).filter(TripType.name == tt_name).first()
            if not existing:
                tt = TripType(name=tt_name)
                session.add(tt)
                session.flush()
                trip_type_map[tt_name] = tt
            else:
                trip_type_map[tt_name] = existing
        session.commit()

        group_types_data = ["Solo", "Couple", "Friends", "Family"]
        group_type_map = {}
        for gt_name in group_types_data:
            existing = session.query(GroupType).filter(GroupType.name == gt_name).first()
            if not existing:
                gt = GroupType(name=gt_name)
                session.add(gt)
                session.flush()
                group_type_map[gt_name] = gt
            else:
                group_type_map[gt_name] = existing
        session.commit()

        month_map = {m.name: m for m in session.query(Month).all()}
        if not month_map:
            month_names = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December",
            ]
            for idx, month_name in enumerate(month_names, start=1):
                month = Month(id=idx, name=month_name)
                session.add(month)
                session.flush()
                month_map[month_name] = month
            session.commit()

        # Parse CSV and populate destinations
        csv_path = "../travel_recommendation_dataset.csv"
        destinations_processed = set()
        recommendation_rows = []
        destinations_count = 0

        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    dest_name = row['recommended_destination'].strip()
                    
                    # Skip if already processed
                    if dest_name in destinations_processed:
                        continue
                    
                    # Check if destination exists
                    existing = session.query(Destination).filter(Destination.name == dest_name).first()
                    if existing:
                        destinations_processed.add(dest_name)
                        continue

                    trip_types = [t.strip() for t in row['trip_type'].split(',') if t.strip()]
                    group_types = [g.strip() for g in row['group_type'].split(',') if g.strip()]
                    travel_months = [m.strip() for m in row['travel_month'].split(',') if m.strip()]

                    # Create destination
                    dest = Destination(
                        name=dest_name,
                        country="India" if row['trip_scope'].strip() == "Domestic" else None,
                        city=dest_name,
                        trip_scope=row['trip_scope'].strip(),
                        description=f"Top travel pick for {dest_name} based on user preferences",
                        cover_image_url=get_image_url(dest_name),
                        cost_index="Low" if int(float(row['min_budget'])) < 20000 else "Medium" if int(float(row['min_budget'])) < 90000 else "High",
                        popularity_score=95 if row['trip_scope'].strip() == "Domestic" and len(trip_types) >= 2 else 85,
                        avg_min_budget=int(float(row['min_budget'])) if row['min_budget'] else 5000,
                        avg_max_budget=int(float(row['max_budget'])) if row['max_budget'] else 100000,
                        vibe_tags=", ".join(trip_types),
                        climate_tags="tropical,temperate,pleasant",
                    )
                    session.add(dest)
                    session.flush()

                    # Add trip types
                    for tt_name in trip_types:
                        if tt_name in trip_type_map:
                            dest.trip_types.append(trip_type_map[tt_name])

                    # Add group types
                    for gt_name in group_types:
                        if gt_name in group_type_map:
                            dest.group_types.append(group_type_map[gt_name])

                    # Add travel months
                    for month_name in travel_months:
                        month_obj = month_map.get(month_name)
                        if month_obj:
                            dest.travel_months.append(month_obj)

                    recommendation_rows.append({
                        "trip_scope": row['trip_scope'].strip(),
                        "trip_type_tags": ",".join(trip_types),
                        "min_budget": int(float(row['min_budget'])) if row['min_budget'] else 5000,
                        "max_budget": int(float(row['max_budget'])) if row['max_budget'] else 100000,
                        "group_type_tags": ",".join(group_types),
                        "travel_month_tags": ",".join(travel_months),
                        "recommended_destination": dest_name,
                    })

                    destinations_processed.add(dest_name)
                    destinations_count += 1
                    
                    if destinations_count % 50 == 0:
                        session.commit()
                        print(f"[*] Processed {destinations_count} destinations...")

            # Seed recommendation profile rows used by ML fallback / debugging
            existing_profiles = {
                (p.trip_scope, p.trip_type_tags, p.min_budget, p.max_budget, p.group_type_tags, p.travel_month_tags, p.recommended_destination)
                for p in session.query(RecommendationProfile).all()
            }
            for rec in recommendation_rows:
                key = (
                    rec["trip_scope"], rec["trip_type_tags"], rec["min_budget"], rec["max_budget"],
                    rec["group_type_tags"], rec["travel_month_tags"], rec["recommended_destination"],
                )
                if key not in existing_profiles:
                    session.add(RecommendationProfile(**rec))

            session.commit()
            print(f"[*] Seeded {destinations_count} unique destinations with images from CSV")
            print(f"[*] Seeded {len(recommendation_rows)} recommendation rows")
            
        except FileNotFoundError:
            print(f"[!] CSV file not found at {csv_path}")
            print("  Expected location: backend/travel_recommendation_dataset.csv")
            session.close()
            sys.exit(1)

        session.close()
    except Exception as e:
        session.rollback()
        print(f"[!] Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    seed_database()
