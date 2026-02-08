
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_register_and_login():
    print(f"Testing Registration & Login against Supabase via {BASE_URL}...")
    
    # 1. Register
    timestamp = int(time.time())
    username = f"supa_user_{timestamp}"
    email = f"supa_{timestamp}@example.com"
    password = "StrongPassword123!"
    
    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    
    try:
        print(f"\n[1] Registering user: {username}")
        reg_response = requests.post(f"{BASE_URL}/users/", json=register_payload)
        
        if reg_response.status_code == 200:
            print("SUCCESS: User registered.")
            print(f"Response: {reg_response.json()}")
        else:
            print(f"FAILURE: Registration failed. Code: {reg_response.status_code}")
            print(f"Error: {reg_response.text}")
            return

        # 2. Login
        print(f"\n[2] Logging in...")
        login_payload = {
            "username": username,
            "password": password
        }
        # Login expects form data, not json
        login_response = requests.post(f"{BASE_URL}/token", data=login_payload)
        
        if login_response.status_code == 200:
            print("SUCCESS: Login successful!")
            token_data = login_response.json()
            print(f"Access Token: {token_data.get('access_token')[:20]}...")
        else:
            print(f"FAILURE: Login failed. Code: {login_response.status_code}")
            print(f"Error: {login_response.text}")

    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_register_and_login()
