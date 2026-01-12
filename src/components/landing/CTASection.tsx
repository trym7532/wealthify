import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const CTASection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0]);

  return (
    <motion.section 
      ref={sectionRef}
      className="py-24 relative z-10"
      style={{ opacity, scale, y }}
    >
      <motion.div 
        className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-white/10 text-center overflow-hidden"
        whileHover={{ scale: 1.01 }}
        style={{
          boxShadow: "0 0 80px rgba(16, 185, 129, 0.15)",
        }}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.15), transparent 50%)",
              "radial-gradient(circle at 100% 100%, rgba(6, 182, 212, 0.15), transparent 50%)",
              "radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.15), transparent 50%)",
              "radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.15), transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Floating sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 2) * 60}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <Sparkles className="w-5 h-5 text-primary/40" />
          </motion.div>
        ))}

        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to Transform Your Finances?
        </motion.h2>
        
        <motion.p 
          className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Start your journey to financial freedom today. 
          Your future self will thank you.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <Link to="/register">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="font-semibold text-lg px-12 py-8 shadow-lg transition-all duration-300 text-white border-0"
                style={{
                  background: "linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6, #ec4899, #f59e0b, #10b981)",
                  backgroundSize: "300% 300%",
                  animation: "rainbow 5s ease infinite",
                  boxShadow: "0 0 50px rgba(16, 185, 129, 0.4), 0 0 100px rgba(139, 92, 246, 0.2)",
                }}
              >
                Start Your Free Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Rainbow animation keyframes */}
      <style>{`
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </motion.section>
  );
};

export default CTASection;
