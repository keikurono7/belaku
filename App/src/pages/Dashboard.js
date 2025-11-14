import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import TopTabs from "./TopTabs";
import Initiatives from "./Initiatives";
import Bills from "./Bills";
import Booths from "./Booths";
import Discussions from "./Discussions";


export default function DashboardPage() {
const [activeTab, setActiveTab] = useState("initiatives");


return (
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white p-6">
<TopTabs activeTab={activeTab} setActiveTab={setActiveTab} />


<div className="container mx-auto mt-6">
<AnimatePresence mode="wait">
{activeTab === "initiatives" && <Initiatives key="initiatives" />}
{activeTab === "bills" && <Bills key="bills" />}
{activeTab === "booths" && <Booths key="booths" />}
{activeTab === "discussions" && <Discussions key="discussions" />}
</AnimatePresence>
</div>
</div>
);
}