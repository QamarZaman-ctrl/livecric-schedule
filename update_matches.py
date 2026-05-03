import requests
import json
import os

def fetch_matches():
    url = "https://cricbuzz-cricket.p.rapidapi.com/schedule/v1/international"
    headers = {
        "x-rapidapi-key": "YOUR_API_KEY_HERE",
        "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com"
    }
    
    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        
        # Data ko clean karke save karna
        with open('matches.json', 'w') as f:
            json.dump(data, f, indent=4)
        print("Matches updated successfully!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fetch_matches()
