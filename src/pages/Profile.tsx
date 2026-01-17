import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Mail, Save, Shield, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import FloatingIcons from "@/components/ui/FloatingIcons";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      setEmail(user.email || "");
      setCreatedAt(user.created_at ? new Date(user.created_at).toLocaleDateString() : "");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setFullName(data.full_name || "");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <FloatingIcons variant="minimal" className="opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 relative z-10 max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass p-8 border border-white/5">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-2xl font-bold text-primary-foreground">
                    {fullName ? getInitials(fullName) : <User className="w-10 h-10" />}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <Shield className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              </motion.div>
              <p className="mt-4 text-lg font-semibold">{fullName || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="h-12 bg-background/50"
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="h-12 bg-background/30 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Member Since
                </Label>
                <Input
                  value={createdAt}
                  disabled
                  className="h-12 bg-background/30 text-muted-foreground"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  onClick={updateProfile} 
                  disabled={loading} 
                  className="w-full h-12 text-base font-semibold gap-2"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Profile
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass p-6 border border-white/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Account Security
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                <span className="text-sm">Email verified</span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                <span className="text-sm">Two-factor authentication</span>
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Not enabled</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
