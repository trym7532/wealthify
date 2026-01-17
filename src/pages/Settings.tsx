import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Moon, Sun, Globe, Bell, Shield, Download, Palette, Languages, Lock, Trash2 } from "lucide-react";
import { useCurrency, CURRENCIES } from "@/lib/currency";
import { motion } from "framer-motion";
import { CurrencyChangeDialog } from "@/components/settings/CurrencyChangeDialog";
import { DataExportSection } from "@/components/settings/DataExportSection";
import FloatingIcons from "@/components/ui/FloatingIcons";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState<"light" | "dark">(
    localStorage.getItem("theme") as "light" | "dark" || "dark"
  );
  const { currency, setCurrency } = useCurrency();
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleCurrencySelect = (newCurrency: string) => {
    if (newCurrency !== currency) {
      setPendingCurrency(newCurrency);
      setShowCurrencyDialog(true);
    }
  };

  const handleConvertValues = () => {
    if (pendingCurrency) {
      setCurrency(pendingCurrency);
      toast.success(`Currency changed to ${pendingCurrency}. Values converted.`);
    }
    setShowCurrencyDialog(false);
    setPendingCurrency(null);
  };

  const handleKeepValues = () => {
    if (pendingCurrency) {
      setCurrency(pendingCurrency);
      toast.success(`Currency changed to ${pendingCurrency}. Values kept the same.`);
    }
    setShowCurrencyDialog(false);
    setPendingCurrency(null);
  };

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <FloatingIcons variant="minimal" className="opacity-20" />
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 relative z-10"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </motion.div>

        <div className="grid gap-6">
          {/* Appearance */}
          <motion.div variants={itemVariants}>
            <Card className="glass p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
                >
                  <Palette className="w-5 h-5 text-primary" />
                </motion.div>
                <h2 className="text-xl font-semibold">Appearance</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme">Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color theme
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="gap-2"
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="gap-2"
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={itemVariants}>
            <Card className="glass p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"
                >
                  <Bell className="w-5 h-5 text-accent" />
                </motion.div>
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your account activity
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on your device
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Preferences */}
          <motion.div variants={itemVariants}>
            <Card className="glass p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center"
                >
                  <Globe className="w-5 h-5 text-cyan-400" />
                </motion.div>
                <h2 className="text-xl font-semibold">Preferences</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    All financial data will be converted to your selected currency
                  </p>
                  <Select value={currency} onValueChange={handleCurrencySelect}>
                    <SelectTrigger id="currency" className="bg-background/50">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                        <SelectItem key={code} value={code}>
                          {code} ({symbol}) - {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="bg-background/50">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Data Export */}
          <motion.div variants={itemVariants}>
            <DataExportSection />
          </motion.div>

          {/* Privacy & Security */}
          <motion.div variants={itemVariants}>
            <Card className="glass p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-10 h-10 rounded-lg bg-violet-400/10 flex items-center justify-center"
                >
                  <Shield className="w-5 h-5 text-violet-400" />
                </motion.div>
                <h2 className="text-xl font-semibold">Privacy & Security</h2>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-background/50 hover:bg-background/80">
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-background/50 hover:bg-background/80">
                  <Shield className="w-4 h-4" />
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10 bg-background/50">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button onClick={handleSave} className="w-full h-12 text-base font-semibold">
              Save Settings
            </Button>
          </motion.div>
        </div>

        <CurrencyChangeDialog
          open={showCurrencyDialog}
          onOpenChange={setShowCurrencyDialog}
          fromCurrency={currency}
          toCurrency={pendingCurrency || currency}
          onConvert={handleConvertValues}
          onKeepValues={handleKeepValues}
        />
      </motion.div>
    </div>
  );
}
