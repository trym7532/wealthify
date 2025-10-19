import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: { label: string; value: number; color: string; }[];
  total: number;
}

export default function StatDetailDialog({ 
  open, 
  onOpenChange, 
  title, 
  data,
  total 
}: StatDetailDialogProps) {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      data: data.map(d => d.value),
      backgroundColor: data.map(d => d.color),
      borderColor: 'hsl(220 14% 11%)',
      borderWidth: 2,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'hsl(0 0% 92%)',
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'hsl(220 14% 11%)',
        titleColor: 'hsl(0 0% 92%)',
        bodyColor: 'hsl(220 9% 65%)',
        borderColor: 'hsl(220 12% 20%)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    onHover: (event: any, elements: any[]) => {
      event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    },
    elements: {
      arc: {
        borderWidth: 3,
        hoverBorderWidth: 5,
        hoverOffset: 15
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="h-[300px]">
            <Pie data={chartData} options={options} />
          </div>
          <div className="space-y-2">
            {data.map((item, idx) => (
              <div 
                key={idx} 
                className="flex justify-between items-center p-3 bg-surface rounded-lg hover:bg-surface/80 transition-all hover:scale-105 cursor-pointer group"
                style={{
                  boxShadow: `0 0 20px ${item.color}20`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded transition-all group-hover:scale-125 group-hover:shadow-lg" 
                    style={{ 
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}80`
                    }}
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${item.value.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {((item.value / total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
