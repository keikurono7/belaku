# app.py
import os
import mimetypes
import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, jsonify, Response, abort
from flask_cors import CORS

# ----------------- Firebase init --------------------------------
cred = credentials.Certificate("firebase.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ----------------- Flask app ------------------------------------
app = Flask(__name__)
CORS(app)  # allow cross-origin (adjust config for production)

# Helper to convert Firestore timestamp to ISO string safely
def serialize_doc(doc_snapshot):
    d = doc_snapshot.to_dict()
    if d is None:
        return None
    # Remove heavy binary blob from JSON response
    d.pop("image_blob", None)

    # add image_url that the frontend can use to fetch the image
    d["image_url"] = f"/initiative/{doc_snapshot.id}/image"
    # ensure initiative_id present (use doc id if missing)
    d["initiative_id"] = d.get("initiative_id", doc_snapshot.id)

    # convert created_at if present
    created = d.get("created_at")
    if created is not None:
        # created may be a datetime-like (google cloud timestamp)
        try:
            d["created_at"] = created.isoformat()
        except Exception:
            d["created_at"] = str(created)
    return d

@app.route("/api/initiatives", methods=["GET"])
def list_initiatives():
    """
    Returns a JSON array of initiatives.
    Each item includes: initiative_id, title, description, author, party, image_url, created_at (ISO).
    """
    coll = db.collection("initiatives")
    snaps = coll.stream()
    items = []
    for snap in snaps:
        ser = serialize_doc(snap)
        if ser:
            items.append(ser)
    # Optionally sort by created_at if present (descending)
    try:
        items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    except Exception:
        pass
    return jsonify(items)


@app.route("/initiative/<doc_id>/image", methods=["GET"])
def serve_image(doc_id):
    """
    Streams the binary image blob stored in the document under `image_blob`.
    Returns correct MIME from `image_mime` or defaults to application/octet-stream.
    """
    doc_ref = db.collection("initiatives").document(doc_id)
    snap = doc_ref.get()
    if not snap.exists:
        return abort(404)
    data = snap.to_dict()
    if not data:
        return abort(404)

    image_blob = data.get("image_blob")
    image_mime = data.get("image_mime") or "application/octet-stream"

    if not image_blob:
        return abort(404)

    # image_blob should be bytes-like. Return it with Response.
    return Response(image_blob, mimetype=image_mime)

if __name__ == "__main__":
    # For local dev, run Flask built-in server
    app.run(host="0.0.0.0", port=5000, debug=True)
