'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskItem } from './task-item';
import { TaskItem as TaskItemType } from '@/lib/types';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DraggableTaskItemProps {
  task: TaskItemType;
  isDragging?: boolean;
}

export function DraggableTaskItem({ task, isDragging }: DraggableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isCurrentlyDragging && "z-50 rotate-3 scale-105"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing touch-manipulation",
          "h-8 w-8 rounded-lg bg-muted/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-muted hover:scale-110",
          isCurrentlyDragging && "opacity-100 bg-primary/20 border-primary/50"
        )}
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Task Item with drag styling */}
      <motion.div
        animate={{
          scale: isCurrentlyDragging ? 1.02 : 1,
          boxShadow: isCurrentlyDragging 
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "transition-all duration-200",
          isCurrentlyDragging && "bg-card/95 backdrop-blur-sm border-primary/50 shadow-2xl",
          "ml-0 group-hover:ml-10 sm:group-hover:ml-12"
        )}
      >
        <TaskItem task={task} />
      </motion.div>

      {/* Drag overlay effect */}
      {isCurrentlyDragging && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
}