"""
traveloop_seed_dataset.py
--------------------------
Run this AFTER traveloop_db_setup.sql to load all 803 rows from the
travel_recommendation_dataset.csv into MySQL.

Usage:
	pip install pandas mysql-connector-python
	python traveloop_seed_dataset.py

Set your MySQL credentials in the DB_CONFIG dict below.
"""

import pandas as pd
import mysql.connector

# -- Configure your MySQL connection -------------------------
DB_CONFIG = {
	"host":     "localhost",
	"port":     3306,
	"user":     "root",
	"password": "Adhianu@2886",
	"database": "traveloop",
}
CSV_PATH = "test/travel_recommendation_dataset.csv"
# ------------------------------------------------------------


def get_or_create_id(cursor, table, column, value):
	"""Return the id of an existing row, or insert and return the new id."""
	cursor.execute(f"SELECT id FROM {table} WHERE {column} = %s", (value,))
	row = cursor.fetchone()
	if row:
		return row[0]
	cursor.execute(f"INSERT INTO {table} ({column}) VALUES (%s)", (value,))
	return cursor.lastrowid


def seed(csv_path: str, config: dict):
	df = pd.read_csv(csv_path)
	print(f"Loaded {len(df)} rows from {csv_path}")

	conn = mysql.connector.connect(**config)
	cursor = conn.cursor()

	# -- 1. Seed recommendation_profiles (raw, all 803 rows) --
	print("Seeding recommendation_profiles ...")
	insert_profile = """
		INSERT IGNORE INTO recommendation_profiles
			(trip_scope, trip_type_tags, min_budget, max_budget,
			 group_type_tags, travel_month_tags, recommended_destination)
		VALUES (%s, %s, %s, %s, %s, %s, %s)
	"""
	records = [
		(
			row["trip_scope"],
			row["trip_type"],
			int(row["min_budget"]),
			int(row["max_budget"]),
			row["group_type"],
			row["travel_month"],
			row["recommended_destination"],
		)
		for _, row in df.iterrows()
	]
	cursor.executemany(insert_profile, records)
	conn.commit()
	print(f"  OK {cursor.rowcount} rows inserted into recommendation_profiles")

	# -- 2. Seed destinations with avg budgets ----------------
	print("Updating destinations with avg budgets from dataset ...")
	dest_stats = (
		df.groupby("recommended_destination")
		  .agg(avg_min=("min_budget", "mean"), avg_max=("max_budget", "mean"))
		  .reset_index()
	)
	update_dest = """
		UPDATE destinations
		SET avg_min_budget = %s, avg_max_budget = %s
		WHERE name = %s
	"""
	for _, row in dest_stats.iterrows():
		cursor.execute(update_dest, (
			int(row["avg_min"]),
			int(row["avg_max"]),
			row["recommended_destination"],
		))
	conn.commit()
	print(f"  OK Updated {len(dest_stats)} destination budget averages")

	# -- 3. Seed destination_trip_types (normalized) ----------
	print("Seeding destination_trip_types ...")
	cursor.execute("SELECT id, name FROM destinations")
	dest_map = {name: did for did, name in cursor.fetchall()}

	cursor.execute("SELECT id, name FROM trip_types")
	type_map = {name: tid for tid, name in cursor.fetchall()}

	dt_pairs = set()
	for _, row in df.iterrows():
		dest = row["recommended_destination"]
		dest_id = dest_map.get(dest)
		if not dest_id:
			continue
		for t in str(row["trip_type"]).split(","):
			t = t.strip()
			type_id = type_map.get(t)
			if type_id:
				dt_pairs.add((dest_id, type_id))

	cursor.executemany(
		"INSERT IGNORE INTO destination_trip_types (destination_id, trip_type_id) VALUES (%s, %s)",
		list(dt_pairs),
	)
	conn.commit()
	print(f"  OK {len(dt_pairs)} destination-trip_type pairs")

	# -- 4. Seed destination_group_types (normalized) ---------
	print("Seeding destination_group_types ...")
	cursor.execute("SELECT id, name FROM group_types")
	grp_map = {name: gid for gid, name in cursor.fetchall()}

	dg_pairs = set()
	for _, row in df.iterrows():
		dest_id = dest_map.get(row["recommended_destination"])
		if not dest_id:
			continue
		for g in str(row["group_type"]).split(","):
			g = g.strip()
			gid = grp_map.get(g)
			if gid:
				dg_pairs.add((dest_id, gid))

	cursor.executemany(
		"INSERT IGNORE INTO destination_group_types (destination_id, group_type_id) VALUES (%s, %s)",
		list(dg_pairs),
	)
	conn.commit()
	print(f"  OK {len(dg_pairs)} destination-group_type pairs")

	# -- 5. Seed destination_travel_months (normalized) ------
	print("Seeding destination_travel_months ...")
	cursor.execute("SELECT id, name FROM months")
	month_map = {name: mid for mid, name in cursor.fetchall()}

	dm_pairs = set()
	for _, row in df.iterrows():
		dest_id = dest_map.get(row["recommended_destination"])
		if not dest_id:
			continue
		for m in str(row["travel_month"]).split(","):
			m = m.strip()
			mid = month_map.get(m)
			if mid:
				dm_pairs.add((dest_id, mid))

	cursor.executemany(
		"INSERT IGNORE INTO destination_travel_months (destination_id, month_id) VALUES (%s, %s)",
		list(dm_pairs),
	)
	conn.commit()
	print(f"  OK {len(dm_pairs)} destination-travel_month pairs")

	cursor.close()
	conn.close()
	print("\nOK Seeding complete!")


if __name__ == "__main__":
	seed(CSV_PATH, DB_CONFIG)
