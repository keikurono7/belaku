import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ChevronRight,
  Search,
  MessageCircle,
  Plus,
  Send,
  ArrowLeft,
  X,
  Image as ImageIcon
} from "lucide-react";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Bytes
} from "firebase/firestore";

import { app } from "../services/firebase_";

const db = getFirestore(app);

const fadeAnim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/* ------------------- Helpers ------------------- */

// read File -> Uint8Array
async function fileToUint8Array(file) {
  const ab = await file.arrayBuffer();
  return new Uint8Array(ab);
}

// detect mime from header
function detectMime(uint8) {
  if (!uint8 || uint8.length < 4) return "application/octet-stream";
  // PNG: 89 50 4E 47
  if (uint8[0] === 0x89 && uint8[1] === 0x50 && uint8[2] === 0x4E && uint8[3] === 0x47)
    return "image/png";
  // JPG: FF D8 FF
  if (uint8[0] === 0xFF && uint8[1] === 0xD8) return "image/jpeg";
  // GIF: 47 49 46 38
  if (uint8[0] === 0x47 && uint8[1] === 0x49 && uint8[2] === 0x46) return "image/gif";
  return "application/octet-stream";
}

// given Firestore Bytes-like or Uint8Array or old _byteString convert to object URL
function bytesToObjectUrl(image_blob) {
  if (!image_blob) return null;

  let uint8 = null;

  // Firestore modular SDK Bytes instance has toUint8Array()
  if (typeof image_blob?.toUint8Array === "function") {
    try {
      uint8 = image_blob.toUint8Array();
    } catch {
      uint8 = null;
    }
  }

  // if it's a plain Uint8Array already
  if (!uint8 && image_blob instanceof Uint8Array) {
    uint8 = image_blob;
  }

  // fallback for older representation (._byteString.binaryString)
  if (!uint8 && image_blob?._byteString?.binaryString) {
    const bs = image_blob._byteString.binaryString;
    const arr = new Uint8Array(bs.length);
    for (let i = 0; i < bs.length; i++) arr[i] = bs.charCodeAt(i);
    uint8 = arr;
  }

  if (!uint8) return null;

  const mime = detectMime(uint8);
  const blob = new Blob([uint8], { type: mime });
  const url = URL.createObjectURL(blob);
  return url;
}

/* ------------------------------------------------ */

