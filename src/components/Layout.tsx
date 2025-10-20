import { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground finance-pattern-bg">
      <Navbar />
      <main className="p-6 max-w-7xl mx-auto relative z-10">{children}</main>
    </div>
  );
}
