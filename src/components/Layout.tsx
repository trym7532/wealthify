import { ReactNode, useState, useEffect } from "react";
import Navbar from "./Navbar";
import MobileBottomNav from "./MobileBottomNav";
import FloatingActionButton from "./FloatingActionButton";
import QuickActionWidget from "./QuickActionWidget";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-background text-foreground finance-pattern-bg">
      <Navbar />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto relative z-10 pb-28 sm:pb-24">{children}</main>
      {user && (
        <>
          <FloatingActionButton onClick={() => setQuickActionOpen(true)} />
          <QuickActionWidget open={quickActionOpen} onOpenChange={setQuickActionOpen} />
          <MobileBottomNav />
        </>
      )}
    </div>
  );
}
