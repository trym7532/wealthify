import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Landmark, TrendingUp, PiggyBank, PieChart,
  Banknote, Coins, ArrowUpRight, BarChart3
} from "lucide-react";

// Bright, vibrant icons with specific finance theme
const floatingIcons = [
  { Icon: Landmark, color: "text-emerald-300", glow: "drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]", x: "4%", y: "12%", size: 32 },
  { Icon: TrendingUp, color: "text-cyan-300", glow: "drop-shadow-[0_0_12px_rgba(103,232,249,0.8)]", x: "94%", y: "18%", size: 36 },
  { Icon: PiggyBank, color: "text-pink-300", glow: "drop-shadow-[0_0_12px_rgba(249,168,212,0.8)]", x: "8%", y: "45%", size: 34 },
  { Icon: PieChart, color: "text-violet-300", glow: "drop-shadow-[0_0_12px_rgba(196,181,253,0.8)]", x: "92%", y: "52%", size: 30 },
  { Icon: ArrowUpRight, color: "text-emerald-400", glow: "drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]", x: "6%", y: "78%", size: 28 },
  { Icon: BarChart3, color: "text-amber-300", glow: "drop-shadow-[0_0_12px_rgba(252,211,77,0.8)]", x: "96%", y: "75%", size: 32 },
  { Icon: Landmark, color: "text-cyan-400", glow: "drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]", x: "12%", y: "28%", size: 26 },
  { Icon: PiggyBank, color: "text-emerald-300", glow: "drop-shadow-[0_0_12px_rgba(110,231,183,0.8)]", x: "88%", y: "35%", size: 28 },
  { Icon: TrendingUp, color: "text-pink-400", glow: "drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]", x: "3%", y: "62%", size: 30 },
  { Icon: PieChart, color: "text-amber-400", glow: "drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]", x: "97%", y: "88%", size: 34 },
];

const glowOrbs = [
  { color: "bg-emerald-500/20", x: "10%", y: "20%", size: 500 },
  { color: "bg-cyan-500/15", x: "80%", y: "40%", size: 550 },
  { color: "bg-violet-500/15", x: "30%", y: "70%", size: 450 },
  { color: "bg-pink-500/12", x: "70%", y: "85%", size: 400 },
];

const goldCoins = [
  { x: "7%", y: "38%", size: 44 },
  { x: "93%", y: "28%", size: 50 },
  { x: "4%", y: "68%", size: 46 },
  { x: "96%", y: "58%", size: 42 },
  { x: "10%", y: "88%", size: 38 },
  { x: "90%", y: "8%", size: 40 },
];

const dollarBills = [
  { x: "15%", y: "22%", rotation: 15 },
  { x: "85%", y: "45%", rotation: -20 },
  { x: "5%", y: "55%", rotation: 10 },
  { x: "95%", y: "72%", rotation: -15 },
];

export const FloatingStoryElements = () => {
  const { scrollYProgress } = useScroll();
  
  // Smooth parallax with CSS will-change for GPU acceleration
  const layer1Y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const layer3Y = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Ambient Glow Orbs - GPU optimized */}
      <motion.div 
        className="will-change-transform" 
        style={{ y: layer3Y }}
      >
        {glowOrbs.map((orb, i) => (
          <motion.div
            key={`orb-${i}`}
            className={`absolute rounded-full blur-[100px] ${orb.color}`}
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Floating Bright Icons - Medium parallax */}
      <motion.div 
        className="will-change-transform" 
        style={{ y: layer2Y }}
      >
        {floatingIcons.map((item, i) => (
          <motion.div
            key={`icon-${i}`}
            className={`absolute ${item.color} ${item.glow}`}
            style={{ left: item.x, top: item.y }}
            animate={{
              y: [0, -15, 0],
              rotate: [-5, 5, -5],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            <item.Icon size={item.size} strokeWidth={1.5} />
          </motion.div>
        ))}
      </motion.div>

      {/* Gold Coins - Fast parallax with 3D spin */}
      <motion.div 
        className="will-change-transform" 
        style={{ y: layer1Y }}
      >
        {goldCoins.map((coin, i) => (
          <motion.div
            key={`coin-${i}`}
            className="absolute"
            style={{ left: coin.x, top: coin.y }}
            animate={{
              y: [0, -12, 0],
              rotateY: [0, 360],
            }}
            transition={{
              y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
              rotateY: { duration: 4, repeat: Infinity, ease: "linear", delay: i * 0.3 },
            }}
          >
            <div
              className="rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 flex items-center justify-center"
              style={{
                width: coin.size,
                height: coin.size,
                boxShadow: "0 6px 25px rgba(251, 191, 36, 0.6), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.3)",
              }}
            >
              <span className="text-amber-900 font-bold" style={{ fontSize: coin.size * 0.4 }}>$</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Dollar Bills */}
      <motion.div 
        className="will-change-transform" 
        style={{ y: layer2Y }}
      >
        {dollarBills.map((bill, i) => (
          <motion.div
            key={`bill-${i}`}
            className="absolute"
            style={{ 
              left: bill.x, 
              top: bill.y,
              rotate: bill.rotation,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [bill.rotation, bill.rotation + 5, bill.rotation - 5, bill.rotation],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          >
            <div 
              className="relative rounded-sm overflow-hidden"
              style={{
                width: 70,
                height: 30,
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
                boxShadow: "0 4px 15px rgba(34, 197, 94, 0.5)",
              }}
            >
              <div className="absolute inset-1 border border-green-300/40 rounded-sm flex items-center justify-center">
                <Banknote className="w-6 h-6 text-green-200/70" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Upward Chart Arrows */}
      <motion.div 
        className="will-change-transform" 
        style={{ y: layer1Y }}
      >
        {[
          { x: "18%", y: "35%", delay: 0 },
          { x: "82%", y: "65%", delay: 1 },
          { x: "25%", y: "75%", delay: 2 },
        ].map((arrow, i) => (
          <motion.div
            key={`arrow-${i}`}
            className="absolute text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.9)]"
            style={{ left: arrow.x, top: arrow.y }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: arrow.delay,
            }}
          >
            <ArrowUpRight size={36} strokeWidth={2} />
          </motion.div>
        ))}
      </motion.div>

      {/* Gradient mesh background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background pointer-events-none" />
    </div>
  );
};

export default FloatingStoryElements;
