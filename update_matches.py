import requests
import json
import os

def fetch_matches():
    api_key = os.getenv('RAPID_API_KEY')
    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com"
    }

    # Sab categories ke endpoints
    endpoints = {
        "international": "https://cricbuzz-cricket.p.rapidapi.com/schedule/v1/international",
        "league": "https://cricbuzz-cricket.p.rapidapi.com/schedule/v1/league",
        "domestic": "https://cricbuzz-cricket.p.rapidapi.com/schedule/v1/domestic",
        "women": "https://cricbuzz-cricket.p.rapidapi.com/schedule/v1/women"
    }

    combined_data = {"matchScheduleMap": []}

    for category, url in endpoints.items():
        try:
            print(f"Fetching {category} matches...")
            response = requests.get(url, headers=headers)
            data = response.json()
            
            if "matchScheduleMap" in data:
                # Har match card mein uski category ka tag lagana taake JS filter kar sakay
                for item in data["matchScheduleMap"]:
                    if "scheduleAdWrapper" in item:
                        item["category_type"] = category
                
                combined_data["matchScheduleMap"].extend(data["matchScheduleMap"])
        except Exception as e:
            print(f"Error fetching {category}: {e}")

    # Final combined data ko save karna
    with open('matches.json', 'w') as f:
        json.dump(combined_data, f, indent=4)
    print("All categories updated successfully!")

if __name__ == "__main__":
    fetch_matches()
