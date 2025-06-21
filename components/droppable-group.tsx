'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DroppableGroupProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function DroppableGroup({ id, children, className }: DroppableGroupProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: 'group',
      groupId: id,
    },
  });

  return (
    <motion.div
      ref={setNodeRef}
      animate={{
        scale: isOver ? 1.02 : 1,
        borderColor: isOver ? 'hsl(var(--primary))' : 'hsl(var(--border))',
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        "transition-all duration-200",
        isOver && "bg-primary/5 border-primary/50 shadow-lg",
        className
      )}
    >
      {children}
      
      {/* Drop indicator */}
      {isOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl pointer-events-none border-2 border-dashed border-primary/50"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
              Drop task here
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}