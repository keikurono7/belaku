import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ChevronRight,
  Search,
  Flame,
  MessageCircle
} from "lucide-react";

const fadeAnim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// 🔥 Sample Karnataka Government Discussion Topics
const SAMPLE_TOPICS = [
  {
    title: "Bengaluru Traffic Management Reform",
    description: "Public feedback on new signal-free corridor proposals & congestion control.",
    comments: 124,
    upvotes: 540,
  },
  {
    title: "Cauvery Water Sharing Issues",
    description: "Citizen discussions regarding water allocation & impact on farmers.",
    comments: 312,
    upvotes: 890,
  },
  {
    title: "Government School Digital Learning Upgrade",
    description: "Smart classrooms, tablets, and teacher training programs.",
    comments: 98,
    upvotes: 410,
  },
  {
    title: "Namma Metro Phase-3 Expansion",
    description: "Routes suggested for new lines and connectivity feedback.",
    comments: 221,
    upvotes: 770,
  },
  {
    title: "Waste Management & Clean Bengaluru Initiative",
    description: "Decentralized waste processing units & Swaccha Karnataka proposals.",
    comments: 143,
    upvotes: 550,
  },
  {
    title: "Road Safety & Pothole Tracking",
    description: "New accident-prone zone mapping & digital pothole reporting.",
    comments: 189,
    upvotes: 620,
  },
];

export default function Discussions() {
  const [search, setSearch] = useState("");

  const filtered = SAMPLE_TOPICS.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div {...fadeAnim} key="discussions">
      <h2 className="text-3xl font-bold mb-6">Discussions</h2>

      {/* 🔍 Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search discussions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 pl-12 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 text-white placeholder-gray-400"
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-gray-400 text-center py-10">
            No discussions found.
          </div>
        )}

        {filtered.map((topic, index) => (
          <motion.div
            key={topic.title}
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <MessageSquare className="w-6 h-6 text-yellow-400" />
                  <span className="font-semibold text-xl">
                    {topic.title}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-3">{topic.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-red-400" />
                    {topic.upvotes} upvotes
                  </span>

                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    {topic.comments} comments
                  </span>
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-yellow-400 transition" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
