# push_initiatives_with_images.py
import os
import mimetypes
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import DocumentSnapshot

# ------------- Initialize Firebase Admin ----------------
cred = credentials.Certificate("firebase.json")
# If already initialized elsewhere, skip initialize_app
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ------------- Example initiatives (edit paths & metadata) -------------
# Make sure these image files exist locally. You can replace paths with your images.
initiatives_data = [
    {
        "image_path": "initiative1.png",
        "title": "Gruha Jyothi Scheme",
        "description": "Provides free electricity up to 200 units for Karnataka households.",
        "author": "Government of Karnataka",
        "party": "INC",
    },
    {
        "image_path": "initiative2.jpg",
        "title": "Shakti Yojana",
        "description": "Free public bus travel for women across Karnataka state-run buses.",
        "author": "Government of Karnataka",
        "party": "INC",
    },
    {
        "image_path": "initiative3.png",
        "title": "Anna Bhagya",
        "description": "10 kg free rice for eligible BPL families under state food security.",
        "author": "Government of Karnataka",
        "party": "INC",
    },
    {
        "image_path": "initiative4.jpg",
        "title": "Gruha Lakshmi Scheme",
        "description": "Financial assistance of ₹2000/month to women heads of households.",
        "author": "Government of Karnataka",
        "party": "INC",
    },
    {
        "image_path": "initiative5.jpg",
        "title": "Yuva Nidhi",
        "description": "Monthly unemployment assistance for educated youth in Karnataka.",
        "author": "Government of Karnataka",
        "party": "INC",
    },
]

# ------------- Helper: read file bytes and mime type ------------------
def read_image_as_bytes(path: str):
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Image file not found: {path}")

    with open(path, "rb") as f:
        data = f.read()
    return data

# ------------- Push initiatives to Firestore ---------------------------
def push_initiatives_to_firestore(collection_name="initiatives"):
    for item in initiatives_data:
        path = item.get("image_path", "")
        try:
            image_bytes= read_image_as_bytes(path)
        except Exception as e:
            print(f"[ERROR] Could not read image for '{item['title']}': {e}")
            # Skip or continue with empty blob depending on your preference
            image_bytes = b""

        doc_ref = db.collection(collection_name).document()  # auto id
        doc_id = doc_ref.id

        doc_payload = {
            "initiative_id": doc_id,           # store same as doc id
            "image_blob": image_bytes,          # original local path (editable)
            "title": item["title"],
            "description": item["description"],
            "author": item["author"],
            "party": item["party"],
            # optionally add timestamps:
            "created_at": firestore.SERVER_TIMESTAMP,
        }

        # Write to Firestore
        doc_ref.set(doc_payload)
        print(f"[OK] Uploaded '{item['title']}' -> doc ID: {doc_id}")

# ---------------------- Run as script ------------------------------------
if __name__ == "__main__":
    # 1) Push initiatives
    push_initiatives_to_firestore()
