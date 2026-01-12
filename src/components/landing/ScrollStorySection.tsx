import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  Brain, BarChart3, TrendingUp, PieChart,
  Sparkles, FileText, Bot, Lightbulb
} from "lucide-react";

interface TechFeature {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const techFeatures: TechFeature[] = [
  {
    title: "AI Auto-Categorization",
    description: "Our intelligent AI automatically categorizes every transaction, eliminating manual work and ensuring 99% accuracy",
    icon: Brain,
    iconColor: "text-violet-400",
    gradientFrom: "from-violet-500/20",
    gradientTo: "to-purple-500/10",
  },
  {
    title: "Smart Charts & Tracking",
    description: "Beautiful real-time visualizations that show exactly where your money flows with interactive insights",
    icon: BarChart3,
    iconColor: "text-cyan-400",
    gradientFrom: "from-cyan-500/20",
    gradientTo: "to-blue-500/10",
  },
  {
    title: "AI Investment Suggestions",
    description: "Get personalized investment recommendations powered by machine learning and market analysis",
    icon: TrendingUp,
    iconColor: "text-emerald-400",
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-green-500/10",
  },
  {
    title: "Auto Investment Breakdown",
    description: "Instantly see your portfolio allocation with AI-generated insights on risk and diversification",
    icon: PieChart,
    iconColor: "text-pink-400",
    gradientFrom: "from-pink-500/20",
    gradientTo: "to-rose-500/10",
  },
  {
    title: "Intelligent Reports",
    description: "Weekly and monthly AI-generated financial reports with actionable recommendations",
    icon: FileText,
    iconColor: "text-amber-400",
    gradientFrom: "from-amber-500/20",
    gradientTo: "to-orange-500/10",
  },
];

const FeatureCard = ({ 
  feature, 
  index 
}: { 
  feature: TechFeature; 
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 0.9", "start 0.3"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  const Icon = feature.icon;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={cardRef}
      className={`flex items-center gap-8 mb-24 ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}
      style={{ opacity, y, scale }}
    >
      {/* Icon Section */}
      <motion.div
        className={`flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} backdrop-blur-sm border border-white/10 flex items-center justify-center`}
        whileHover={{ scale: 1.05, rotate: 3 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <motion.div
          animate={{ 
            y: [0, -8, 0],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
          }}
        >
          <Icon className={`w-16 h-16 md:w-20 md:h-20 ${feature.iconColor}`} strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      {/* Content Section */}
      <div className={`flex-1 ${isEven ? "md:text-left" : "md:text-right"}`}>
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
          whileHover={{ scale: 1.02 }}
        >
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI Powered</span>
        </motion.div>
        
        <h3 className={`text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r ${
          isEven ? "from-white to-white/70" : "from-white/70 to-white"
        } bg-clip-text text-transparent`}>
          {feature.title}
        </h3>
        
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
          {feature.description}
        </p>
      </div>
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
    <section ref={containerRef} className="relative py-20 px-4 max-w-6xl mx-auto">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted/30 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 via-primary to-pink-500"
          style={{ width: progressBarWidth }}
        />
      </div>

      {/* Section Header */}
      <motion.div
        className="text-center mb-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-white/10 mb-6"
          whileHover={{ scale: 1.02 }}
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Powered by Advanced AI
          </span>
        </motion.div>
        
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            How Our Technology
          </span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Secures Your Future
          </span>
        </h2>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience the power of artificial intelligence working for your financial well-being
        </p>
      </motion.div>

      {/* Feature Cards */}
      {techFeatures.map((feature, index) => (
        <FeatureCard key={feature.title} feature={feature} index={index} />
      ))}

      {/* Bottom Glow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-t from-primary/20 to-transparent rounded-full blur-3xl pointer-events-none"
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </section>
  );
};

export default ScrollStorySection;
