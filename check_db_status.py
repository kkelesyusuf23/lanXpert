
import psycopg2
import sys

def check_db():
    print("--- PostgreSQL Connection Check ---")
    try:
        # Connect to lanxpert DB
        conn = psycopg2.connect(
            dbname="lanxpert",
            user="postgres",
            password="postgress",
            host="localhost",
            port="5432"
        )
        print("SUCCESS: Connected to 'lanxpert' database!")
        
        cur = conn.cursor()
        
        # Check users table
        print("\nChecking 'users' table...")
        cur.execute("SELECT count(*) FROM users")
        count = cur.fetchone()[0]
        print(f"Total Users: {count}")
        
        if count > 0:
            print("Listing last 5 users:")
            cur.execute("SELECT username, email, is_active FROM users ORDER BY created_at DESC LIMIT 5")
            rows = cur.fetchall()
            for row in rows:
                print(f" - {row}")
        else:
            print("No users found. Registration might be failing silently or DB was reset.")

        cur.close()
        conn.close()
        return True

    except Exception as e:
        print(f"FAILURE: Could not connect or query database.\nError: {e}")
        return False

if __name__ == "__main__":
    check_db()
