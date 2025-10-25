import { ReactNode, useState } from "react";
import Navbar from "./Navbar";
import FloatingActionButton from "./FloatingActionButton";
import QuickActionWidget from "./QuickActionWidget";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-background text-foreground finance-pattern-bg">
      <Navbar />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto relative z-10 pb-24">{children}</main>
      {!isLoginPage && (
        <>
          <FloatingActionButton onClick={() => setQuickActionOpen(true)} />
          <QuickActionWidget open={quickActionOpen} onOpenChange={setQuickActionOpen} />
        </>
      )}
    </div>
  );
}
