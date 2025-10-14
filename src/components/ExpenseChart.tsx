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
          label: (context) => `$${context.parsed.y.toLocaleString()}`,
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
          callback: (value) => `$${value}`,
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

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
