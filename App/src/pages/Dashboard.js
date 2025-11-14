import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Building2,
  MessageSquare,
  ChevronRight,
  Users,
  Disc
} from "lucide-react";
import Booths from "./Booths";
import DiscussionList from "./DiscussionList";

export default function DashboardPage() {
  const tabs = [
    { id: "initiatives", label: "Initiatives", icon: LayoutDashboard },
    { id: "bills", label: "Bills", icon: FileText },
    { id: "booths", label: "Booths", icon: Building2 },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
  ];

  const [activeTab, setActiveTab] = useState("initiatives");
  const [selectedRegion, setSelectedRegion] = useState("");

  const regions = ["Bengaluru", "Mysuru", "Udupi", "Dharwad"];
  const mockPoliticians = {
    Bengaluru: ["Person A", "Person B", "Person C"],
    Mysuru: ["Person D", "Person E"],
    Udupi: ["Person F"],
    Dharwad: ["Person G", "Person H"],
  };

  const fadeAnim = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white p-6">

      {/* 🔥 Top Bar Tabs */}
      <div className="flex items-center justify-center gap-6 mb-12">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-6 py-3 rounded-full flex items-center gap-2 font-semibold transition-all 
              ${activeTab === t.id
                ? "bg-gradient-to-r from-yellow-500 to-red-500 shadow-lg"
                : "bg-white/10 border border-white/10 hover:bg-white/20"
              }`}
          >
            <t.icon className="w-5 h-5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ⚡ Animated Tab Content */}
      <div className="container mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "initiatives" && (
            <motion.div {...fadeAnim} key="initiatives">
              <h2 className="text-3xl font-bold mb-6">Initiatives</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ scale: 1.03, y: -4 }}
                    className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 cursor-pointer"
                  >
                    <h3 className="text-xl font-bold mb-2">Initiative {item}</h3>
                    <p className="text-gray-300">
                      Example description for initiative {item}.
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "bills" && (
            <motion.div {...fadeAnim} key="bills">
              <h2 className="text-3xl font-bold mb-6">Bills</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ scale: 1.03, y: -4 }}
                    className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 cursor-pointer"
                  >
                    <h3 className="text-xl font-bold mb-2">Bill {item}</h3>
                    <p className="text-gray-300">
                      Summary of bill {item}.
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "booths" && <Booths />}


          {activeTab === "discussions" && <DiscussionList onOpen={(topic) => alert(`Open discussion: ${topic.title}`)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
