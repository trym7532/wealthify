import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import InteractiveDemo from "./InteractiveDemo";

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <section ref={containerRef} className="min-h-screen relative flex flex-col items-center justify-center py-20">
      {/* Main Centered Title */}
      <motion.div
        className="text-center mb-12 relative z-10"
        style={{ y: titleY, opacity: titleOpacity, scale: titleScale }}
      >
        {/* Glowing backdrop */}
        <motion.div
          className="absolute inset-0 blur-3xl"
          animate={{
            background: [
              "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-cyan-500/20 text-primary text-sm font-medium border border-primary/30 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles className="w-4 h-4" />
          AI-Powered Financial Intelligence
        </motion.div>

        <motion.h1 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.span
            className="inline-block"
            animate={{
              textShadow: [
                "0 0 40px rgba(16, 185, 129, 0.3)",
                "0 0 80px rgba(6, 182, 212, 0.4)",
                "0 0 40px rgba(139, 92, 246, 0.3)",
                "0 0 40px rgba(16, 185, 129, 0.3)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Wealthify
            </span>
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-2xl sm:text-3xl md:text-4xl font-medium text-muted-foreground mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Your Financial Transformation Starts Here
        </motion.p>

        <motion.p 
          className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-10 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          AI-powered expense forecasting, intelligent budget planning, and beautiful dashboards 
          to help you take control of your financial future.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link to="/register">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 hover:from-emerald-400 hover:via-cyan-400 hover:to-violet-400 text-white font-semibold text-lg px-10 py-7 shadow-lg transition-all duration-300 border-0"
                style={{
                  boxShadow: "0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(6, 182, 212, 0.2)",
                }}
              >
                Get started — it's free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Interactive Demo Below */}
      <motion.div
        className="w-full max-w-2xl mx-auto px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <p className="text-sm text-muted-foreground font-medium">
            ✨ Try it now — no signup required
          </p>
        </motion.div>
        <InteractiveDemo />
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-muted-foreground"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-sm font-medium">Scroll to explore your journey</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
