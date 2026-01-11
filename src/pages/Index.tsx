import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap, Brain, ArrowRight, Sparkles } from "lucide-react";
import FloatingElements from "@/components/landing/FloatingElements";
import AnimatedBarChart from "@/components/landing/AnimatedBarChart";
import FeatureCard from "@/components/landing/FeatureCard";
import StatsCounter from "@/components/landing/StatsCounter";
import TestimonialCard from "@/components/landing/TestimonialCard";
import InteractiveDemo from "@/components/landing/InteractiveDemo";

const features = [
  {
    icon: Brain,
    title: "AI Predictions",
    description: "Machine learning models forecast your spending patterns and suggest optimizations",
    gradient: "from-emerald-400 to-emerald-600",
    glowColor: "#10b981",
  },
  {
    icon: TrendingUp,
    title: "Smart Analytics",
    description: "Beautiful visualizations and insights that make complex data easy to understand",
    gradient: "from-cyan-400 to-cyan-600",
    glowColor: "#06b6d4",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your financial data is encrypted and protected with industry-leading security",
    gradient: "from-violet-400 to-violet-600",
    glowColor: "#8b5cf6",
  },
  {
    icon: Zap,
    title: "Real-Time Sync",
    description: "Connect your accounts and get instant updates on all your financial activities",
    gradient: "from-amber-400 to-amber-600",
    glowColor: "#f59e0b",
  },
];

const stats = [
  { value: "$2.5M", label: "Assets Tracked", gradient: "from-emerald-400 to-cyan-400" },
  { value: "10000+", label: "Happy Users", gradient: "from-violet-400 to-pink-400" },
  { value: "99.9%", label: "Uptime", gradient: "from-amber-400 to-orange-400" },
  { value: "4.9", label: "User Rating", gradient: "from-blue-400 to-indigo-400", suffix: "/5" },
];

const testimonials = [
  {
    quote: "Wealthify transformed how I manage my finances. The AI insights are incredibly accurate!",
    author: "Sarah Chen",
    role: "Product Manager",
    rating: 5,
  },
  {
    quote: "Finally, a finance app that's both powerful and beautiful. Love the predictions feature.",
    author: "Marcus Johnson",
    role: "Entrepreneur",
    rating: 5,
  },
  {
    quote: "The budget tracking helped me save $500/month. Highly recommend to everyone!",
    author: "Emily Rodriguez",
    role: "Designer",
    rating: 5,
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Floating Background Elements */}
      <FloatingElements />

      {/* Hero Section */}
      <section className="py-8 sm:py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div 
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-primary/20 to-cyan-500/20 text-primary text-xs sm:text-sm font-medium border border-primary/30"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Financial Intelligence
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Wealthify — <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">Smarter</span> personal finance
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              AI-powered expense forecasting, intelligent budget planning, and beautiful dashboards 
              to help you take control of your financial future.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/register" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 hover:from-emerald-400 hover:via-cyan-400 hover:to-violet-400 text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg transition-all duration-300 border-0"
                    style={{
                      boxShadow: "0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(6, 182, 212, 0.2)",
                    }}
                  >
                    Get started — it's free
                    <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-primary/30 hover:border-primary/60 hover:bg-primary/5">
                    View demo
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Interactive Demo */}
          <InteractiveDemo />
        </div>
      </section>

      {/* Stats Section */}
      <motion.section 
        className="py-8 sm:py-16 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <StatsCounter
              key={stat.label}
              value={stat.value}
              label={stat.label}
              gradient={stat.gradient}
              suffix={stat.suffix}
              delay={i * 0.1}
            />
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-8 sm:py-16 relative z-10">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Everything you need to manage wealth
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Powerful features designed for the modern investor
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              glowColor={feature.glowColor}
              delay={i * 0.1}
            />
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-8 sm:py-16 relative z-10">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Loved by thousands
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            See what our users have to say about Wealthify
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard
              key={testimonial.author}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              rating={testimonial.rating}
              delay={i * 0.15}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-8 sm:py-16 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <motion.div 
          className="card-surface text-center bg-gradient-to-br from-card via-card to-primary/5 relative overflow-hidden group"
          whileHover={{ scale: 1.01 }}
          style={{
            boxShadow: "0 0 60px rgba(16, 185, 129, 0.1)",
          }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                "radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.1), transparent 50%)",
                "radial-gradient(circle at 100% 100%, rgba(6, 182, 212, 0.1), transparent 50%)",
                "radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.1), transparent 50%)",
                "radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.1), transparent 50%)",
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 relative z-10">
            Ready to take control of your finances?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto relative z-10">
            Join thousands of users who are already using Wealthify to achieve their financial goals
          </p>
          <Link to="/register" className="inline-block w-full sm:w-auto relative z-10">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="w-full sm:w-auto font-semibold text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-lg transition-all duration-300 text-white border-0"
                style={{
                  background: "linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6, #ec4899, #f59e0b, #10b981)",
                  backgroundSize: "300% 300%",
                  animation: "rainbow 5s ease infinite",
                  boxShadow: "0 0 40px rgba(16, 185, 129, 0.4), 0 0 80px rgba(139, 92, 246, 0.2)",
                }}
              >
                Start your free trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.section>

      {/* Rainbow animation keyframes */}
      <style>{`
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </Layout>
  );
};

export default Index;
