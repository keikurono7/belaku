import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";

import { app } from "../services/firebase_";
import { bytesToBase64 } from "../utils/bytesToImage";
import InitiativeModal from "../components/InitiativeModal"; // ⬅ add this

const db = getFirestore(app);

export default function Initiatives() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null); // ⬅ modal item

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "initiatives"), orderBy("created_at", "desc")),
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

      <h2 className="text-3xl font-bold mb-6">Initiatives</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const img = bytesToBase64(item.image_blob);

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03, y: -4 }}
              className="p-6 bg-white/10 rounded-2xl border border-white/10 cursor-pointer transition"
              onClick={() => setSelected(item)} // ⬅ open modal
            >
              {img && (
                <img
                  src={img}
                  className="h-40 w-full object-cover rounded-xl mb-4"
                />
              )}

              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-gray-300 truncate">{item.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <InitiativeModal item={selected} onClose={() => setSelected(null)} />
      )}
    </motion.div>
  );
}
