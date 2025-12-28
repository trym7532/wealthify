import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Download, FileText, FileSpreadsheet, Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/lib/currency";
import { format, subMonths, subQuarters, subYears, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";

type ExportFormat = "csv" | "pdf";
type DataType = "transactions" | "budgets" | "goals";
type DateRangePreset = "all" | "last-month" | "last-quarter" | "last-year" | "custom";

export function DataExportSection() {
  const [selectedData, setSelectedData] = useState<DataType[]>(["transactions"]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("all");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const { currency, format: formatAmount } = useCurrency();

  const getDateRange = (): { start: Date | null; end: Date | null } => {
    const now = new Date();
    
    switch (dateRangePreset) {
      case "last-month": {
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      }
      case "last-quarter": {
        const lastQuarter = subQuarters(now, 1);
        return { start: startOfQuarter(lastQuarter), end: endOfQuarter(lastQuarter) };
      }
      case "last-year": {
        const lastYear = subYears(now, 1);
        return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
      }
      case "custom":
        return { start: customStartDate || null, end: customEndDate || null };
      default:
        return { start: null, end: null };
    }
  };

  const getDateRangeLabel = (): string => {
    const { start, end } = getDateRange();
    if (!start && !end) return "All time";
    if (start && end) return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
    if (start) return `From ${format(start, "MMM d, yyyy")}`;
    if (end) return `Until ${format(end, "MMM d, yyyy")}`;
    return "All time";
  };

  const toggleDataType = (type: DataType) => {
    setSelectedData((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const results: Record<string, any[]> = {};
    const { start, end } = getDateRange();

    if (selectedData.includes("transactions")) {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
      
      if (start) query = query.gte("transaction_date", format(start, "yyyy-MM-dd"));
      if (end) query = query.lte("transaction_date", format(end, "yyyy-MM-dd"));
      
      const { data, error } = await query;
      if (error) throw error;
      results.transactions = data || [];
    }

    if (selectedData.includes("budgets")) {
      let query = supabase
        .from("budgets")
        .select("*")
        .order("category", { ascending: true });
      
      if (start) query = query.gte("created_at", start.toISOString());
      if (end) query = query.lte("created_at", end.toISOString());
      
      const { data, error } = await query;
      if (error) throw error;
      results.budgets = data || [];
    }

    if (selectedData.includes("goals")) {
      let query = supabase
        .from("financial_goals")
        .select("*")
        .order("target_date", { ascending: true });
      
      if (start) query = query.gte("created_at", start.toISOString());
      if (end) query = query.lte("created_at", end.toISOString());
      
      const { data, error } = await query;
      if (error) throw error;
      results.goals = data || [];
    }

    return results;
  };

  const generateCSV = (data: Record<string, any[]>) => {
    const sections: string[] = [];

    if (data.transactions?.length) {
      const headers = ["Date", "Description", "Category", "Type", "Amount", "Merchant"];
      const rows = data.transactions.map((t) => [
        t.transaction_date,
        t.description || "",
        t.category,
        t.transaction_type,
        t.amount,
        t.merchant_name || ""
      ]);
      sections.push(`TRANSACTIONS\n${headers.join(",")}\n${rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")}`);
    }

    if (data.budgets?.length) {
      const headers = ["Category", "Limit Amount", "Period", "Created At"];
      const rows = data.budgets.map((b) => [
        b.category,
        b.limit_amount,
        b.period,
        format(new Date(b.created_at), "yyyy-MM-dd")
      ]);
      sections.push(`BUDGETS\n${headers.join(",")}\n${rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")}`);
    }

    if (data.goals?.length) {
      const headers = ["Goal Name", "Type", "Target Amount", "Current Amount", "Target Date", "Priority"];
      const rows = data.goals.map((g) => [
        g.goal_name,
        g.goal_type,
        g.target_amount,
        g.current_amount || 0,
        g.target_date || "No date",
        g.priority || "Medium"
      ]);
      sections.push(`FINANCIAL GOALS\n${headers.join(",")}\n${rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")}`);
    }

    return sections.join("\n\n");
  };

  const generatePDFContent = (data: Record<string, any[]>) => {
    const dateRangeLabel = getDateRangeLabel();
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
          h2 { color: #4f46e5; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #6366f1; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background: #f9fafb; }
          .summary { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount-positive { color: #10b981; }
          .amount-negative { color: #ef4444; }
          .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
          .date-range { background: #f3f4f6; padding: 10px 15px; border-radius: 6px; display: inline-block; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>Wealthify Financial Report</h1>
        <p>Generated on ${format(new Date(), "MMMM dd, yyyy 'at' HH:mm")}</p>
        <p>Currency: ${currency}</p>
        <div class="date-range"><strong>Date Range:</strong> ${dateRangeLabel}</div>
    `;

    if (data.transactions?.length) {
      const totalIncome = data.transactions
        .filter((t) => t.transaction_type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = data.transactions
        .filter((t) => t.transaction_type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      html += `
        <h2>Transactions (${data.transactions.length} records)</h2>
        <div class="summary">
          <strong>Summary:</strong> 
          Total Income: <span class="amount-positive">${formatAmount(totalIncome)}</span> | 
          Total Expenses: <span class="amount-negative">${formatAmount(totalExpenses)}</span> | 
          Net: <span class="${totalIncome - totalExpenses >= 0 ? 'amount-positive' : 'amount-negative'}">${formatAmount(totalIncome - totalExpenses)}</span>
        </div>
        <table>
          <tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr>
          ${data.transactions.map((t) => `
            <tr>
              <td>${t.transaction_date}</td>
              <td>${t.description || "-"}</td>
              <td>${t.category}</td>
              <td>${t.transaction_type}</td>
              <td class="${t.transaction_type === 'income' ? 'amount-positive' : 'amount-negative'}">
                ${t.transaction_type === 'income' ? '+' : '-'}${formatAmount(Math.abs(t.amount))}
              </td>
            </tr>
          `).join("")}
        </table>
      `;
    }

    if (data.budgets?.length) {
      html += `
        <h2>Budgets (${data.budgets.length} records)</h2>
        <table>
          <tr><th>Category</th><th>Limit</th><th>Period</th></tr>
          ${data.budgets.map((b) => `
            <tr>
              <td>${b.category}</td>
              <td>${formatAmount(b.limit_amount)}</td>
              <td>${b.period}</td>
            </tr>
          `).join("")}
        </table>
      `;
    }

    if (data.goals?.length) {
      html += `
        <h2>Financial Goals (${data.goals.length} records)</h2>
        <table>
          <tr><th>Goal</th><th>Type</th><th>Target</th><th>Current</th><th>Progress</th><th>Target Date</th></tr>
          ${data.goals.map((g) => {
            const progress = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
            return `
              <tr>
                <td>${g.goal_name}</td>
                <td>${g.goal_type}</td>
                <td>${formatAmount(g.target_amount)}</td>
                <td>${formatAmount(g.current_amount || 0)}</td>
                <td>${progress}%</td>
                <td>${g.target_date || "No date"}</td>
              </tr>
            `;
          }).join("")}
        </table>
      `;
    }

    html += `
        <div class="footer">
          <p>This report was generated by Wealthify - Your Personal Finance Manager</p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (selectedData.length === 0) {
      toast.error("Please select at least one data type to export");
      return;
    }

    if (dateRangePreset === "custom" && !customStartDate && !customEndDate) {
      toast.error("Please select at least one date for custom range");
      return;
    }

    setIsExporting(true);
    try {
      const data = await fetchData();
      const timestamp = format(new Date(), "yyyy-MM-dd");
      
      if (exportFormat === "csv") {
        const csv = generateCSV(data);
        downloadFile(csv, `wealthify-export-${timestamp}.csv`, "text/csv");
        toast.success("CSV exported successfully");
      } else {
        const html = generatePDFContent(data);
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 500);
          toast.success("PDF report opened - use Print dialog to save as PDF");
        } else {
          downloadFile(html, `wealthify-report-${timestamp}.html`, "text/html");
          toast.success("Report downloaded as HTML - open and print to save as PDF");
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-primary" />
        Export Data
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Download your financial data as CSV or PDF reports
      </p>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Select data to export</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="transactions"
                checked={selectedData.includes("transactions")}
                onCheckedChange={() => toggleDataType("transactions")}
              />
              <label htmlFor="transactions" className="text-sm cursor-pointer">
                Transactions
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="budgets"
                checked={selectedData.includes("budgets")}
                onCheckedChange={() => toggleDataType("budgets")}
              />
              <label htmlFor="budgets" className="text-sm cursor-pointer">
                Budgets
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="goals"
                checked={selectedData.includes("goals")}
                onCheckedChange={() => toggleDataType("goals")}
              />
              <label htmlFor="goals" className="text-sm cursor-pointer">
                Financial Goals
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Date range</Label>
          <Select value={dateRangePreset} onValueChange={(v) => setDateRangePreset(v as DateRangePreset)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="last-month">Last month</SelectItem>
              <SelectItem value="last-quarter">Last quarter</SelectItem>
              <SelectItem value="last-year">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateRangePreset === "custom" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Start date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[160px] justify-start text-left font-normal",
                      !customStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, "MMM d, yyyy") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">End date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[160px] justify-start text-left font-normal",
                      !customEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, "MMM d, yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Export format</Label>
          <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV Spreadsheet
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF Report
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={isExporting || selectedData.length === 0}
          className="w-full sm:w-auto"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export {exportFormat.toUpperCase()}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
