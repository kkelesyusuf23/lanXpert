
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Health Check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Health Check Failed: {e}")

def test_plans():
    try:
        # Plans likely public or require auth. Let's try public first or check if endpoint exists
        # Based on routers/features.py or main.py? 
        # Actually I don't recall adding a public /plans endpoint in features.py yet.
        # But I added /words, /questions. Let's try /docs to confirm.
        pass
    except:
        pass

def test_words():
    try:
        response = requests.get(f"{BASE_URL}/api/v1/words/")
        if response.status_code == 401:
             print("Words Endpoint: 401 Unauthorized (Expected if auth required)")
        elif response.status_code == 200:
             print(f"Words Endpoint: 200 OK - {len(response.json())} words found")
        else:
             print(f"Words Endpoint: {response.status_code}")
    except Exception as e:
        print(f"Words Endpoint Failed: {e}")

if __name__ == "__main__":
    print("--- Starting API Tests ---")
    test_health()
    test_words()
    print("--- End API Tests ---")
