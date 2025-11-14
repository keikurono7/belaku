import React, { useState } from "react";
import { motion } from "framer-motion";


const fadeAnim = {
initial: { opacity: 0, y: 20 },
animate: { opacity: 1, y: 0 },
exit: { opacity: 0, y: -20 },
};


export default function Booths() {
const regions = ["Bengaluru", "Mysuru", "Udupi", "Dharwad"];
const mockPoliticians = {
Bengaluru: ["Person A", "Person B", "Person C"],
Mysuru: ["Person D", "Person E"],
Udupi: ["Person F"],
Dharwad: ["Person G", "Person H"],
};


const [selectedRegion, setSelectedRegion] = useState("");


return (
<motion.div {...fadeAnim} key="booths">
<h2 className="text-3xl font-bold mb-6">Booths</h2>


<div className="flex gap-4 mb-6">
{regions.map((r) => (
<button
key={r}
onClick={() => setSelectedRegion(r)}
className={`px-4 py-2 rounded-full font-medium transition
${selectedRegion === r ? "bg-yellow-500 text-black" : "bg-white/10"}`}
>
{r}
</button>
))}
</div>


<div>
{!selectedRegion ? (
<p className="text-gray-300">Select a region to view politicians.</p>
) : (
<div className="grid md:grid-cols-2 gap-4">
{mockPoliticians[selectedRegion].map((p) => (
<div key={p} className="p-4 bg-white/5 rounded-lg border border-white/5">
<h4 className="font-semibold">{p}</h4>
<p className="text-sm text-gray-300">Representative details (mock).</p>
</div>
))}
</div>
)}
</div>
</motion.div>
);
}