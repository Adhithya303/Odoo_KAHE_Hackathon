import pymysql
import os
from pymysql.constants import CLIENT

def run_sql_file():
    # Attempt connecting to mysql
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='root',
            charset='utf8mb4',
            client_flag=CLIENT.MULTI_STATEMENTS
        )
        print("Connected to MySQL successfully!")
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    try:
        with connection.cursor() as cursor:
            print("Reading traveloop_db_setup.sql...")
            with open('traveloop_db_setup.sql', 'r', encoding='utf-8') as f:
                sql_file = f.read()
            
            print("Executing SQL file...")
            cursor.execute(sql_file)
            connection.commit()
            print("SQL file executed successfully.")
    except Exception as e:
        print(f"Failed to execute SQL: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    run_sql_file()
