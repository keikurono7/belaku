// src/pages/PoliticianDashboard.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  BarChart3,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Edit2,
  Trash2,
  X
} from "lucide-react";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Bytes
} from "firebase/firestore";

import { app } from "../services/firebase_";
import { fileToBytes } from "../utils/fileToBytes";      // should return Uint8Array
import { bytesToBase64 } from "../utils/bytesToImage";  // optional util if you already have

const db = getFirestore(app);

/**
 * PoliticianDashboard
 *
 * - Clean single-source delete flow: delete ONLY from DetailModal (with custom modal)
 * - Edit modal has Save + Cancel only
 * - Image stored as both Firestore Bytes (if SDK supports) and base64 string for easy rendering:
 *    image_blob  -> Bytes (existing Python schema compatibility)
 *    image_base64 -> string "data:image/<type>;base64,...." (for quick <img/> src)
 *
 * Note: fileToBytes must return Uint8Array. If it returns ArrayBuffer convert accordingly.
 */

export default function PoliticianDashboard() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [initiatives, setInitiatives] = useState([]);
  const [bills, setBills] = useState([]);

  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState("initiative");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);

  // Edit modals
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showItemEdit, setShowItemEdit] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete confirmation state (custom modal)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  // Load session
  useEffect(() => {
    const raw = localStorage.getItem("belaku_user");
    if (!raw) return;
    try {
      setSession(JSON.parse(raw));
    } catch {
      setSession(null);
    }
  }, []);

  // Load profile
  useEffect(() => {
    if (!session?.id) return;
    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", session.id));
        if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error("loadProfile error:", err);
      }
    };
    loadProfile();
  }, [session]);

  // Subscribe to initiatives (order by created_at; filter client-side by author to avoid composite index)
  useEffect(() => {
    const q = query(collection(db, "initiatives"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const filtered = items.filter((x) => x.author === session?.username);
      setInitiatives(filtered);
    });
    return () => unsub();
  }, [session]);

  // Subscribe to bills
  useEffect(() => {
    const q = query(collection(db, "bills"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const filtered = items.filter((x) => x.author === session?.username);
      setBills(filtered);
    });
    return () => unsub();
  }, [session]);

  /* ---------------- Helpers ---------------- */

  // Convert Uint8Array to base64 safely (avoid spreading large arrays)
  const uint8ToBase64 = (u8Arr) => {
    if (!u8Arr) return null;
    // If it's a Firestore Bytes object, try to extract .toUint8Array (some libs)
    if (typeof u8Arr.toUint8Array === "function") {
      u8Arr = u8Arr.toUint8Array(); // Bytes from firestore
    }
    // u8Arr should be Uint8Array or ArrayBuffer
    let u8;
    if (u8Arr instanceof ArrayBuffer) u8 = new Uint8Array(u8Arr);
    else if (u8Arr instanceof Uint8Array) u8 = u8Arr;
    else if (typeof u8Arr._byteString !== "undefined" && typeof u8Arr._byteString.binaryString === "string") {
      // backwards compatibility with some representations: _byteString.binaryString
      const binStr = u8Arr._byteString.binaryString;
      return "data:image/jpeg;base64," + btoa(binStr);
    } else {
      try {
        // if it's an object with .binaryString property
        if (u8Arr && u8Arr.binaryString) return "data:image/jpeg;base64," + btoa(u8Arr.binaryString);
      } catch (e) {}
      return null;
    }

    // convert chunked to avoid call stack issues
    let CHUNK_SZ = 0x8000; // 32KB
    let index = 0;
    let base64 = "";
    while (index < u8.length) {
      const slice = u8.subarray(index, Math.min(index + CHUNK_SZ, u8.length));
      base64 += String.fromCharCode.apply(null, slice);
      index += CHUNK_SZ;
    }
    try {
      const b64 = btoa(base64);
      // Attempt to guess mime: we'll use jpeg as common; if you want to detect mime use file input's type when uploading
      return "data:image/jpeg;base64," + b64;
    } catch (err) {
      console.error("uint8ToBase64 btoa failed", err);
      return null;
    }
  };

  // Render image source: prefer image_base64 (string), fallback to bytesToBase64 util or uint8ToBase64
  const renderImgSrc = (item) => {
    if (!item) return null;
    if (item.image_base64) return item.image_base64;
    if (item.imageUrl) return item.imageUrl;
    if (item.image_blob) {
      try {
        // If bytesToBase64 util exists and supports your stored blob
        if (typeof bytesToBase64 === "function") {
          // bytesToBase64 should return data:image/... string
          const maybe = bytesToBase64(item.image_blob);
          if (maybe) return maybe;
        }
      } catch (e) {
        // ignore
      }
      // fallback to uint8 conversion
      const fallback = uint8ToBase64(item.image_blob);
      if (fallback) return fallback;
    }
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem("belaku_user");
    window.location.href = "/auth";
  };

  /* ---------------- Upload new Initiative/Bill ---------------- */
  const handleUpload = async (e) => {
    e?.preventDefault();
    setMessage("");

    if (!uploadTitle.trim()) {
      setMessage("Title required");
      return;
    }

    setUploading(true);
    try {
      let image_blob = null;
      let image_base64 = null;

      if (uploadFile) {
        const raw = await fileToBytes(uploadFile); // Uint8Array or ArrayBuffer
        // normalize to Uint8Array
        let u8;
        if (raw instanceof ArrayBuffer) u8 = new Uint8Array(raw);
        else if (raw instanceof Uint8Array) u8 = raw;
        else if (raw && raw.buffer && raw.byteLength) u8 = new Uint8Array(raw.buffer);
        else u8 = null;

        if (u8) {
          // produce base64 for quick display
          image_base64 = uint8ToBase64(u8);

          // produce Firestore Bytes if available
          try {
            if (typeof Bytes.fromUint8Array === "function") {
              image_blob = Bytes.fromUint8Array(u8);
            } else if (typeof Bytes === "function") {
              // Some SDKs accept passing Uint8Array to Bytes constructor
              image_blob = Bytes(u8);
            } else {
              image_blob = null;
            }
          } catch (e) {
            // fallback: leave image_blob null but keep image_base64
            image_blob = null;
          }
        }
      }

      const col = uploadType === "initiative" ? "initiatives" : "bills";
      await addDoc(collection(db, col), {
        title: uploadTitle.trim(),
        description: uploadDesc.trim() || null,
        author: session.username,
        party: profile?.party || null,
        image_blob: image_blob || null,
        image_base64: image_base64 || null,
        created_at: serverTimestamp()
      });

      // reset
      setUploadTitle("");
      setUploadDesc("");
      setUploadFile(null);
      setShowUpload(false);
    } catch (err) {
      console.error("Upload failed", err);
      setMessage("Upload failed — check console");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- Edit Profile ---------------- */
  const handleSaveProfile = async (updated) => {
    if (!session?.id) return;
    try {
      const docRef = doc(db, "users", session.id);
      await updateDoc(docRef, {
        name: updated.name || "",
        party: updated.party || null,
        constituency: updated.constituency || null,
        phone: updated.phone || null,
        bio: updated.bio || null
      });
      setProfile((p) => ({ ...p, ...updated }));
      setShowProfileEdit(false);
    } catch (err) {
      console.error("saveProfile err:", err);
      alert("Failed to save profile");
    }
  };

  /* ---------------- Edit Item ---------------- */
  const openEditForItem = (item, type) => {
    setEditingItem({ ...item, __type: type });
    setShowItemEdit(true);
  };

  const handleSaveItemEdit = async (payload) => {
    // payload: { id, type, title, description, newFile (File|null) }
    try {
      const docRef = doc(db, payload.type === "initiative" ? "initiatives" : "bills", payload.id);
      const updateObj = {
        title: payload.title,
        description: payload.description,
      };

      if (payload.newFile) {
        const raw = await fileToBytes(payload.newFile);
        let u8;
        if (raw instanceof ArrayBuffer) u8 = new Uint8Array(raw);
        else if (raw instanceof Uint8Array) u8 = raw;
        else if (raw && raw.buffer && raw.byteLength) u8 = new Uint8Array(raw.buffer);
        else u8 = null;

        if (u8) {
          const base64 = uint8ToBase64(u8);
          updateObj.image_base64 = base64;
          try {
            if (typeof Bytes.fromUint8Array === "function") {
              updateObj.image_blob = Bytes.fromUint8Array(u8);
            } else if (typeof Bytes === "function") {
              updateObj.image_blob = Bytes(u8);
            }
          } catch (e) {
            // ignore - image_blob left out if not possible
          }
        }
      }

      await updateDoc(docRef, updateObj);

      setShowItemEdit(false);
      setEditingItem(null);
      setSelectedItem(null);
    } catch (err) {
      console.error("handleSaveItemEdit err:", err);
      alert("Failed to save item");
    }
  };

  /* ---------------- Delete Item (only from DetailModal) ---------------- */
  const promptDeleteItem = (item) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const item = deletingItem;
    if (!item) return;
    try {
      const col = item.__type === "initiative" || initiatives.find(i => i.id === item.id) ? "initiatives" : "bills";
      // If __type provided and equals 'bill', use 'bills'
      const collectionName = item.__type ? (item.__type === "initiative" ? "initiatives" : "bills") : col;
      await deleteDoc(doc(db, collectionName, item.id));
      setSelectedItem(null);
      setShowDeleteConfirm(false);
      setDeletingItem(null);
      setShowItemEdit(false);
      setEditingItem(null);
    } catch (err) {
      console.error("delete error", err);
      alert("Delete failed");
    }
  };

  /* ---------------- UI ---------------- */
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Login required.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-red-500 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Politician Dashboard</h1>
              <p className="text-sm text-gray-400">Hello, {session.name}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setUploadType("initiative");
                setShowUpload(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-red-500 font-semibold"
            >
              + Initiative
            </button>

            <button
              onClick={() => {
                setUploadType("bill");
                setShowUpload(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 font-semibold"
            >
              + Bill
            </button>

            <button onClick={() => setShowProfileEdit(true)} className="px-4 py-2 rounded-xl bg-white/10">
              Edit Profile
            </button>

            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[
            { id: "overview", icon: BarChart3, label: "Overview" },
            { id: "profile", icon: User, label: "Profile" },
            { id: "initiatives", icon: FileText, label: "Initiatives" },
            { id: "bills", icon: FileText, label: "Bills" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap ${
                activeTab === t.id ? "bg-gradient-to-r from-yellow-500 to-red-500" : "bg-white/10 border border-white/10"
              }`}
            >
              <t.icon className="w-5 h-5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[...initiatives, ...bills].map((post) => {
                const img = renderImgSrc(post);
                return (
                  <div key={post.id} className="p-6 bg-white/10 rounded-xl border border-white/10 cursor-pointer" onClick={() => setSelectedItem(post)}>
                    {img && <img src={img} className="w-full h-40 object-cover rounded-xl mb-4" alt={post.title} />}
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <p className="text-gray-400 truncate">{post.description}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Profile */}
        {activeTab === "profile" && (
          <div className="p-6 bg-white/10 rounded-xl border border-white/10">
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            <p><strong>Name:</strong> {profile?.name || session.name}</p>
            <p><strong>Party:</strong> {profile?.party || "—"}</p>
            <p><strong>Constituency:</strong> {profile?.constituency || "—"}</p>
            <p className="mt-2 text-gray-300">{profile?.bio || ""}</p>
          </div>
        )}

        {/* Initiatives */}
        {activeTab === "initiatives" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiatives.map((it) => (
              <div key={it.id} className="p-6 bg-white/10 rounded-xl border border-white/10 cursor-pointer relative">
                {renderImgSrc(it) && <img src={renderImgSrc(it)} className="w-full h-40 object-cover rounded-xl mb-2" alt={it.title} />}
                <h3 className="text-xl font-bold">{it.title}</h3>
                <p className="text-gray-400 truncate">{it.description}</p>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setSelectedItem({ ...it, __type: "initiative" }); }} className="px-3 py-1 bg-white/5 rounded-md">View</button>
                  <button onClick={() => openEditForItem(it, "initiative")} className="px-3 py-1 bg-white/5 rounded-md flex items-center gap-2"><Edit2 className="w-4 h-4" />Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bills */}
        {activeTab === "bills" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bills.map((it) => (
              <div key={it.id} className="p-6 bg-white/10 rounded-xl border border-white/10 cursor-pointer relative">
                {renderImgSrc(it) && <img src={renderImgSrc(it)} className="w-full h-40 object-cover rounded-xl mb-2" alt={it.title} />}
                <h3 className="text-xl font-bold">{it.title}</h3>
                <p className="text-gray-400 truncate">{it.description}</p>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setSelectedItem({ ...it, __type: "bill" }); }} className="px-3 py-1 bg-white/5 rounded-md">View</button>
                  <button onClick={() => openEditForItem(it, "bill")} className="px-3 py-1 bg-white/5 rounded-md flex items-center gap-2"><Edit2 className="w-4 h-4" />Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          type={uploadType}
          title={uploadTitle}
          desc={uploadDesc}
          file={uploadFile}
          uploading={uploading}
          message={message}
          onClose={() => {
            setShowUpload(false);
            setUploadTitle("");
            setUploadDesc("");
            setUploadFile(null);
            setMessage("");
          }}
          onSubmit={handleUpload}
          onPickFile={setUploadFile}
          onChangeTitle={setUploadTitle}
          onChangeDesc={setUploadDesc}
        />
      )}

      {/* Detail Modal (View + Edit + Delete) */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          renderImgSrc={renderImgSrc}
          onClose={() => setSelectedItem(null)}
          onEdit={() => { openEditForItem(selectedItem, selectedItem.__type || selectedItem.type || "initiative"); }}
          onPromptDelete={() => promptDeleteItem(selectedItem)}
        />
      )}

      {/* Profile Edit */}
      {showProfileEdit && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowProfileEdit(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Item Edit */}
      {showItemEdit && editingItem && (
        <ItemEditModal
          item={editingItem}
          onClose={() => { setShowItemEdit(false); setEditingItem(null); }}
          onSave={handleSaveItemEdit}
        />
      )}

      {/* Delete confirmation modal (custom) */}
      {showDeleteConfirm && deletingItem && (
        <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div className="bg-gray-900 p-6 rounded-xl max-w-md w-full border border-white/10" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
            <h3 className="text-xl font-bold mb-3">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete <strong>{deletingItem.title}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-xl bg-white/10" onClick={() => { setShowDeleteConfirm(false); setDeletingItem(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded-xl bg-red-600" onClick={confirmDelete}>Delete</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

/* ---------------- Upload Modal Component ---------------- */
function UploadModal({ type, title, desc, file, uploading, message, onClose, onSubmit, onPickFile, onChangeTitle, onChangeDesc }) {
  return (
    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="bg-gray-900 p-6 rounded-2xl max-w-lg w-full border border-white/10" initial={{ y: 20 }} animate={{ y: 0 }}>
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">{type === "initiative" ? "New Initiative" : "New Bill"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X /></button>
        </div>

        <form onSubmit={onSubmit}>
          <label className="text-sm">Title</label>
          <input className="w-full bg-white/10 rounded-xl p-2 mb-3" value={title} onChange={(e) => onChangeTitle(e.target.value)} />

          <label className="text-sm">Description</label>
          <textarea className="w-full bg-white/10 rounded-xl p-2 mb-3" value={desc} rows={4} onChange={(e) => onChangeDesc(e.target.value)} />

          <label className="text-sm">Image (optional)</label>
          <input type="file" accept="image/*" className="mb-3" onChange={(e) => onPickFile(e.target.files?.[0] || null)} />

          {file && <p className="text-sm text-gray-400">{file.name}</p>}
          {message && <p className="text-red-400 text-sm mt-1">{message}</p>}

          <div className="flex gap-3 mt-4">
            <button disabled={uploading} className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-red-500">
              {uploading ? "Uploading..." : "Upload"}
            </button>

            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10 border border-white/10">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Detail Modal ---------------- */
function DetailModal({ item, renderImgSrc, onClose, onEdit, onPromptDelete }) {
  return (
    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="bg-gray-900 p-6 rounded-2xl max-w-xl w-full border border-white/10" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <p className="text-gray-400 text-sm">{item.author} • {item.party || ""}</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2 hover:bg-white/5 rounded-lg flex items-center gap-2"><Edit2 /></button>
            <button onClick={onPromptDelete} className="p-2 hover:bg-white/5 rounded-lg flex items-center gap-2 text-red-400"><Trash2 /></button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X /></button>
          </div>
        </div>

        {renderImgSrc(item) && (
          <img src={renderImgSrc(item)} className="w-full h-64 object-cover rounded-xl mb-4" alt={item.title} />
        )}

        <p className="text-gray-300 mb-3">{item.description}</p>

        <p className="text-gray-500 text-xs">
          {item.created_at?.toDate ? new Date(item.created_at.toDate()).toLocaleString() : ""}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Profile Edit Modal ---------------- */
function ProfileEditModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    party: profile?.party || "",
    constituency: profile?.constituency || "",
    phone: profile?.phone || "",
    bio: profile?.bio || ""
  });

  return (
    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="bg-gray-900 p-6 rounded-2xl max-w-md w-full border border-white/10" initial={{ y: 20 }} animate={{ y: 0 }}>
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X /></button>
        </div>

        <div className="space-y-3">
          <label className="text-sm">Name</label>
          <input className="w-full bg-white/10 rounded-xl p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label className="text-sm">Party</label>
          <input className="w-full bg-white/10 rounded-xl p-2" value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} />

          <label className="text-sm">Constituency</label>
          <input className="w-full bg-white/10 rounded-xl p-2" value={form.constituency} onChange={(e) => setForm({ ...form, constituency: e.target.value })} />

          <label className="text-sm">Phone</label>
          <input className="w-full bg-white/10 rounded-xl p-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <label className="text-sm">Bio</label>
          <textarea className="w-full bg-white/10 rounded-xl p-2" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={() => onSave(form)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-red-500">Save</button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Item Edit Modal ---------------- */
function ItemEditModal({ item, onClose, onSave }) {
  const [title, setTitle] = useState(item.title || "");
  const [desc, setDesc] = useState(item.description || "");
  const [newFile, setNewFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (newFile) {
      const url = URL.createObjectURL(newFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [newFile]);

  const handleSave = () => {
    onSave({
      id: item.id,
      type: item.__type || "initiative",
      title: title,
      description: desc,
      newFile: newFile || null
    });
  };

  return (
    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="bg-gray-900 p-6 rounded-2xl max-w-lg w-full border border-white/10" initial={{ y: 20 }} animate={{ y: 0 }}>
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">Edit {item.__type === "bill" ? "Bill" : "Initiative"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X /></button>
        </div>

        <div className="space-y-3">
          <label className="text-sm">Title</label>
          <input className="w-full bg-white/10 rounded-xl p-2" value={title} onChange={(e) => setTitle(e.target.value)} />

          <label className="text-sm">Description</label>
          <textarea className="w-full bg-white/10 rounded-xl p-2" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />

          <label className="text-sm">Replace Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />

          {preview && <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-md mt-2" />}
          {!preview && item.image_base64 && <img src={item.image_base64} alt="existing" className="w-full h-40 object-cover rounded-md mt-2" />}
          {!preview && !item.image_base64 && item.image_blob && <img src={bytesToBase64(item.image_blob)} alt="existing" className="w-full h-40 object-cover rounded-md mt-2" />}
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-red-500">Save</button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
