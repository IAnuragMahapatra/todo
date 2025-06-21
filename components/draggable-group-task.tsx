'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface GroupTask {
  id: string;
  title: string;
  completed: boolean;
}

interface DraggableGroupTaskProps {
  task: GroupTask;
  groupId: string;
  onToggle: (taskId: string) => void;
  isDragging?: boolean;
}

export function DraggableGroupTask({ 
  task, 
  groupId, 
  onToggle, 
  isDragging 
}: DraggableGroupTaskProps) {
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
      type: 'group-task',
      task,
      groupId,
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
        isCurrentlyDragging && "z-50 rotate-1 scale-105"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing touch-manipulation",
          "h-6 w-6 rounded-md bg-muted/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-muted hover:scale-110",
          isCurrentlyDragging && "opacity-100 bg-primary/20 border-primary/50"
        )}
        title="Drag to reorder"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>

      {/* Task Content */}
      <motion.div
        animate={{
          scale: isCurrentlyDragging ? 1.02 : 1,
          boxShadow: isCurrentlyDragging 
            ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            : "none"
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl border border-border/30 hover:border-border/60 transition-all duration-200 hover:shadow-sm bg-background/50",
          task.completed && "bg-muted/30",
          isCurrentlyDragging && "bg-card/95 backdrop-blur-sm border-primary/50 shadow-lg",
          "ml-0 group-hover:ml-8 sm:group-hover:ml-10"
        )}
      >
        {/* Task Checkbox - Enhanced for touch */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggle(task.id)}
          className={cn(
            "h-6 w-6 sm:h-7 sm:w-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 touch-manipulation",
            task.completed 
              ? "bg-primary border-primary text-primary-foreground shadow-lg" 
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                <Check className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Task Title */}
        <span className={cn(
          "flex-1 text-sm sm:text-base transition-all duration-200 touch-manipulation",
          task.completed 
            ? "text-muted-foreground line-through" 
            : "text-foreground"
        )}>
          {task.title}
        </span>

        {/* Completion celebration */}
        <AnimatePresence>
          {task.completed && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-primary"
            >
              ✨
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Drag overlay effect */}
      {isCurrentlyDragging && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}