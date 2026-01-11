import { motion } from "framer-motion";
import { 
  DollarSign, TrendingUp, Wallet, PiggyBank, 
  Bitcoin, CreditCard, Landmark, BarChart3,
  LineChart, Coins, Receipt, ArrowUpRight
} from "lucide-react";

const financeIcons = [
  { Icon: DollarSign, color: "text-emerald-400", x: "5%", y: "15%", size: 24, delay: 0 },
  { Icon: TrendingUp, color: "text-cyan-400", x: "92%", y: "20%", size: 28, delay: 0.5 },
  { Icon: Wallet, color: "text-violet-400", x: "15%", y: "75%", size: 22, delay: 1 },
  { Icon: PiggyBank, color: "text-pink-400", x: "88%", y: "65%", size: 26, delay: 1.5 },
  { Icon: Bitcoin, color: "text-amber-400", x: "8%", y: "45%", size: 20, delay: 2 },
  { Icon: CreditCard, color: "text-blue-400", x: "95%", y: "40%", size: 24, delay: 2.5 },
  { Icon: Landmark, color: "text-emerald-300", x: "12%", y: "88%", size: 22, delay: 3 },
  { Icon: BarChart3, color: "text-cyan-300", x: "85%", y: "85%", size: 26, delay: 3.5 },
  { Icon: LineChart, color: "text-violet-300", x: "3%", y: "55%", size: 20, delay: 4 },
  { Icon: Coins, color: "text-amber-300", x: "97%", y: "50%", size: 24, delay: 4.5 },
  { Icon: Receipt, color: "text-pink-300", x: "20%", y: "25%", size: 18, delay: 5 },
  { Icon: ArrowUpRight, color: "text-emerald-500", x: "80%", y: "12%", size: 22, delay: 5.5 },
  { Icon: DollarSign, color: "text-cyan-500", x: "25%", y: "92%", size: 20, delay: 6 },
  { Icon: TrendingUp, color: "text-violet-500", x: "75%", y: "78%", size: 24, delay: 6.5 },
  { Icon: Wallet, color: "text-amber-500", x: "6%", y: "35%", size: 18, delay: 7 },
  { Icon: PiggyBank, color: "text-blue-300", x: "94%", y: "30%", size: 22, delay: 7.5 },
  { Icon: Bitcoin, color: "text-emerald-400", x: "18%", y: "60%", size: 16, delay: 8 },
  { Icon: CreditCard, color: "text-pink-500", x: "82%", y: "92%", size: 20, delay: 8.5 },
];

const goldCoins = [
  { x: "10%", y: "30%", delay: 0, size: 40 },
  { x: "90%", y: "25%", delay: 1, size: 35 },
  { x: "15%", y: "70%", delay: 2, size: 45 },
  { x: "85%", y: "75%", delay: 3, size: 38 },
  { x: "50%", y: "10%", delay: 4, size: 42 },
  { x: "55%", y: "90%", delay: 5, size: 36 },
];

const dollarBills = [
  { x: "20%", y: "20%", delay: 0, rotation: 15 },
  { x: "78%", y: "35%", delay: 1.5, rotation: -10 },
  { x: "25%", y: "80%", delay: 3, rotation: 8 },
  { x: "72%", y: "85%", delay: 4.5, rotation: -15 },
];

const sparkles = Array.from({ length: 20 }, (_, i) => ({
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  delay: Math.random() * 5,
  size: Math.random() * 4 + 2,
}));

const glowOrbs = [
  { color: "bg-emerald-500/20", x: "10%", y: "20%", size: 300 },
  { color: "bg-cyan-500/15", x: "80%", y: "60%", size: 350 },
  { color: "bg-violet-500/10", x: "50%", y: "80%", size: 280 },
];

const currencySymbols = [
  { symbol: "$", x: "5%", y: "40%", delay: 0 },
  { symbol: "€", x: "92%", y: "45%", delay: 1 },
  { symbol: "£", x: "8%", y: "80%", delay: 2 },
  { symbol: "¥", x: "88%", y: "15%", delay: 3 },
  { symbol: "₿", x: "15%", y: "10%", delay: 4 },
  { symbol: "%", x: "85%", y: "88%", delay: 5 },
];

export const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Ambient Glow Orbs */}
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
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Finance Icons */}
      {financeIcons.map((item, i) => (
        <motion.div
          key={`icon-${i}`}
          className={`absolute ${item.color} opacity-40`}
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut",
          }}
        >
          <item.Icon size={item.size} />
        </motion.div>
      ))}

      {/* Floating 3D Gold Coins */}
      {goldCoins.map((coin, i) => (
        <motion.div
          key={`coin-${i}`}
          className="absolute"
          style={{ left: coin.x, top: coin.y }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.6, 0.9, 0.6],
            y: [0, -15, 0],
            rotateY: [0, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: coin.delay,
            ease: "easeInOut",
          }}
        >
          <div
            className="rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-lg"
            style={{
              width: coin.size,
              height: coin.size,
              boxShadow: "0 4px 20px rgba(251, 191, 36, 0.4), inset 0 -2px 5px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.3)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-amber-800 font-bold text-lg">
              $
            </div>
          </div>
        </motion.div>
      ))}

      {/* Floating Dollar Bills */}
      {dollarBills.map((bill, i) => (
        <motion.div
          key={`bill-${i}`}
          className="absolute"
          style={{ left: bill.x, top: bill.y }}
          initial={{ opacity: 0, rotate: bill.rotation }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            x: [0, 10, -10, 0],
            y: [0, -8, 0],
            rotate: [bill.rotation, bill.rotation + 5, bill.rotation - 5, bill.rotation],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: bill.delay,
            ease: "easeInOut",
          }}
        >
          <div 
            className="rounded-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 shadow-md flex items-center justify-center text-white font-bold text-xs"
            style={{
              width: 60,
              height: 28,
              boxShadow: "0 2px 10px rgba(16, 185, 129, 0.3)",
            }}
          >
            $100
          </div>
        </motion.div>
      ))}

      {/* Sparkle Particles */}
      {sparkles.map((sparkle, i) => (
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
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Currency Symbols */}
      {currencySymbols.map((item, i) => (
        <motion.div
          key={`currency-${i}`}
          className="absolute text-primary/30 font-bold text-2xl"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -12, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut",
          }}
        >
          {item.symbol}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;
