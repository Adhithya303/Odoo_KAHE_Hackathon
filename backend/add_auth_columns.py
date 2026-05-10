import pymysql

def add_columns():
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='redwolf_8324',
            database='traveloop',
            charset='utf8mb4'
        )
        print("Connected to MySQL successfully!")
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    try:
        with connection.cursor() as cursor:
            print("Adding columns to users table...")
            
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE")
                print("Added is_verified column.")
            except pymysql.err.InternalError as e:
                if e.args[0] == 1060:
                    print("is_verified column already exists.")
                else:
                    print(f"Error adding is_verified: {e}")

            try:
                cursor.execute("ALTER TABLE users ADD COLUMN otp_code VARCHAR(6)")
                print("Added otp_code column.")
            except pymysql.err.InternalError as e:
                if e.args[0] == 1060:
                    print("otp_code column already exists.")
                else:
                    print(f"Error adding otp_code: {e}")

            try:
                cursor.execute("ALTER TABLE users ADD COLUMN otp_expires_at DATETIME")
                print("Added otp_expires_at column.")
            except pymysql.err.InternalError as e:
                if e.args[0] == 1060:
                    print("otp_expires_at column already exists.")
                else:
                    print(f"Error adding otp_expires_at: {e}")

            connection.commit()
            print("Finished updating schema.")
    except Exception as e:
        print(f"Failed to execute SQL: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    add_columns()
