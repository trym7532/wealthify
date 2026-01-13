import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  Landmark, TrendingUp, PiggyBank, PieChart,
  Banknote, Coins, ArrowUpRight, BarChart3,
  Wallet, CreditCard, DollarSign, Target
} from "lucide-react";

interface FloatingIconsProps {
  variant?: "full" | "subtle" | "minimal";
  className?: string;
}

const iconSets = {
  full: [
    { Icon: Landmark, color: "text-emerald-400", glow: "drop-shadow-[0_0_15px_rgba(52,211,153,0.9)]", x: "5%", y: "15%", size: 32, delay: 0 },
    { Icon: TrendingUp, color: "text-cyan-400", glow: "drop-shadow-[0_0_15px_rgba(34,211,238,0.9)]", x: "92%", y: "20%", size: 36, delay: 0.5 },
    { Icon: PiggyBank, color: "text-pink-400", glow: "drop-shadow-[0_0_15px_rgba(244,114,182,0.9)]", x: "8%", y: "45%", size: 34, delay: 1 },
    { Icon: PieChart, color: "text-violet-400", glow: "drop-shadow-[0_0_15px_rgba(167,139,250,0.9)]", x: "90%", y: "55%", size: 30, delay: 1.5 },
    { Icon: ArrowUpRight, color: "text-emerald-500", glow: "drop-shadow-[0_0_15px_rgba(16,185,129,1)]", x: "4%", y: "75%", size: 28, delay: 2 },
    { Icon: BarChart3, color: "text-amber-400", glow: "drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]", x: "95%", y: "80%", size: 32, delay: 2.5 },
    { Icon: Wallet, color: "text-cyan-300", glow: "drop-shadow-[0_0_15px_rgba(103,232,249,0.9)]", x: "15%", y: "30%", size: 26, delay: 3 },
    { Icon: CreditCard, color: "text-emerald-300", glow: "drop-shadow-[0_0_15px_rgba(110,231,183,0.9)]", x: "85%", y: "35%", size: 28, delay: 3.5 },
    { Icon: Target, color: "text-pink-300", glow: "drop-shadow-[0_0_15px_rgba(249,168,212,0.9)]", x: "6%", y: "60%", size: 30, delay: 4 },
    { Icon: DollarSign, color: "text-amber-300", glow: "drop-shadow-[0_0_15px_rgba(252,211,77,0.9)]", x: "94%", y: "10%", size: 34, delay: 4.5 },
  ],
  subtle: [
    { Icon: Landmark, color: "text-emerald-400/70", glow: "drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]", x: "5%", y: "20%", size: 24, delay: 0 },
    { Icon: TrendingUp, color: "text-cyan-400/70", glow: "drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]", x: "92%", y: "25%", size: 28, delay: 0.5 },
    { Icon: PiggyBank, color: "text-pink-400/70", glow: "drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]", x: "8%", y: "70%", size: 26, delay: 1 },
    { Icon: PieChart, color: "text-violet-400/70", glow: "drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]", x: "90%", y: "75%", size: 24, delay: 1.5 },
  ],
  minimal: [
    { Icon: TrendingUp, color: "text-emerald-400/50", glow: "drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]", x: "95%", y: "15%", size: 20, delay: 0 },
    { Icon: PiggyBank, color: "text-pink-400/50", glow: "drop-shadow-[0_0_8px_rgba(244,114,182,0.3)]", x: "5%", y: "80%", size: 22, delay: 0.5 },
  ],
};

const goldCoins = [
  { x: "10%", y: "35%", size: 40, delay: 0 },
  { x: "88%", y: "42%", size: 44, delay: 0.8 },
  { x: "6%", y: "85%", size: 36, delay: 1.6 },
  { x: "92%", y: "88%", size: 38, delay: 2.4 },
];

const dollarBills = [
  { x: "20%", y: "25%", rotation: 15 },
  { x: "80%", y: "60%", rotation: -18 },
  { x: "12%", y: "55%", rotation: 8 },
  { x: "88%", y: "30%", rotation: -12 },
];

