import ExpenseChart from "../components/ExpenseChart";
import { TrendingUp, Wallet, PiggyBank, CreditCard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your spending, budgets, and financial insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-surface">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Total Balance</span>
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">$12,450.00</div>
            <div className="text-xs text-success mt-1">+12% from last month</div>
          </div>

          <div className="card-surface">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Monthly Spend</span>
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">$1,750.00</div>
            <div className="text-xs text-muted-foreground mt-1">78% of budget</div>
          </div>

          <div className="card-surface">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Savings</span>
              <PiggyBank className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">$5,230.00</div>
            <div className="text-xs text-success mt-1">+8% this month</div>
          </div>

          <div className="card-surface">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Investments</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">$8,920.00</div>
            <div className="text-xs text-success mt-1">+15% ROI</div>
          </div>
        </div>

        {/* Charts and Budget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-surface">
            <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
            <ExpenseChart />
          </div>

          <div className="card-surface">
            <h3 className="text-lg font-semibold mb-4">Budget Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Groceries</span>
                  <span className="font-medium">$420 / $500</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Transportation</span>
                  <span className="font-medium">$180 / $300</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Entertainment</span>
                  <span className="font-medium">$95 / $200</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '47.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Dining Out</span>
                  <span className="font-medium">$320 / $400</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card-surface">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {[
              { name: 'Whole Foods Market', category: 'Groceries', amount: -52.40, date: 'Today' },
              { name: 'Uber', category: 'Transportation', amount: -18.50, date: 'Yesterday' },
              { name: 'Netflix', category: 'Entertainment', amount: -15.99, date: '2 days ago' },
              { name: 'Salary Deposit', category: 'Income', amount: 4200.00, date: '5 days ago' },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <div className="font-medium">{tx.name}</div>
                  <div className="text-xs text-muted-foreground">{tx.category} • {tx.date}</div>
                </div>
                <div className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-foreground'}`}>
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
