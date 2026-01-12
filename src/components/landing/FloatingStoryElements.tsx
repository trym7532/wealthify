import { motion, useScroll, useTransform } from "framer-motion";
import { 
  DollarSign, TrendingUp, Wallet, PiggyBank, 
  Bitcoin, CreditCard, Landmark, BarChart3,
  LineChart, Coins, Target, Sparkles,
  ArrowUpRight, Shield, Brain, Zap
} from "lucide-react";

const floatingIcons = [
  { Icon: DollarSign, color: "text-emerald-400", x: "5%", y: "15%", size: 24 },
  { Icon: TrendingUp, color: "text-cyan-400", x: "92%", y: "20%", size: 28 },
  { Icon: Wallet, color: "text-violet-400", x: "12%", y: "45%", size: 22 },
  { Icon: PiggyBank, color: "text-pink-400", x: "88%", y: "55%", size: 26 },
  { Icon: Bitcoin, color: "text-amber-400", x: "8%", y: "75%", size: 20 },
  { Icon: CreditCard, color: "text-blue-400", x: "95%", y: "70%", size: 24 },
  { Icon: BarChart3, color: "text-emerald-300", x: "3%", y: "90%", size: 22 },
  { Icon: LineChart, color: "text-cyan-300", x: "97%", y: "85%", size: 26 },
  { Icon: Coins, color: "text-amber-300", x: "15%", y: "30%", size: 20 },
  { Icon: Target, color: "text-violet-300", x: "85%", y: "35%", size: 24 },
  { Icon: Brain, color: "text-pink-300", x: "6%", y: "60%", size: 18 },
  { Icon: Shield, color: "text-emerald-500", x: "94%", y: "45%", size: 22 },
  { Icon: Zap, color: "text-amber-500", x: "10%", y: "85%", size: 20 },
  { Icon: Sparkles, color: "text-cyan-500", x: "90%", y: "15%", size: 24 },
];

const glowOrbs = [
  { color: "bg-emerald-500/15", x: "15%", y: "25%", size: 400 },
  { color: "bg-cyan-500/10", x: "75%", y: "50%", size: 450 },
  { color: "bg-violet-500/10", x: "40%", y: "75%", size: 350 },
  { color: "bg-pink-500/8", x: "85%", y: "20%", size: 300 },
];

const sparkleParticles = Array.from({ length: 25 }, (_, i) => ({
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  delay: Math.random() * 5,
  size: Math.random() * 3 + 1,
}));

const goldCoins = [
  { x: "8%", y: "35%", size: 35 },
  { x: "92%", y: "30%", size: 40 },
  { x: "5%", y: "65%", size: 38 },
  { x: "95%", y: "60%", size: 36 },
];

export const FloatingStoryElements = () => {
  const { scrollYProgress } = useScroll();
  
  // Parallax transforms for different layers
  const layer1Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const layer3Y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Ambient Glow Orbs - Slowest parallax */}
      <motion.div style={{ y: layer3Y }}>
        {glowOrbs.map((orb, i) => (
          <motion.div
            key={`orb-${i}`}
            className={`absolute rounded-full blur-3xl ${orb.color}`}
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Floating Finance Icons - Medium parallax */}
      <motion.div style={{ y: layer2Y }}>
        {floatingIcons.map((item, i) => (
          <motion.div
            key={`icon-${i}`}
            className={`absolute ${item.color} opacity-30`}
            style={{ left: item.x, top: item.y }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              y: [0, -25, 0],
              rotate: [0, 15, -15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 7 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          >
            <item.Icon size={item.size} />
          </motion.div>
        ))}
      </motion.div>

      {/* Gold Coins - Fast parallax */}
      <motion.div style={{ y: layer1Y }}>
        {goldCoins.map((coin, i) => (
          <motion.div
            key={`coin-${i}`}
            className="absolute"
            style={{ left: coin.x, top: coin.y }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              y: [0, -20, 0],
              rotateY: [0, 360],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: i * 1.2,
              ease: "easeInOut",
            }}
          >
            <div
              className="rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-lg flex items-center justify-center"
              style={{
                width: coin.size,
                height: coin.size,
                boxShadow: "0 4px 20px rgba(251, 191, 36, 0.4), inset 0 -2px 5px rgba(0,0,0,0.2)",
              }}
            >
              <span className="text-amber-800 font-bold text-sm">$</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Sparkle Particles */}
      {sparkleParticles.map((sparkle, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute bg-white rounded-full"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
    </div>
  );
};

export default FloatingStoryElements;
