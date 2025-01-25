import requests
import csv
# fetch data from spotify api

# curl -X POST "https://accounts.spotify.com/api/token" \
#      -H "Content-Type: application/x-www-form-urlencoded" \
#      -d "grant_type=client_credentials&client_id=your-client-id&client_secret=your-client-secret"

request = {
    "grant_type": "client_credentials",
    "client_id": "f468bc7e584d477f935e178e74f79daa",
    "client_secret": "5aa91192543a4afab4a76b60164f4cc3"
}

# response = requests.post("https://accounts.spotify.com/api/token", data=request)
# print(response.json())

# read csv file
with op