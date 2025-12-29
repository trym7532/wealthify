import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Twitter, Facebook, Linkedin, X, Share2 } from "lucide-react";
import { Achievement } from "@/hooks/useAchievements";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface AchievementUnlockedModalProps {
  achievement: Achievement | null;
  onClose: () => void;
  onShare: (achievement: Achievement, platform: "twitter" | "facebook" | "linkedin") => void;
}

export default function AchievementUnlockedModal({
  achievement,
  onClose,
  onShare,
}: AchievementUnlockedModalProps) {
  useEffect(() => {
    if (achievement) {
      // Fire confetti celebration
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ["#2ECC71", "#27AE60", "#1ABC9C", "#16A085", "#F1C40F"];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [achievement]);

  return (
    <AnimatePresence>
      {achievement && (
        <Dialog open={!!achievement} onOpenChange={() => onClose()}>
          <DialogContent className="sm:max-w-md border-primary/20 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent -z-10" />
              
              <div className="text-center py-6 space-y-6">
                {/* Badge with animation */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative mx-auto w-fit"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, -5, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.5,
                      repeat: 2
                    }}
                    className="text-7xl mb-4 relative z-10"
                  >
                    {achievement.icon}
                  </motion.div>
                  
                  {/* Glowing ring */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-primary/30"
                  />
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-sm text-primary font-medium uppercase tracking-wider mb-2">
                    🎉 Achievement Unlocked!
                  </p>
                  <h2 className="text-2xl font-bold text-gradient">
                    {achievement.achievement_name}
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    {achievement.description}
                  </p>
                </motion.div>

                {/* Share section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4 border-t border-border"
                >
                  <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share your achievement
                  </p>
                  
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all"
                      onClick={() => onShare(achievement, "twitter")}
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-[#4267B2]/10 hover:border-[#4267B2] hover:text-[#4267B2] transition-all"
                      onClick={() => onShare(achievement, "facebook")}
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-[#0077B5]/10 hover:border-[#0077B5] hover:text-[#0077B5] transition-all"
                      onClick={() => onShare(achievement, "linkedin")}
                    >
                      <Linkedin className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>

                {/* Continue button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button 
                    onClick={onClose}
                    className="w-full gradient-primary"
                  >
                    Awesome! 🚀
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
