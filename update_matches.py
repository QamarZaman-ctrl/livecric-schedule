import requests
import json
import os

def fetch_matches():
    # Cricbuzz International Schedule Endpoint
    url = "https://cricbuzz-cricket.p.rapidapi.com/schedule/v1/international"
    
    # Secret key GitHub Actions se ayegi
    api_key = os.getenv('RAPID_API_KEY')
    
    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com"
    }
    
    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        
        # Data ko matches.json mein save karna
        with open('matches.json', 'w') as f:
            json.dump(data, f, indent=4)
        print("Matches updated successfully in matches.json")
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        exit(1)

if __name__ == "__main__":
    fetch_matches()
