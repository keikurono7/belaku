import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { app } from "../services/firebase_";
import { bytesToBase64 } from "../utils/bytesToImage";   // ⬅ import decoder

const db = getFirestore(app);

const fadeAnim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Bills() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "bills"), orderBy("created_at", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(arr);
    });

    return () => unsub();
  }, []);

  return (
    <motion.div {...fadeAnim} key="bills">
      <h2 className="text-3xl font-bold mb-6">Bills</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 && (
          <div className="text-gray-400 col-span-full text-center">
            No bills uploaded yet.
          </div>
        )}

        {items.map((item) => {
          const img = bytesToBase64(item.image_blob); // ⬅ convert bytes to img

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03, y: -4 }}
              className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 cursor-pointer"
            >
              {img && (
                <img
                  src={img}
                  alt="bill"
                  className="w-full h-40 object-cover rounded-xl mb-4 border border-white/10"
                />
              )}

              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-300 mb-2">{item.description}</p>

              <div className="text-sm text-gray-400">
                Uploaded by: {item.author}
              </div>

              {item.created_at?.toDate && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(item.created_at.toDate()).toLocaleString()}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
