import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  LayoutDashboard,
  MessageSquare
} from "lucide-react";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { app } from "../services/firebase_";
import { compressToWebP } from "../utils/compressImage";

const db = getFirestore(app);

export default function TrialPage() {
  const [type, setType] = useState("initiative");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [uploader, setUploader] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const clearForm = () => {
    setTitle("");
    setDesc("");
    setUploader("");
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !uploader.trim()) {
      setMessage("Title and uploader name required.");
      return;
    }

    setLoading(true);

    try {
      let imageBase64 = null;
      if (file) {
        imageBase64 = await compressToWebP(file, 800, 0.7);
      }

      const collectionMap = {
        initiative: "initiatives",
        bill: "bills",
        topic: "discussionTopics",
      };

      await addDoc(collection(db, collectionMap[type]), {
        title,
        desc,
        imageBase64,
        createdBy: uploader,
        createdAt: serverTimestamp(),
      });

      setMessage("Uploaded ✔");
      clearForm();
    } catch (err) {
      console.error(err);
      setMessage("Upload failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 p-8 text-white">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold mb-6"
        >
          Trial / Admin Upload
        </motion.h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10"
        >
          {/* Type Selector */}
          <div className="flex gap-3">
            <button type="button"
              onClick={() => setType("initiative")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                type === "initiative"
                  ? "bg-gradient-to-r from-yellow-500 to-red-500 text-black"
                  : "bg-white/10"
              }`}
            >
              <LayoutDashboard /> Initiative
            </button>

            <button type="button"
              onClick={() => setType("bill")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                type === "bill"
                  ? "bg-gradient-to-r from-yellow-500 to-red-500 text-black"
                  : "bg-white/10"
              }`}
            >
              <FileText /> Bill
            </button>

            <button type="button"
              onClick={() => setType("topic")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                type === "topic"
                  ? "bg-gradient-to-r from-yellow-500 to-red-500 text-black"
                  : "bg-white/10"
              }`}
            >
              <MessageSquare /> Discussion Topic
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm text-gray-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 mt-1 rounded-xl bg-white/5 border border-white/10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-300">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              className="w-full p-3 mt-1 rounded-xl bg-white/5 border border-white/10"
            />
          </div>

          {/* Uploader */}
          <div>
            <label className="text-sm text-gray-300">Uploaded by</label>
            <input
              value={uploader}
              onChange={(e) => setUploader(e.target.value)}
              className="w-full p-3 mt-1 rounded-xl bg-white/5 border border-white/10"
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm text-gray-300 flex items-center gap-2">
              Image (optional)
              <ImageIcon className="w-5 h-5" />
            </label>

            <input
              type="file"
              accept="image/*"
              className="mt-2"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {file && (
              <div className="text-sm mt-2 text-gray-300">Selected: {file.name}</div>
            )}
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="px-6 py-3 w-full rounded-xl bg-gradient-to-r from-yellow-500 to-red-500 font-semibold"
          >
            {loading ? "Uploading..." : <><UploadCloud className="inline" /> Upload</>}
          </button>

          <p className="text-center text-gray-300">{message}</p>
        </form>
      </div>
    </div>
  );
}
