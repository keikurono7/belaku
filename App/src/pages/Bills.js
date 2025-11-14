import React from "react";
import { motion } from "framer-motion";


const fadeAnim = {
initial: { opacity: 0, y: 20 },
animate: { opacity: 1, y: 0 },
exit: { opacity: 0, y: -20 },
};


export default function Bills() {
return (
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
<p className="text-gray-300">Summary of bill {item}.</p>
</motion.div>
))}
</div>
</motion.div>
);
}