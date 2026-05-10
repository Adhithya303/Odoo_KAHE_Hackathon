import csv
import re

with open('backend/seed_from_csv.py', encoding='utf-8') as f:
    content = f.read()

destinations_in_file = set(re.findall(r'"([^"]+)": "http', content))

missing = set()
with open('travel_recommendation_dataset.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        dest = row['recommended_destination'].strip()
        if dest not in destinations_in_file:
            missing.add(dest)

print("Missing:", missing)
