import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { bytesToBase64 } from "../utils/bytesToImage";

export default function InitiativeModal({ item, onClose }) {
  if (!item) return null;

  const img = bytesToBase64(item.image_blob);

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-gray-900 p-6 rounded-2xl max-w-xl w-full border border-white/10"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{item.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {img && (
          <img
            src={img}
            className="w-full max-h-64 object-cover rounded-xl mb-4 border border-white/10"
          />
        )}

        <p className="text-gray-300 mb-3">{item.description}</p>

        <div className="text-gray-400 text-sm space-y-1">
          <div><span className="font-semibold">Author:</span> {item.author}</div>
          {item.party && (
            <div><span className="font-semibold">Party:</span> {item.party}</div>
          )}
          {item.created_at?.toDate && (
            <div>
              <span className="font-semibold">Uploaded:</span>{" "}
              {new Date(item.created_at.toDate()).toLocaleString()}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
