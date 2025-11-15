// Initiatives.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const fadeAnim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Initiatives() {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base: use env var in production or empty for same-origin requests
  const API_BASE = "http://localhost:5000"

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/initiatives`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        if (mounted) setInitiatives(data);
      } catch (err) {
        console.error("Failed to load initiatives:", err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [API_BASE]);

  if (loading) {
    return (
      <motion.div {...fadeAnim} className="" key="initiatives">
        <h2 className="text-3xl font-bold mb-6">Initiatives</h2>
        <div className="text-gray-300">Loading initiatives…</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div {...fadeAnim} className="" key="initiatives">
        <h2 className="text-3xl font-bold mb-6">Initiatives</h2>
        <div className="text-red-400">Error: {error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeAnim} className="" key="initiatives">
      <h2 className="text-3xl font-bold mb-6">Initiatives</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initiatives.length === 0 && (
          <div className="text-gray-300">No initiatives yet.</div>
        )}

        {initiatives.map((it) => {
          const id = it.initiative_id || it.initiativeId || it.id;
          const imageUrl = it.image_url || `/initiative/${id}/image`;

          return (
            <motion.div
              key={id || Math.random()}
              whileHover={{ scale: 1.03, y: -4 }}
              className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 cursor-pointer"
            >
              {/* Image */}
              <div className="mb-4 h-40 w-full rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                {/* Use the image endpoint. Provide alt and fallback */}
                <img
                  src={imageUrl}
                  alt={it.title || "initiative image"}
                  className="object-cover h-full w-full"
                  onError={(e) => {
                    // fallback: small inline SVG or placeholder text background
                    // hide broken image
                    e.currentTarget.style.display = "none";
                    // optionally show a text fallback (not implemented here)
                  }}
                />
              </div>

              <h3 className="text-xl font-bold mb-2">{it.title || "Untitled"}</h3>
              <p className="text-gray-300 mb-3">
                {it.description || "No description provided."}
              </p>

              <div className="text-sm text-gray-400">
                <div>
                  <strong>Author:</strong> {it.author || "Unknown"}
                </div>
                <div>
                  <strong>Party:</strong> {it.party || "N/A"}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
