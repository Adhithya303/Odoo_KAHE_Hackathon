import requests
import sys
sys.path.append('.')
from backend.seed_from_csv import DESTINATION_IMAGES

failed = []
for dest, url in DESTINATION_IMAGES.items():
    try:
        r = requests.head(url, allow_redirects=True, timeout=5)
        if r.status_code != 200:
            failed.append((dest, url, r.status_code))
            print(f"Failed {dest}: {r.status_code}")
    except Exception as e:
        failed.append((dest, url, str(e)))
        print(f"Error {dest}: {e}")

print("Total failed:", len(failed))
if failed:
    print(failed)