export default function Discussions() {
  const [search, setSearch] = useState("");
  const [topics, setTopics] = useState([]);
  const [messageCounts, setMessageCounts] = useState({});
  const [selected, setSelected] = useState(null);

  // session user
  const [session, setSession] = useState(null);

  // messages
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [msgFile, setMsgFile] = useState(null); // image for message
  const [msgPreviewUrl, setMsgPreviewUrl] = useState(null);

  // topic create
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [topicFile, setTopicFile] = useState(null);
  const [topicPreviewUrl, setTopicPreviewUrl] = useState(null);

  // ephemeral cleanup for object URLs
  const createdUrlsRef = useRef([]);

  useEffect(() => {
    return () => {
      // revoke created object URLs on unmount
      (createdUrlsRef.current || []).forEach((u) => URL.revokeObjectURL(u));
      createdUrlsRef.current = [];
    };
  }, []);

  /* ---------------- Load Logged User ---------------- */
  useEffect(() => {
    const raw = localStorage.getItem("belaku_user");
    if (raw) {
      try {
        setSession(JSON.parse(raw));
      } catch {
        setSession(null);
      }
    }
  }, []);

  /* ---------------- Load Discussions (list) ---------------- */
  useEffect(() => {
    const q = query(collection(db, "discussionTopics"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTopics(arr);

      // for each topic, listen to its message count (lightweight, onSnapshot returns size)
      arr.forEach((topic) => {
        const msgQ = query(collection(db, "discussionTopics", topic.id, "messages"));
        // set up subscriber for counts; keep reference inside closure, but we won't unsubscribe individually
        onSnapshot(msgQ, (msgSnap) => {
          setMessageCounts((prev) => ({ ...prev, [topic.id]: msgSnap.size }));
        });
      });
    });

    return () => unsub();
  }, []);

  /* ---------------- Load Messages for Selected Topic ---------------- */
  useEffect(() => {
    if (!selected?.id) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "discussionTopics", selected.id, "messages"),
      orderBy("created_at", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(arr);
    });

    return () => unsub();
  }, [selected]);

  /* ---------------- Preview handlers ---------------- */
  useEffect(() => {
    if (topicFile) {
      const reader = async () => {
        const url = URL.createObjectURL(topicFile);
        setTopicPreviewUrl(url);
        createdUrlsRef.current.push(url);
      };
      reader();
    } else {
      setTopicPreviewUrl(null);
    }
  }, [topicFile]);

  useEffect(() => {
    if (msgFile) {
      const reader = async () => {
        const url = URL.createObjectURL(msgFile);
        setMsgPreviewUrl(url);
        createdUrlsRef.current.push(url);
      };
      reader();
    } else {
      setMsgPreviewUrl(null);
    }
  }, [msgFile]);

  const filtered = topics.filter((topic) =>
    topic.title.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- Send Chat Message (text + optional image) ---------------- */
  const sendMessage = async () => {
    if (!newMsg.trim() && !msgFile) return; // nothing to send
    if (!session?.username) {
      alert("You must be logged in to send messages.");
      return;
    }

    try {
      let image_blob = null;
      if (msgFile) {
        const uint8 = await fileToUint8Array(msgFile);
        image_blob = Bytes.fromUint8Array ? Bytes.fromUint8Array(uint8) : Bytes(uint8); // safe fallback
      }

      await addDoc(
        collection(db, "discussionTopics", selected.id, "messages"),
        {
          text: newMsg.trim() || null,
          author: session.username,
          image_blob: image_blob || null,
          created_at: serverTimestamp(),
        }
      );

      // cleanup local state
      setNewMsg("");
      setMsgFile(null);
      setMsgPreviewUrl(null);
    } catch (err) {
      console.error("sendMessage error:", err);
      alert("Failed to send message");
    }
  };

  /* ---------------- Create Discussion (with optional image) ---------------- */
  const createDiscussion = async () => {
    if (!newTitle.trim()) return alert("Title required");

    try {
      let image_blob = null;
      if (topicFile) {
        const uint8 = await fileToUint8Array(topicFile);
        image_blob = Bytes.fromUint8Array ? Bytes.fromUint8Array(uint8) : Bytes(uint8);
      }

      await addDoc(collection(db, "discussionTopics"), {
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        image_blob: image_blob || null,
        created_at: serverTimestamp(),
      });

      // cleanup
      setShowCreate(false);
      setNewTitle("");
      setNewDesc("");
      setTopicFile(null);
      setTopicPreviewUrl(null);
    } catch (err) {
      console.error("createDiscussion error:", err);
      alert("Failed to create discussion");
    }
  };

  /* ---------------- Render helpers ---------------- */
  const renderTopicImage = (topic) => {
    if (!topic?.image_blob) return null;
    return bytesToObjectUrl(topic.image_blob);
  };

  const renderMessageImage = (msg) => {
    if (!msg?.image_blob) return null;
    return bytesToObjectUrl(msg.image_blob);
  };

  /* ---------------- UI ---------------- */
  // LIST VIEW
  if (!selected) {
    return (
      <motion.div {...fadeAnim} key="discussions" className="relative">
        <h2 className="text-3xl font-bold mb-6">Discussions</h2>

        {/* Search */}
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

        {/* List */}
        <div className="space-y-4">
          {filtered.map((topic) => {
            const thumb = renderTopicImage(topic);
            return (
              <motion.div
                key={topic.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelected(topic)}
                className="p-5 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {thumb ? (
                      <img src={thumb} alt="thumb" className="w-20 h-14 object-cover rounded-md" />
                    ) : (
                      <div className="w-20 h-14 bg-white/5 rounded-md flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <MessageSquare className="w-6 h-6 text-yellow-400" />
                        <span className="font-semibold text-xl">{topic.title}</span>
                      </div>

                      <p className="text-gray-300 text-sm mb-3">{topic.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          {messageCounts[topic.id] || 0} comments
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-yellow-400 transition" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Create button */}
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-yellow-500 to-red-500 p-4 rounded-full shadow-xl hover:scale-105 transition"
        >
          <Plus className="text-black w-6 h-6" />
        </button>

        {/* Create Modal */}
        {showCreate && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gray-900 w-full max-w-lg p-6 rounded-2xl border border-white/10"
            >
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Create New Discussion</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X />
                </button>
              </div>

              <input
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-3 bg-white/10 rounded-xl border border-white/10 mb-3"
              />

              <textarea
                placeholder="Description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full p-3 bg-white/10 rounded-xl border border-white/10 mb-3"
              />

              <label className="flex items-center gap-2 mb-3">
                <div className="text-sm text-gray-300 flex items-center gap-2">
                  <ImageIcon /> Topic Image (optional)
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTopicFile(e.target.files?.[0] || null)}
                  className="ml-auto"
                />
              </label>

              {topicPreviewUrl && (
                <img src={topicPreviewUrl} alt="preview" className="w-full h-40 object-cover rounded-md mb-3" />
              )}

              <div className="flex gap-3">
                <button
                  onClick={createDiscussion}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-red-500 font-semibold"
                >
                  Create
                </button>

                <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl bg-white/5">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // CHAT VIEW (selected != null)
  return (
    <motion.div {...fadeAnim} key="chat-screen" className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20" onClick={() => setSelected(null)}>
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-2xl font-bold">{selected.title}</h2>
          <p className="text-gray-400 text-sm">{selected.description}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[60vh] overflow-y-auto space-y-3 p-4 bg-white/5 rounded-xl border border-white/10 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white/10 p-3 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-yellow-400 font-semibold">{msg.author}</div>
              <div className="text-xs text-gray-400">
                {msg.created_at?.toDate ? msg.created_at.toDate().toLocaleTimeString() : ""}
              </div>
            </div>

            {msg.text && <div className="mb-2">{msg.text}</div>}

            {msg.image_blob && (
              <div className="mb-2">
                <img src={renderMessageImage(msg)} alt="sent" className="w-full max-h-80 object-contain rounded-md border border-white/10" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-3 bg-white/10 rounded-xl border border-white/10 resize-none"
            rows={2}
          />
          {/* image attach */}
          <div className="flex items-center gap-2 mt-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <ImageIcon />
              <span>Attach image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setMsgFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            {msgPreviewUrl && (
              <div className="ml-auto flex items-center gap-2">
                <img src={msgPreviewUrl} alt="preview" className="w-20 h-14 object-cover rounded-md" />
                <button onClick={() => { setMsgFile(null); setMsgPreviewUrl(null); }} className="text-sm text-red-400">Remove</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={sendMessage} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl">
            <Send className="text-black w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
