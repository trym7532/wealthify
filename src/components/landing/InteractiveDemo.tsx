import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, DollarSign, ShoppingCart, Coffee, Car, 
  Home, Utensils, Zap, TrendingUp, TrendingDown, 
  Lightbulb, ArrowRight, Sparkles, CreditCard,
  PiggyBank, Target, AlertTriangle, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import AnimatedBarChart from "./AnimatedBarChart";

interface DemoTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: Date;
}

interface DemoInsight {
  id: string;
  type: "warning" | "success" | "tip";
  title: string;
  message: string;
  icon: React.ReactNode;
}

const categoryIcons: Record<string, React.ReactNode> = {
  shopping: <ShoppingCart className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  coffee: <Coffee className="w-4 h-4" />,
  transport: <Car className="w-4 h-4" />,
  housing: <Home className="w-4 h-4" />,
  utilities: <Zap className="w-4 h-4" />,
  income: <DollarSign className="w-4 h-4" />,
};

const categories = [
  { value: "shopping", label: "Shopping", color: "from-pink-400 to-pink-600" },
  { value: "food", label: "Food & Dining", color: "from-orange-400 to-orange-600" },
  { value: "coffee", label: "Coffee & Drinks", color: "from-amber-400 to-amber-600" },
  { value: "transport", label: "Transport", color: "from-blue-400 to-blue-600" },
  { value: "housing", label: "Housing", color: "from-violet-400 to-violet-600" },
  { value: "utilities", label: "Utilities", color: "from-cyan-400 to-cyan-600" },
];

const initialTransactions: DemoTransaction[] = [
  { id: "1", description: "Salary", amount: 5000, category: "income", type: "income", date: new Date() },
  { id: "2", description: "Grocery Store", amount: 150, category: "food", type: "expense", date: new Date() },
  { id: "3", description: "Gas Station", amount: 60, category: "transport", type: "expense", date: new Date() },
];

