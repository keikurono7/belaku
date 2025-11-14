import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { app } from "../services/firebase_";
import { MessageSquare, ChevronRight } from "lucide-react";

const db = getFirestore(app);

export default function DiscussionList({ onOpen }) {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "discussionTopics"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTopics(arr);
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Discussions</h2>
      <div className="space-y-4">
        {topics.map(t => (
          <div key={t.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition" onClick={() => onOpen(t)}>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-sm text-gray-400">by {t.createdBy || "Unknown"}</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        ))}
        {topics.length === 0 && <div className="text-gray-400">No topics yet.</div>}
      </div>
    </div>
  );
}
