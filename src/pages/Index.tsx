import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap, Brain, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              AI-Powered Financial Intelligence
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Wealthify — <span className="text-gradient">Smarter</span> personal finance
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              AI-powered expense forecasting, intelligent budget planning, and beautiful dashboards 
              to help you take control of your financial future.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-8 py-6 shadow-lg hover:shadow-[var(--shadow-glow)] transition-all">
                  Get started — it's free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="text-lg px-8 py-6 border-border/50 hover:border-primary/50">
                  View demo
                </Button>
              </Link>
            </div>
          </div>

          <div className="card-surface bg-gradient-to-br from-card to-secondary/30 backdrop-blur-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Quick Preview</h3>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                  <div className="w-3 h-3 rounded-full bg-primary/50" />
                </div>
              </div>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-muted-foreground">Total Balance</span>
                  <span className="text-xl font-bold text-gradient">$12,450</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-muted-foreground">Monthly Savings</span>
                  <span className="text-success text-lg font-semibold">+$1,230</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-muted-foreground">Investment Returns</span>
                  <span className="text-success text-lg font-semibold">+15% ROI</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground pt-4">
                Your dashboard will show spending trends, budgets, and AI-powered prediction insights 
                to help you make smarter financial decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to manage wealth</h2>
          <p className="text-muted-foreground text-lg">Powerful features designed for the modern investor</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-surface group hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-[var(--shadow-glow)] transition-all">
              <Brain className="w-6 h-6 text-background" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Predictions</h3>
            <p className="text-muted-foreground">
              Machine learning models forecast your spending patterns and suggest optimizations
            </p>
          </div>

          <div className="card-surface group hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-[var(--shadow-glow)] transition-all">
              <TrendingUp className="w-6 h-6 text-background" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
            <p className="text-muted-foreground">
              Beautiful visualizations and insights that make complex data easy to understand
            </p>
          </div>

          <div className="card-surface group hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-[var(--shadow-glow)] transition-all">
              <Shield className="w-6 h-6 text-background" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Bank-Level Security</h3>
            <p className="text-muted-foreground">
              Your financial data is encrypted and protected with industry-leading security
            </p>
          </div>

          <div className="card-surface group hover:border-primary/30 transition-all">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-[var(--shadow-glow)] transition-all">
              <Zap className="w-6 h-6 text-background" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Sync</h3>
            <p className="text-muted-foreground">
              Connect your accounts and get instant updates on all your financial activities
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="card-surface text-center bg-gradient-to-br from-card to-secondary/30">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already using Wealthify to achieve their financial goals
          </p>
          <Link to="/register">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-8 py-6 shadow-lg hover:shadow-[var(--shadow-glow)] transition-all">
              Start your free trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
