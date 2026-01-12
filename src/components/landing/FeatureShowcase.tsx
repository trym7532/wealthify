import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Brain, TrendingUp, Shield, Zap, Target, Wallet } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Predictions",
    description: "Machine learning models forecast your spending and suggest optimizations",
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "Smart Analytics",
    description: "Beautiful visualizations that make complex data easy to understand",
    gradient: "from-cyan-400 to-cyan-600",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set financial goals and watch your progress with real-time updates",
    gradient: "from-violet-400 to-violet-600",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your financial data is encrypted with industry-leading protection",
    gradient: "from-pink-400 to-pink-600",
  },
  {
    icon: Zap,
    title: "Real-Time Sync",
    description: "Instant updates on all your financial activities across accounts",
    gradient: "from-amber-400 to-amber-600",
  },
  {
    icon: Wallet,
    title: "Budget Management",
    description: "Smart budgets that adapt to your spending patterns automatically",
    gradient: "from-blue-400 to-blue-600",
  },
];

const FeatureCard = ({ 
  feature, 
  index 
}: { 
  feature: typeof features[0]; 
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);

  const Icon = feature.icon;

  return (
    <motion.div
      ref={cardRef}
      style={{ opacity, y, scale }}
      className="group"
    >
      <motion.div
        className="relative p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-white/10 h-full"
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
          animate={{ 
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            delay: index * 0.5 
          }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>

        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
        <p className="text-muted-foreground">{feature.description}</p>

        {/* Hover glow effect */}
        <motion.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
        />
      </motion.div>
    </motion.div>
  );
};

export const FeatureShowcase = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.3], [30, 0]);

  return (
    <section ref={sectionRef} className="py-24 relative">
      <motion.div
        className="text-center mb-16"
        style={{ opacity: headerOpacity, y: headerY }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Everything You Need
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Powerful features designed for the modern investor and saver
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
};

export default FeatureShowcase;
