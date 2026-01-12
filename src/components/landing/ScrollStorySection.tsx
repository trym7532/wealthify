import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  TrendingDown, TrendingUp, AlertCircle, CheckCircle, 
  Frown, Smile, PiggyBank, Wallet, Target, Brain,
  BarChart3, Shield, Zap, Sparkles
} from "lucide-react";

interface StoryStage {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  bgGradient: string;
  side: "left" | "right" | "center";
}

const beforeStages: StoryStage[] = [
  {
    title: "Scattered Finances",
    description: "Bills everywhere, no clear picture of where money goes",
    icon: AlertCircle,
    iconColor: "text-red-400",
    bgGradient: "from-red-500/10 to-transparent",
    side: "left",
  },
  {
    title: "Stress & Uncertainty",
    description: "Constant worry about unexpected expenses and low savings",
    icon: Frown,
    iconColor: "text-orange-400",
    bgGradient: "from-orange-500/10 to-transparent",
    side: "right",
  },
  {
    title: "Missed Opportunities",
    description: "No visibility into spending patterns or investment potential",
    icon: TrendingDown,
    iconColor: "text-amber-400",
    bgGradient: "from-amber-500/10 to-transparent",
    side: "left",
  },
];

const afterStages: StoryStage[] = [
  {
    title: "Crystal Clear Overview",
    description: "Every transaction tracked, categorized, and visualized beautifully",
    icon: BarChart3,
    iconColor: "text-cyan-400",
    bgGradient: "from-cyan-500/10 to-transparent",
    side: "right",
  },
  {
    title: "Smart Savings",
    description: "AI-powered insights help you save more without sacrificing lifestyle",
    icon: PiggyBank,
    iconColor: "text-emerald-400",
    bgGradient: "from-emerald-500/10 to-transparent",
    side: "left",
  },
  {
    title: "Confident Investing",
    description: "Data-driven recommendations to grow your wealth intelligently",
    icon: TrendingUp,
    iconColor: "text-violet-400",
    bgGradient: "from-violet-500/10 to-transparent",
    side: "right",
  },
  {
    title: "Financial Peace",
    description: "Full control, clear goals, and the confidence to achieve them",
    icon: Smile,
    iconColor: "text-pink-400",
    bgGradient: "from-pink-500/10 to-transparent",
    side: "center",
  },
];

const StoryCard = ({ 
  stage, 
  index, 
  isBefore 
}: { 
  stage: StoryStage; 
  index: number; 
  isBefore: boolean;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  const x = useTransform(
    scrollYProgress, 
    [0, 0.5, 1], 
    [stage.side === "left" ? -100 : stage.side === "right" ? 100 : 0, 0, 0]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1]);

  const Icon = stage.icon;

  return (
    <motion.div
      ref={cardRef}
      className={`flex items-center gap-6 my-16 ${
        stage.side === "left" ? "justify-start" : 
        stage.side === "right" ? "justify-end" : "justify-center"
      }`}
      style={{ opacity, x, scale }}
    >
      <motion.div
        className={`relative p-8 rounded-3xl bg-gradient-to-br ${stage.bgGradient} backdrop-blur-sm border border-white/10 max-w-md
          ${isBefore ? "shadow-[0_0_40px_rgba(239,68,68,0.1)]" : "shadow-[0_0_40px_rgba(16,185,129,0.1)]"}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
            isBefore 
              ? "bg-gradient-to-br from-red-500/20 to-orange-500/20" 
              : "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"
          }`}
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            delay: index * 0.5 
          }}
        >
          <Icon className={`w-8 h-8 ${stage.iconColor}`} />
        </motion.div>
        
        <h3 className="text-2xl font-bold mb-2">{stage.title}</h3>
        <p className="text-muted-foreground text-lg">{stage.description}</p>

        {/* Floating decorative elements */}
        <motion.div
          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${
            isBefore ? "bg-red-400/30" : "bg-emerald-400/30"
          }`}
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
};

const TransitionDivider = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);

  return (
    <motion.div 
      ref={ref}
      className="relative py-24 flex flex-col items-center justify-center"
      style={{ opacity }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ scale }}
      >
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </motion.div>
      
      <motion.div
        className="relative z-10 bg-background px-8 py-6 rounded-full border-2 border-primary/30"
        animate={{ 
          boxShadow: [
            "0 0 30px rgba(16, 185, 129, 0.2)",
            "0 0 60px rgba(16, 185, 129, 0.4)",
            "0 0 30px rgba(16, 185, 129, 0.2)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Then Wealthify Happens
          </span>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
      </motion.div>

      {/* Animated particles around transition */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/40"
          style={{
            left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 20}%`,
            top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 20}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
};

export const ScrollStorySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const progressBarWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative py-20">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-red-400 via-primary to-violet-400"
          style={{ width: progressBarWidth }}
        />
      </div>

      {/* Vertical timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-red-400/30 via-primary/30 to-violet-400/30 transform -translate-x-1/2" />

      {/* Before Section Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-red-400">Before</span> Wealthify
        </h2>
        <p className="text-xl text-muted-foreground">The struggle was real...</p>
      </motion.div>

      {/* Before Stages */}
      {beforeStages.map((stage, index) => (
        <StoryCard key={stage.title} stage={stage} index={index} isBefore={true} />
      ))}

      {/* Transition Divider */}
      <TransitionDivider />

      {/* After Section Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">After</span> Wealthify
        </h2>
        <p className="text-xl text-muted-foreground">Your financial transformation</p>
      </motion.div>

      {/* After Stages */}
      {afterStages.map((stage, index) => (
        <StoryCard key={stage.title} stage={stage} index={index} isBefore={false} />
      ))}
    </section>
  );
};

export default ScrollStorySection;
