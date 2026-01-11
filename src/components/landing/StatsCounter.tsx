import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface StatsCounterProps {
  value: string;
  label: string;
  gradient: string;
  suffix?: string;
  delay?: number;
}

export const StatsCounter = ({
  value,
  label,
  gradient,
  suffix = "",
  delay = 0,
}: StatsCounterProps) => {
  const [displayValue, setDisplayValue] = useState("0");
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(numericValue * easeOut);
      
      if (value.includes("$")) {
        setDisplayValue(`$${currentValue.toLocaleString()}`);
      } else if (value.includes("+")) {
        setDisplayValue(`${currentValue.toLocaleString()}+`);
      } else {
        setDisplayValue(currentValue.toLocaleString());
      }

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, numericValue]);

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, type: "spring" }}
    >
      <motion.div
        className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
        whileHover={{ scale: 1.05 }}
      >
        {displayValue}
        {suffix}
      </motion.div>
      <p className="text-muted-foreground mt-2">{label}</p>
    </motion.div>
  );
};

export default StatsCounter;
