'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CountUpNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  color?: string;
  className?: string;
}

export function CountUpNumber({ 
  value, 
  prefix = '', 
  suffix = '', 
  duration = 2,
  color,
  className 
}: CountUpNumberProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return prefix + Math.floor(latest).toLocaleString() + suffix;
  });

  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, count, duration]);

  return (
    <motion.span
      ref={nodeRef}
      className={cn('text-3xl font-black tracking-tighter', color, className)}
    >
      {rounded}
    </motion.span>
  );
}
