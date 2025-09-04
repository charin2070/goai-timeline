'use client';

import { motion } from 'framer-motion';

const dotVariants = {
  initial: {
    y: "0%",
  },
  animate: {
    y: "-100%",
  },
};

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export function TypingDots() {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex items-center justify-center gap-1 h-8"
    >
      <motion.span
        variants={dotVariants}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="block w-2 h-2 bg-muted-foreground rounded-full"
      />
      <motion.span
        variants={dotVariants}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: 0.2 }}
        className="block w-2 h-2 bg-muted-foreground rounded-full"
      />
      <motion.span
        variants={dotVariants}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: 0.4 }}
        className="block w-2 h-2 bg-muted-foreground rounded-full"
      />
    </motion.div>
  );
}
