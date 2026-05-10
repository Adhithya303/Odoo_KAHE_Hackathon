#!/usr/bin/env python
"""Seed script to populate traveloop database with destinations and images."""

import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.destination import Destination, TripType, GroupType, Month
from app.models.preference import UserPreference

# Destination data with images (Unsplash/Wikimedia URLs)
DESTINATIONS_DATA = [
    {
        "name": "Goa",
        "country": "India",
        "city": "Goa",
        "trip_scope": "Domestic",
        "description": "Tropical paradise with beaches, water sports, and vibrant nightlife",
        "cover_image_url": "https://images.unsplash.com/photo-1608508178256-c2b9ba69dce3?w=500",
        "cost_index": "Medium",
        "popularity_score": 95,
        "avg_min_budget": 8000,
        "avg_max_budget": 30000,
        "vibe_tags": "beach,party,relaxation,seafood,adventure",
        "climate_tags": "tropical,humid,warm",
        "trip_types": ["Beach", "Relaxation", "Adventure"],
    },
    {
        "name": "Kerala",
        "country": "India",
        "city": "Kochi",
        "trip_scope": "Domestic",
        "description": "God's Own Country with backwaters, plantations, and peaceful landscapes",
        "cover_image_url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500",
        "cost_index": "Medium",
        "popularity_score": 90,
        "avg_min_budget": 9000,
        "avg_max_budget": 35000,
        "vibe_tags": "backwaters,ayurveda,nature,peaceful,relaxation",
        "climate_tags": "tropical,humid,green",
        "trip_types": ["Nature", "Relaxation", "Cultural"],
    },
    {
        "name": "Rajasthan",
        "country": "India",
        "city": "Jaipur",
        "trip_scope": "Domestic",
        "description": "Land of kings with magnificent forts, palaces, and desert landscapes",
        "cover_image_url": "https://images.unsplash.com/photo-1599661046289-18ceddcdd56a?w=500",
        "cost_index": "Low",
        "popularity_score": 88,
        "avg_min_budget": 7000,
        "avg_max_budget": 25000,
        "vibe_tags": "heritage,culture,desert,forts,palaces,history",
        "climate_tags": "arid,hot,dusty",
        "trip_types": ["Cultural", "Heritage", "Adventure"],
    },
    {
        "name": "Ladakh",
        "country": "India",
        "city": "Leh",
        "trip_scope": "Domestic",
        "description": "High-altitude adventure with mountains, monasteries, and pristine landscapes",
        "cover_image_url": "https://images.unsplash.com/photo-1626680880646-d4c5cc1d3d69?w=500",
        "cost_index": "Medium",
        "popularity_score": 92,
        "avg_min_budget": 10000,
        "avg_max_budget": 40000,
        "vibe_tags": "adventure,mountains,bikes,trekking,remote,nature",
        "climate_tags": "cold,dry,mountainous",
        "trip_types": ["Adventure", "Nature", "Trekking"],
    },
    {
        "name": "Manali",
        "country": "India",
        "city": "Manali",
        "trip_scope": "Domestic",
        "description": "Himalayan hill station perfect for adventure and scenic beauty",
        "cover_image_url": "https://images.unsplash.com/photo-1607080591335-e51df1bdc82f?w=500",
        "cost_index": "Medium",
        "popularity_score": 85,
        "avg_min_budget": 8000,
        "avg_max_budget": 28000,
        "vibe_tags": "mountains,snow,adventure,trekking,nature",
        "climate_tags": "cool,pleasant,snowy",
        "trip_types": ["Adventure", "Nature"],
    },
    {
        "name": "Varanasi",
        "country": "India",
        "city": "Varanasi",
        "trip_scope": "Domestic",
        "description": "Spiritual capital of India with ancient temples and Ganges ghats",
        "cover_image_url": "https://images.unsplash.com/photo-1566661139104-b0d43cbd2fa4?w=500",
        "cost_index": "Low",
        "popularity_score": 83,
        "avg_min_budget": 6000,
        "avg_max_budget": 20000,
        "vibe_tags": "spiritual,pilgrimage,culture,heritage,ghats",
        "climate_tags": "tropical,humid,warm",
        "trip_types": ["Pilgrimage", "Cultural", "Spiritual"],
    },
    {
        "name": "Paris",
        "country": "France",
        "city": "Paris",
        "trip_scope": "International",
        "description": "City of love and lights with iconic landmarks and world-class culture",
        "cover_image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500",
        "cost_index": "High",
        "popularity_score": 98,
        "avg_min_budget": 60000,
        "avg_max_budget": 200000,
        "vibe_tags": "romantic,culture,art,luxury,food,architecture",
        "climate_tags": "temperate,cool,moderate",
        "trip_types": ["Cultural", "Luxury", "Romantic"],
    },
    {
        "name": "Dubai",
        "country": "UAE",
        "city": "Dubai",
        "trip_scope": "International",
        "description": "Luxury shopping and modern architecture in the desert",
        "cover_image_url": "https://images.unsplash.com/photo-1512453329849-430a63602d4d?w=500",
        "cost_index": "High",
        "popularity_score": 94,
        "avg_min_budget": 70000,
        "avg_max_budget": 250000,
        "vibe_tags": "luxury,shopping,modern,desert,adventure",
        "climate_tags": "hot,arid,sunny",
        "trip_types": ["Luxury", "Shopping", "Adventure"],
    },
    {
        "name": "Bali",
        "country": "Indonesia",
        "city": "Denpasar",
        "trip_scope": "International",
        "description": "Tropical island paradise with beaches, temples, and rich culture",
        "cover_image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
        "cost_index": "Low",
        "popularity_score": 91,
        "avg_min_budget": 40000,
        "avg_max_budget": 120000,
        "vibe_tags": "beach,temple,culture,surfing,nature,relaxation",
        "climate_tags": "tropical,humid,warm",
        "trip_types": ["Beach", "Cultural", "Adventure"],
    },
    {
        "name": "Singapore",
        "country": "Singapore",
        "city": "Singapore",
        "trip_scope": "International",
        "description": "Ultra-modern city-state with great food and family attractions",
        "cover_image_url": "https://images.unsplash.com/photo-1576808356033-121d374efada?w=500",
        "cost_index": "High",
        "popularity_score": 86,
        "avg_min_budget": 50000,
        "avg_max_budget": 150000,
        "vibe_tags": "modern,food,family,clean,gardens,shopping",
        "climate_tags": "tropical,humid,warm",
        "trip_types": ["Family", "Food", "Shopping"],
    },
    {
        "name": "Maldives",
        "country": "Maldives",
        "city": "Male",
        "trip_scope": "International",
        "description": "Ultimate luxury beach destination with crystal-clear waters",
        "cover_image_url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500",
        "cost_index": "High",
        "popularity_score": 96,
        "avg_min_budget": 80000,
        "avg_max_budget": 300000,
        "vibe_tags": "beach,luxury,romantic,diving,relaxation",
        "climate_tags": "tropical,warm,sunny",
        "trip_types": ["Beach", "Luxury", "Romantic"],
    },
]

def seed_database():
    """Populate the database with destinations and related data."""
    engine = create_engine(settings.DATABASE_URL, echo=False)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Create trip types if they don't exist
        trip_types_data = ["Adventure", "Beach", "Cultural", "Nature", "Relaxation", "Luxury", "Pilgrimage", "Wildlife", "Romantic", "Family", "Food", "Shopping", "Heritage", "Spiritual", "Trekking"]
        for tt_name in trip_types_data:
            if not session.query(TripType).filter(TripType.name == tt_name).first():
                session.add(TripType(name=tt_name))
        session.commit()

        # Insert destinations
        for dest_data in DESTINATIONS_DATA:
            existing = session.query(Destination).filter(Destination.name == dest_data["name"]).first()
            if not existing:
                trip_types_names = dest_data.pop("trip_types", [])
                dest = Destination(**dest_data)
                session.add(dest)
                session.flush()

                # Link trip types
                for tt_name in trip_types_names:
                    tt = session.query(TripType).filter(TripType.name == tt_name).first()
                    if tt:
                        dest.trip_types.append(tt)

        session.commit()
        print(f"✓ Seeded {len(DESTINATIONS_DATA)} destinations with images")
        session.close()
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    seed_database()