const glowOrbs = [
  { color: "bg-emerald-500/15", x: "15%", y: "25%", size: 450 },
  { color: "bg-cyan-500/10", x: "75%", y: "35%", size: 500 },
  { color: "bg-violet-500/10", x: "25%", y: "70%", size: 400 },
  { color: "bg-amber-500/8", x: "85%", y: "80%", size: 350 },
];

export const FloatingIcons = ({ variant = "full", className = "" }: FloatingIconsProps) => {
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const layer1Y = useTransform(smoothProgress, [0, 1], [0, -120]);
  const layer2Y = useTransform(smoothProgress, [0, 1], [0, -60]);
  const layer3Y = useTransform(smoothProgress, [0, 1], [0, -30]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const icons = iconSets[variant];
  const showCoinsAndBills = variant === "full";

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* Ambient Glow Orbs */}
      <motion.div style={{ y: layer3Y }}>
        {glowOrbs.map((orb, i) => (
          <motion.div
            key={`orb-${i}`}
            className={`absolute rounded-full blur-[120px] ${orb.color}`}
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              x: smoothMouseX,
              y: smoothMouseY,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Floating Icons */}
      <motion.div style={{ y: layer2Y }}>
        {icons.map((item, i) => (
          <motion.div
            key={`icon-${i}`}
            className={`absolute ${item.color} ${item.glow}`}
            style={{ 
              left: item.x, 
              top: item.y,
              x: smoothMouseX,
              y: smoothMouseY,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -15, 0],
              rotate: [-5, 5, -5],
            }}
            transition={{
              opacity: { duration: 0.5, delay: item.delay * 0.1 },
              scale: { duration: 0.5, delay: item.delay * 0.1 },
              y: { duration: 4 + (i % 3), repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 5 + (i % 2), repeat: Infinity, ease: "easeInOut" },
            }}
            whileHover={{ scale: 1.3 }}
          >
            <item.Icon size={item.size} strokeWidth={1.5} />
          </motion.div>
        ))}
      </motion.div>

      {/* Gold Coins */}
      {showCoinsAndBills && (
        <motion.div style={{ y: layer1Y }}>
          {goldCoins.map((coin, i) => (
            <motion.div
              key={`coin-${i}`}
              className="absolute"
              style={{ 
                left: coin.x, 
                top: coin.y,
                x: smoothMouseX,
                y: smoothMouseY,
              }}
              initial={{ opacity: 0, scale: 0, rotateY: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -12, 0],
                rotateY: [0, 360],
              }}
              transition={{
                opacity: { duration: 0.5, delay: coin.delay * 0.1 },
                scale: { duration: 0.5, delay: coin.delay * 0.1 },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
                rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
              }}
            >
              <div
                className="rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 flex items-center justify-center"
                style={{
                  width: coin.size,
                  height: coin.size,
                  boxShadow: "0 8px 30px rgba(251, 191, 36, 0.7), inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.3)",
                }}
              >
                <span className="text-amber-900 font-bold" style={{ fontSize: coin.size * 0.4 }}>$</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Dollar Bills */}
      {showCoinsAndBills && (
        <motion.div style={{ y: layer2Y }}>
          {dollarBills.map((bill, i) => (
            <motion.div
              key={`bill-${i}`}
              className="absolute"
              style={{ 
                left: bill.x, 
                top: bill.y,
                rotate: bill.rotation,
                x: smoothMouseX,
                y: smoothMouseY,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 0.9,
                scale: 1,
                y: [0, -18, 0],
                rotate: [bill.rotation, bill.rotation + 5, bill.rotation - 5, bill.rotation],
              }}
              transition={{
                opacity: { duration: 0.5, delay: i * 0.2 },
                scale: { duration: 0.5, delay: i * 0.2 },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
                rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <div 
                className="relative rounded-sm overflow-hidden"
                style={{
                  width: 65,
                  height: 28,
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
                  boxShadow: "0 6px 20px rgba(34, 197, 94, 0.6)",
                }}
              >
                <div className="absolute inset-1 border border-green-300/50 rounded-sm flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-green-200/80" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background pointer-events-none" />
    </div>
  );
};

export default FloatingIcons;