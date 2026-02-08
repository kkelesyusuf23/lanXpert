
import psycopg2
import sys
import socket

HOST = "db.oytdebklocpsuncaqkkg.supabase.co"
PORT = "5432"
DBNAME = "postgres"
USER = "postgres"
PASSWORD = "6sHFSHFpeIPZg9tX"

def test_connect():
    print(f"--- Diagnostic: Testing Connection to {HOST} ---")
    
    # 1. DNS Resolution
    print("\n[Step 1] Testing DNS Resolution...")
    try:
        ip_list = socket.gethostbyname_ex(HOST)
        print(f"SUCCESS: Resolved to {ip_list}")
    except Exception as e:
        print(f"FAILURE: Could not resolve hostname. Error: {e}")
        print("Suggestion: Check your internet connection or use the Transaction Pooler connection string.")
        return

    # 2. TCP Connection
    print("\n[Step 2] Testing TCP Reachability...")
    try:
        s = socket.create_connection((HOST, 5432), timeout=5)
        print("SUCCESS: Port 5432 is reachable.")
        s.close()
    except Exception as e:
        print(f"FAILURE: Could not reach port 5432. Error: {e}")
        print("Suggestion: Your firewall or ISP might be blocking non-standard SQL ports.")
        return

    # 3. Database Authentication
    print("\n[Step 3] Testing Authentication...")
    try:
        conn = psycopg2.connect(
            dbname=DBNAME,
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            connect_timeout=10
        )
        print("SUCCESS: Connected to database!")
        conn.close()
    except psycopg2.OperationalError as e:
        print(f"FAILURE: Connection rejected. Error: {e}")
    except Exception as e:
        print(f"FAILURE: Unexpected error: {e}")

if __name__ == "__main__":
    test_connect()
