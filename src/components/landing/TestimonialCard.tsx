import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
  delay?: number;
}

export const TestimonialCard = ({
  quote,
  author,
  role,
  rating,
  delay = 0,
}: TestimonialCardProps) => {
  return (
    <motion.div
      className="card-surface relative overflow-hidden group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      {/* Glowing border */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Star rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.3, 
              delay: delay + i * 0.1,
              type: "spring",
              stiffness: 300
            }}
          >
            <Star
              className={`w-5 h-5 ${
                i < rating 
                  ? "text-amber-400 fill-amber-400" 
                  : "text-muted-foreground/30"
              }`}
            />
          </motion.div>
        ))}
      </div>

      <p className="text-muted-foreground mb-4 italic relative z-10">"{quote}"</p>
      
      <div className="relative z-10">
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
