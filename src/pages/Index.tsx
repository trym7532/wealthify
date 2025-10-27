import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap, Brain, ArrowRight, Wallet, DollarSign, PieChart, CreditCard } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
        <div className="hero-gradient-bg absolute inset-0 -z-10" />
        <div className="finance-icons-pattern absolute inset-0 -z-10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20 backdrop-blur-sm">
              <Zap className="w-4 h-4" />
              AI-Powered Financial Intelligence
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              Take Control of Your <span className="text-gradient">Finances</span> with AI
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Experience the future of personal finance with AI-powered insights, intelligent forecasting, 
              and beautiful dashboards that make managing money effortless.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="premium" size="lg" className="w-full sm:w-auto animate-glow-pulse">
                  Get Started — It's Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Live Demo
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-50" />
            <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl hover:shadow-[var(--shadow-elegant)] transition-all duration-500">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Financial Overview</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary/70 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-accent/70 animate-pulse delay-150" />
                    <div className="w-3 h-3 rounded-full bg-success/70 animate-pulse delay-300" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-muted-foreground font-medium">Total Balance</span>
                    </div>
                    <span className="text-2xl font-bold text-gradient">₹12,450</span>
                  </div>
                  
                  <div className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-success/10 to-transparent border border-success/20 hover:border-success/40 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-success" />
                      </div>
                      <span className="text-muted-foreground font-medium">Monthly Savings</span>
                    </div>
                    <span className="text-xl font-bold text-success">+₹1,230</span>
                  </div>
                  
                  <div className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-accent/10 to-transparent border border-accent/20 hover:border-accent/40 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <PieChart className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-muted-foreground font-medium">Investment ROI</span>
                    </div>
                    <span className="text-xl font-bold text-accent">+15.2%</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground pt-2 border-t border-border/30">
                  Real-time insights powered by advanced AI algorithms to optimize your financial future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16 space-y-4 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Everything You Need to <span className="text-gradient">Master Wealth</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto">
            Powerful features designed for the modern investor and saver
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Brain,
              title: "AI Predictions",
              description: "Advanced machine learning models forecast spending patterns and suggest smart optimizations",
              gradient: "from-primary/20 to-primary/5"
            },
            {
              icon: TrendingUp,
              title: "Smart Analytics",
              description: "Beautiful data visualizations that transform complex financial data into actionable insights",
              gradient: "from-success/20 to-success/5"
            },
            {
              icon: Shield,
              title: "Bank-Level Security",
              description: "Enterprise-grade encryption and security protocols protect your sensitive financial data",
              gradient: "from-accent/20 to-accent/5"
            },
            {
              icon: Zap,
              title: "Real-Time Sync",
              description: "Instant updates across all your accounts with seamless integration and sync",
              gradient: "from-destructive/20 to-destructive/5"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-primary/50 transition-all duration-500 hover:shadow-[var(--shadow-elegant)] animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[var(--shadow-glow)] transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-background" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="relative rounded-3xl border border-border/50 bg-gradient-to-br from-card/80 to-secondary/50 backdrop-blur-xl p-12 sm:p-16 text-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="relative z-10 space-y-6 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Ready to Transform Your <span className="text-gradient">Financial Future?</span>
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Join thousands of smart investors who trust Wealthify to achieve their financial goals with AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/register" className="inline-block w-full sm:w-auto">
                <Button variant="premium" size="lg" className="w-full sm:w-auto">
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/dashboard" className="inline-block w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
