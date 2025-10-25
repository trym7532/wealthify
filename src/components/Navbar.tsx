import { Link, useLocation } from "react-router-dom";
import { Wallet, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-all">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-background" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight">Wealthify</span>
        </Link>
        
        <div className="flex items-center gap-3 sm:gap-6">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link 
                to="/hub" 
                className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Hub</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
