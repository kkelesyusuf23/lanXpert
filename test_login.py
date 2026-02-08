
import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_login(username, password):
    print(f"Testing Login for user {username}...")
    
    # Login endpoint expects form data (OAuth2)
    payload = {
        "username": username,
        "password": password
    }
    
    try:
        # Note: /token endpoint is usually at /api/v1/token or /auth/token
        # In main.py: app.include_router(auth.router, prefix="/api/v1")
        # In auth.py: @router.post("/token")
        # So URL is /api/v1/token
        response = requests.post(f"{BASE_URL}/token", data=payload)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS: Login successful!")
            print(f"Access Token: {data.get('access_token')[:20]}...")
        else:
            print(f"FAILURE: Login failed. Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test_login.py <username> <password>")
        # Use the user we just created in test_register.py if possible, or hardcode one known
        # But username matches timestamp... I'll check test_register.py output from previous step.
        # User ID: ca10cfff-9d6e-49cb-a246-9a29c260baab
        # Username: testuser_1770489269
        # Password was 'testpassword123'
        test_login("testuser_1770489269", "testpassword123")
    else:
        test_login(sys.argv[1], sys.argv[2])
