import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GDRIVE_API_KEY")
FOLDER_ID = os.getenv("GDRIVE_FOLDER_ID")
OUTPUT_FILE = "public/documents.json"

def fetch_gdrive_files():
    print(f"🚀 Fetching files from GDrive folder: {FOLDER_ID}")
    
    url = "https://www.googleapis.com/drive/v3/files"
    params = {
        "q": f"'{FOLDER_ID}' in parents and trashed = false",
        "fields": "files(id, name, mimeType, size, webViewLink, thumbnailLink, createdTime)",
        "key": API_KEY,
        "pageSize": 1000
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"❌ Error fetching files: {response.text}")
        return
    
    files = response.json().get("files", [])
    
    formatted_items = []
    for file in files:
        # Simple category logic based on name or mimeType
        category = "Other"
        name_lower = file['name'].lower()
        if "id" in name_lower or "card" in name_lower or "passport" in name_lower or "aadhar" in name_lower:
            category = "Identity"
        elif "tax" in name_lower or "invoice" in name_lower or "bill" in name_lower:
            category = "Finance"
        elif "medical" in name_lower or "report" in name_lower:
            category = "Health"
        elif "education" in name_lower or "result" in name_lower or "certificate" in name_lower:
            category = "Education"

        formatted_items.append({
            "id": file['id'],
            "name": file['name'],
            "mimeType": file['mimeType'],
            "size": int(file.get('size', 0)),
            "webViewLink": file['webViewLink'],
            "thumbnailLink": file.get('thumbnailLink', ""),
            "category": category,
            "createdTime": file['createdTime']
        })
    
    manifest = {
        "lastUpdated": file.get('createdTime') if files else "N/A", # Placeholder for real timestamp
        "version": "1.0.0",
        "items": formatted_items
    }
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✅ Successfully synced {len(formatted_items)} documents to {OUTPUT_FILE}")

if __name__ == "__main__":
    fetch_gdrive_files()
