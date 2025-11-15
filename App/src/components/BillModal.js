import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ThumbsUp, ThumbsDown } from "lucide-react";
import { getFirestore, doc, runTransaction } from "firebase/firestore";
import { app } from "../services/firebase_";
import { bytesToBase64 } from "../utils/bytesToImage";

const db = getFirestore(app);

export default function BillModal({ item, onClose }) {
  const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("belaku_user") || "null") : null;
  const username = session?.username || null;

  const [score, setScore] = useState(item.votes || 0);
  const [userVote, setUserVote] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setScore(item.votes || 0);
    if (!username) {
      setUserVote(0);
      return;
    }

    const voteRef = doc(db, "bills", item.id, "votes", username);
    (async () => {
      try {
        await runTransaction(db, async (tx) => {
          const vSnap = await tx.get(voteRef);
          setUserVote(vSnap.exists() ? (vSnap.data().vote || 0) : 0);
        });
      } catch (err) {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const handleVote = async (value) => {
    if (!username) {
      alert("Please login to vote");
      return;
    }
    setLoading(true);

    const billRef = doc(db, "bills", item.id);
    const voteRef = doc(db, "bills", item.id, "votes", username);

    try {
      await runTransaction(db, async (tx) => {
        const billSnap = await tx.get(billRef);
        if (!billSnap.exists()) throw new Error("Bill missing");

        const vSnap = await tx.get(voteRef);
        const oldVote = vSnap.exists() ? (vSnap.data().vote || 0) : 0;

        let newVote = value;
        if (oldVote === value) newVote = 0; // unvote

        const delta = newVote - oldVote;
        const currentTotal = billSnap.data().votes || 0;
        const newTotal = currentTotal + delta;

        tx.set(voteRef, { vote: newVote });
        tx.update(billRef, { votes: newTotal });

        setUserVote(newVote);
        setScore(newTotal);
      });
    } catch (err) {
      console.error("Vote transaction failed:", err);
      alert("Vote failed, try again");
    } finally {
      setLoading(false);
    }
  };

  const imgSrc = item.image_blob ? bytesToBase64(item.image_blob) : null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-gray-900 p-6 rounded-2xl max-w-2xl w-full border border-white/10"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <div className="text-sm text-gray-400">By {item.author || "—"}</div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {imgSrc && <img src={imgSrc} className="w-full h-64 object-cover rounded-xl mb-4" />}

        <p className="text-gray-300 mb-4">{item.description}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleVote(1)}
            disabled={loading}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 ${userVote === 1 ? "bg-green-600" : "bg-white/5 hover:bg-white/10"}`}
          >
            <ThumbsUp className="w-5 h-5" /> Upvote
          </button>

          <button
            onClick={() => handleVote(-1)}
            disabled={loading}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 ${userVote === -1 ? "bg-red-600" : "bg-white/5 hover:bg-white/10"}`}
          >
            <ThumbsDown className="w-5 h-5" /> Downvote
          </button>

          <div className="ml-auto text-yellow-300 font-bold">Score: {score}</div>
        </div>

        {item.created_at?.toDate && (
          <div className="text-xs text-gray-500 mt-4">
            Posted on {new Date(item.created_at.toDate()).toLocaleString()}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
