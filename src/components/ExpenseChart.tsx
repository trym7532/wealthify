import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { useCurrency, CURRENCIES } from '@/lib/currency';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MonthlyData {
  month: string;
  amount: number;
}

interface ExpenseChartProps {
  data?: MonthlyData[];
}

export default function ExpenseChart({ data = [] }: ExpenseChartProps) {
  const { currency, format } = useCurrency();
  const currencySymbol = CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol || currency;
  
  // Default demo data if none provided
  const demoData = data.length > 0 ? data : [
    { month: '2024-08', amount: 1450 },
    { month: '2024-09', amount: 1680 },
    { month: '2024-10', amount: 1520 },
    { month: '2024-11', amount: 1890 },
    { month: '2024-12', amount: 2100 },
    { month: '2025-01', amount: 1750 },
  ];

  const labels = demoData.map(d => {
    const date = new Date(d.month + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });
  const values = demoData.map(d => d.amount);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Monthly Spend',
        data: values,
        fill: true,
        tension: 0.4,
        backgroundColor: 'rgba(0, 200, 150, 0.08)',
        borderColor: 'hsl(164 100% 39%)',
        pointBackgroundColor: 'hsl(164 100% 39%)',
        pointBorderColor: 'hsl(225 14% 6%)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(220 14% 11%)',
        titleColor: 'hsl(0 0% 92%)',
        bodyColor: 'hsl(220 9% 65%)',
        borderColor: 'hsl(220 12% 20%)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => format(context.parsed.y),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: 'hsl(220 12% 20% / 0.3)',
        },
        ticks: {
          color: 'hsl(220 9% 65%)',
          callback: (value) => `${currencySymbol}${value}`,
        },
      },
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(220 9% 65%)',
        },
      },
    },
  };

  // Calculate insights
  const hasIncreasingTrend = values.length >= 2 && values[values.length - 1] > values[0];
  const avgSpending = values.reduce((a, b) => a + b, 0) / values.length;
  const lastMonthSpend = values[values.length - 1];
  
  let insight = "";
  let insightType: 'info' | 'warning' | 'success' = 'info';
  
  if (lastMonthSpend > avgSpending * 1.2) {
    insight = `Your spending is 20% above average. Consider reviewing your expenses.`;
    insightType = 'warning';
  } else if (lastMonthSpend < avgSpending * 0.8) {
    insight = `Great job! You're spending 20% less than your average.`;
    insightType = 'success';
  } else if (hasIncreasingTrend) {
    insight = `Your spending trend is increasing. Monitor your expenses closely.`;
    insightType = 'warning';
  } else {
    insight = `Your spending is stable. Keep tracking to maintain good habits.`;
    insightType = 'info';
  }

  return (
    <div className="space-y-3">
      {values.length > 0 && (
        <div className={`p-3 rounded-lg border ${
          insightType === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
          insightType === 'success' ? 'bg-green-500/5 border-green-500/20' :
          'bg-accent/5 border-accent/20'
        }`}>
          <div className="flex items-start gap-2">
            <div className="text-xs leading-relaxed text-muted-foreground">
              💡 {insight}
            </div>
          </div>
        </div>
      )}
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
