
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_create_user():
    print(f"Testing User Creation against {BASE_URL}...")
    
    # Generate unique user
    timestamp = int(time.time())
    username = f"testuser_{timestamp}"
    email = f"testuser_{timestamp}@example.com"
    password = "testpassword123"
    
    payload = {
        "username": username,
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users/", json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS: User created successfully!")
            print(f"User ID: {data.get('id')}")
            print(f"Username: {data.get('username')}")
        else:
            print("FAILURE: User creation failed.")
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend. Is it running?")

if __name__ == "__main__":
    test_create_user()