export const InteractiveDemo = () => {
  const [transactions, setTransactions] = useState<DemoTransaction[]>(initialTransactions);
  const [insights, setInsights] = useState<DemoInsight[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    category: "shopping",
    type: "expense" as "income" | "expense",
  });

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Category spending
  const categorySpending = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Generate insights based on transactions
  useEffect(() => {
    const newInsights: DemoInsight[] = [];

    // Savings rate insight
    if (savingsRate >= 20) {
      newInsights.push({
        id: "savings-good",
        type: "success",
        title: "Great Savings Rate!",
        message: `You're saving ${savingsRate.toFixed(0)}% of your income. Keep it up!`,
        icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      });
    } else if (savingsRate < 10 && savingsRate >= 0) {
      newInsights.push({
        id: "savings-low",
        type: "warning",
        title: "Low Savings Alert",
        message: `Your savings rate is ${savingsRate.toFixed(0)}%. Try to save at least 20%.`,
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      });
    }

    // Category-specific insights
    const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] > totalExpenses * 0.4) {
      newInsights.push({
        id: "category-high",
        type: "tip",
        title: `High ${topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1)} Spending`,
        message: `${topCategory[0]} accounts for ${((topCategory[1] / totalExpenses) * 100).toFixed(0)}% of expenses.`,
        icon: <Lightbulb className="w-5 h-5 text-cyan-400" />,
      });
    }

    // Budget suggestion
    if (transactions.length >= 3) {
      newInsights.push({
        id: "budget-tip",
        type: "tip",
        title: "AI Budget Suggestion",
        message: `Based on your spending, set a monthly budget of $${Math.round(totalExpenses * 1.1)} to stay on track.`,
        icon: <Target className="w-5 h-5 text-violet-400" />,
      });
    }

    setInsights(newInsights);

    // Show CTA after adding transactions
    if (transactions.length > initialTransactions.length) {
      setTimeout(() => setShowCTA(true), 1500);
    }
  }, [transactions, savingsRate, categorySpending, totalExpenses]);

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    const transaction: DemoTransaction = {
      id: Date.now().toString(),
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.type === "income" ? "income" : newTransaction.category,
      type: newTransaction.type,
      date: new Date(),
    };

    setTransactions([...transactions, transaction]);
    setNewTransaction({ description: "", amount: "", category: "shopping", type: "expense" });
    setShowAddForm(false);
  };

  const handleRemoveTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <motion.div
      className="card-surface bg-gradient-to-br from-card via-card to-secondary/30 backdrop-blur-xl relative overflow-hidden group"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      style={{
        boxShadow: "0 0 50px rgba(16, 185, 129, 0.15), 0 20px 60px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Glowing border effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent, rgba(6, 182, 212, 0.1))",
        }}
      />

      <div className="space-y-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Live Demo</h3>
          </div>
          <div className="flex gap-1.5">
            <motion.div className="w-3 h-3 rounded-full bg-red-500" whileHover={{ scale: 1.2 }} />
            <motion.div className="w-3 h-3 rounded-full bg-yellow-500" whileHover={{ scale: 1.2 }} />
            <motion.div className="w-3 h-3 rounded-full bg-green-500" whileHover={{ scale: 1.2 }} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2">
          <motion.div
            className="p-3 rounded-lg bg-background/50 text-center"
            key={balance}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className={`text-lg font-bold ${balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              ${balance.toLocaleString()}
            </p>
          </motion.div>
          <motion.div
            className="p-3 rounded-lg bg-background/50 text-center"
            key={totalIncome}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-lg font-bold text-emerald-400">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              ${totalIncome.toLocaleString()}
            </p>
          </motion.div>
          <motion.div
            className="p-3 rounded-lg bg-background/50 text-center"
            key={totalExpenses}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-lg font-bold text-red-400">
              <TrendingDown className="w-3 h-3 inline mr-1" />
              ${totalExpenses.toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Recent Transactions</p>
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-3 h-3" />
              Add
            </motion.button>
          </div>
          
          <AnimatePresence mode="popLayout">
            {transactions.slice(-5).reverse().map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-2 rounded-lg bg-background/30 hover:bg-background/50 transition-colors group/item"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${t.type === "income" ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                    {categoryIcons[t.category] || <DollarSign className="w-4 h-4" />}
                  </div>
                  <span className="text-sm truncate max-w-[100px]">{t.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
                  </span>
                  {t.id !== "1" && t.id !== "2" && t.id !== "3" && (
                    <button
                      onClick={() => handleRemoveTransaction(t.id)}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-red-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Transaction Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Add Transaction</p>
                  <button onClick={() => setShowAddForm(false)}>
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      placeholder="e.g., Coffee"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                      className="h-8 text-sm bg-background/50"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      className="h-8 text-sm bg-background/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(v) => setNewTransaction({ ...newTransaction, type: v as "income" | "expense" })}
                    >
                      <SelectTrigger className="h-8 text-sm bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newTransaction.type === "expense" && (
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select
                        value={newTransaction.category}
                        onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}
                      >
                        <SelectTrigger className="h-8 text-sm bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleAddTransaction}
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Add Transaction
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Insights */}
        <AnimatePresence mode="popLayout">
          {insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Lightbulb className="w-4 h-4 text-primary" />
                AI Insights
              </p>
              {insights.slice(0, 2).map((insight, i) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-2 rounded-lg border ${
                    insight.type === "warning"
                      ? "bg-amber-500/10 border-amber-500/30"
                      : insight.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-cyan-500/10 border-cyan-500/30"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {insight.icon}
                    <div>
                      <p className="text-xs font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">{insight.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spending Chart */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-2">Spending by Category</p>
          <AnimatedBarChart />
        </div>

        {/* CTA */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2"
            >
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium">Love the demo?</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Create a free account to track real transactions, set budgets, and get personalized AI insights!
                </p>
                <Link to="/register">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                      Create Free Account
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showCTA && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Try adding transactions above to see AI insights in action! ✨
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default InteractiveDemo;
