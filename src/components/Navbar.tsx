import { Link, useLocation } from "react-router-dom";
import { Wallet, LayoutDashboard, LogOut, Sparkles, Menu, X, Settings, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link 
        to="/dashboard" 
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`flex items-center gap-2 ${mobile ? 'w-full px-4 py-3 rounded-lg' : ''} ${
          isActive('/dashboard') 
            ? 'text-primary font-medium' 
            : 'text-muted-foreground hover:text-primary'
        } transition-colors`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link 
        to="/hub" 
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`flex items-center gap-2 ${mobile ? 'w-full px-4 py-3 rounded-lg' : ''} ${
          isActive('/hub') 
            ? 'text-primary font-medium' 
            : 'text-muted-foreground hover:text-primary'
        } transition-colors`}
      >
        <Sparkles className="w-5 h-5" />
        <span>Hub</span>
      </Link>
      <Link 
        to="/investments" 
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`flex items-center gap-2 ${mobile ? 'w-full px-4 py-3 rounded-lg' : ''} ${
          isActive('/investments') 
            ? 'text-primary font-medium' 
            : 'text-muted-foreground hover:text-primary'
        } transition-colors`}
      >
        <TrendingUp className="w-5 h-5" />
        <span>Investments</span>
      </Link>
      <Link 
        to="/settings" 
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`flex items-center gap-2 ${mobile ? 'w-full px-4 py-3 rounded-lg' : ''} ${
          isActive('/settings') 
            ? 'text-primary font-medium' 
            : 'text-muted-foreground hover:text-primary'
        } transition-colors`}
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>
    </>
  );

  return (
    <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-all">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-background" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight">Wealthify</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <NavLinks />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-background" />
                      </div>
                      <span className="text-lg font-bold">Wealthify</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 py-4 space-y-1 px-2">
                    <NavLinks mobile />
                  </div>
                  
                  <div className="p-4 border-t border-border">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors justify-center"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm"
            >
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
