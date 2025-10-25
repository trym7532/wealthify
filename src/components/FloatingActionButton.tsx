import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg gradient-primary hover:shadow-[var(--shadow-glow)] z-50 p-0"
      aria-label="Quick actions"
    >
      <Plus className="w-6 h-6 text-background" />
    </Button>
  );
}
