import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, ChevronRight } from "lucide-react";


const fadeAnim = {
initial: { opacity: 0, y: 20 },
animate: { opacity: 1, y: 0 },
exit: { opacity: 0, y: -20 },
};


export default function Discussions() {
const topics = ["Education Reform", "Road Safety", "Water Management", "Budget Planning"];


return (
<motion.div {...fadeAnim} key="discussions">
<h2 className="text-3xl font-bold mb-6">Discussions</h2>


<div className="space-y-4">
{topics.map((topic) => (
<motion.div
key={topic}
whileHover={{ scale: 1.02 }}
className="p-5 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 flex items-center justify-between cursor-pointer"
>
<div className="flex items-center gap-3">
<MessageSquare className="w-6 h-6 text-yellow-400" />
<span className="font-semibold">{topic}</span>
</div>
<ChevronRight className="w-5 h-5 text-gray-300" />
</motion.div>
))}
</div>
</motion.div>
);
}