import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const tutorialSteps = [
  {
    title: "Welcome to Wealthify! 👋",
    description: "Let's take a quick tour to help you get started with managing your finances effectively.",
    icon: "🎯"
  },
  {
    title: "Dashboard Overview",
    description: "Your dashboard shows key metrics at a glance: Total Balance, Monthly Spend, Savings, and Investments. Click on any card to see detailed breakdowns.",
    icon: "📊"
  },
  {
    title: "Track Your Spending",
    description: "The Monthly Spending Trend chart helps you visualize your expenses over time. Monitor patterns and identify areas to save.",
    icon: "📈"
  },
  {
    title: "Set Financial Goals",
    description: "Navigate to the Hub tab to create savings goals, set budgets, and link your accounts. Stay on track with visual progress indicators.",
    icon: "🎯"
  },
  {
    title: "Investment Tracking",
    description: "Check the Investments tab for real-time market updates, portfolio performance, and AI-powered stock suggestions.",
    icon: "💹"
  },
  {
    title: "Quick Actions",
    description: "Use the + button in the bottom-right corner to quickly add transactions, create goals, or link new accounts.",
    icon: "⚡"
  },
  {
    title: "You're All Set! 🚀",
    description: "Start by linking your first account or adding a transaction. Your financial journey begins now!",
    icon: "✨"
  }
];

export default function OnboardingTutorial() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true);

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await supabase
        .from('profiles')
        .select('has_seen_tutorial')
        .eq('id', user.id)
        .maybeSingle();

      if (result.error) {
        console.error('Error fetching profile:', result.error);
        return;
      }

      const hasSeenTutorial = result.data?.has_seen_tutorial ?? false;
      
      if (!hasSeenTutorial) {
        setHasSeenTutorial(false);
        setOpen(true);
      }
    } catch (error) {
      console.error('Error in checkTutorialStatus:', error);
    }
  };

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ has_seen_tutorial: true })
      .eq('id', user.id);

    setOpen(false);
    setHasSeenTutorial(true);
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (hasSeenTutorial) return null;

  const step = tutorialSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="text-4xl mb-2">{step.icon}</div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogTitle className="text-2xl">{step.title}</DialogTitle>
          <DialogDescription className="text-base mt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 py-4">
          {tutorialSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep 
                  ? 'w-8 gradient-primary' 
                  : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentStep + 1} / {tutorialSteps.length}
          </div>

          <Button
            onClick={handleNext}
            className="gap-2 gradient-primary"
          >
            {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}