import { motion } from "framer-motion";

const bars = [
  { height: 45, color: "from-emerald-400 to-emerald-600", delay: 0 },
  { height: 65, color: "from-cyan-400 to-cyan-600", delay: 0.1 },
  { height: 35, color: "from-violet-400 to-violet-600", delay: 0.2 },
  { height: 80, color: "from-amber-400 to-amber-600", delay: 0.3 },
  { height: 55, color: "from-pink-400 to-pink-600", delay: 0.4 },
  { height: 70, color: "from-blue-400 to-blue-600", delay: 0.5 },
];

export const AnimatedBarChart = () => {
  return (
    <div className="flex items-end justify-center gap-2 h-24 px-4">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className={`w-6 rounded-t-md bg-gradient-to-t ${bar.color} shadow-lg`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: bar.height, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: bar.delay,
            ease: "easeOut",
          }}
          whileHover={{
            scaleY: 1.1,
            transition: { duration: 0.2 },
          }}
          style={{
            boxShadow: `0 0 15px ${bar.color.includes('emerald') ? 'rgba(52, 211, 153, 0.4)' : 
              bar.color.includes('cyan') ? 'rgba(34, 211, 238, 0.4)' :
              bar.color.includes('violet') ? 'rgba(167, 139, 250, 0.4)' :
              bar.color.includes('amber') ? 'rgba(251, 191, 36, 0.4)' :
              bar.color.includes('pink') ? 'rgba(244, 114, 182, 0.4)' :
              'rgba(96, 165, 250, 0.4)'}`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBarChart;
