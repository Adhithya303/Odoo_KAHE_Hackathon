import pymysql
import os

def run_sql_file():
    # Attempt connecting to mysql without db first to create db
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='', # Attempt empty password first
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("Connected to MySQL successfully!")
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    try:
        with connection.cursor() as cursor:
            with open('traveloop_db_setup.sql', 'r', encoding='utf-8') as f:
                sql_file = f.read()
                
            # Split by ';' but be careful with ';' inside strings.
            # A simpler way since it's a DDL script is to just execute it if pymysql supports multi statements,
            # or split them by statements. Since pymysql by default doesn't allow multi statements, 
            # we need to pass client_flag=pymysql.constants.CLIENT.MULTI_STATEMENTS in connection.
            pass
    finally:
        connection.close()

if __name__ == "__main__":
    pass
