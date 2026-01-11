import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  glowColor: string;
  delay?: number;
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  gradient,
  glowColor,
  delay = 0,
}: FeatureCardProps) => {
  return (
    <motion.div
      className="card-surface group hover:border-primary/30 transition-all relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Glowing border effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${glowColor}15, transparent, ${glowColor}10)`,
          boxShadow: `inset 0 0 30px ${glowColor}20`,
        }}
      />

      <motion.div
        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg relative z-10`}
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
        style={{
          boxShadow: `0 8px 25px ${glowColor}40`,
        }}
      >
        <Icon className="w-7 h-7 text-white" />
      </motion.div>

      <h3 className="text-xl font-semibold mb-2 relative z-10">{title}</h3>
      <p className="text-muted-foreground relative z-10">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
