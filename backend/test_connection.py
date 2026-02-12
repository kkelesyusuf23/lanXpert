
import requests

def test_login():
    url = "http://127.0.0.1:8000/api/v1/token"
    # Using the credentials from previous successful manual test log
    data = {
        "username": "kkelesyusuf23@gmail.com",
        "password": "pass" # This will likely fail with 401 but prove connectivity OR succeed if I knew the pass. The user's screen shot shows "Connection Error", so getting a 401 is actually a SUCCESS for proving network availability.
    }
    
    print(f"Testing connectivity to {url}...")
    try:
        response = requests.post(url, data=data) 
        print(f"Response Code: {response.status_code}")
        if response.status_code in [200, 400, 401, 422]:
            print("SUCCESS: Server is reachable and responding.")
        else:
            print(f"WARNING: Server responded with unexpected code {response.status_code}")
        print(f"Response Body Preview: {response.text[:200]}")
    except requests.exceptions.ConnectionError:
        print("FAILURE: Connection refused. Server is not reachable.")
    except Exception as e:
        print(f"FAILURE: An unexpected error occurred: {e}")

if __name__ == "__main__":
    test_login()
