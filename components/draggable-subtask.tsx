'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SubTask } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface DraggableSubTaskProps {
  subTask: SubTask;
  parentTaskId: string;
  onToggle: (subTaskId: string) => void;
  onEdit: (subTask: SubTask) => void;
  onDelete: (subTaskId: string) => void;
  isDragging?: boolean;
}

export function DraggableSubTask({ 
  subTask, 
  parentTaskId, 
  onToggle, 
  onEdit, 
  onDelete, 
  isDragging 
}: DraggableSubTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: subTask.id,
    data: {
      type: 'subtask',
      subTask,
      parentTaskId,
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
          "h-5 w-5 rounded-md bg-muted/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-muted hover:scale-110",
          isCurrentlyDragging && "opacity-100 bg-primary/20 border-primary/50"
        )}
        title="Drag to reorder"
      >
        <GripVertical className="h-2.5 w-2.5 text-muted-foreground" />
      </div>

      {/* SubTask Content */}
      <motion.div
        animate={{
          scale: isCurrentlyDragging ? 1.02 : 1,
          boxShadow: isCurrentlyDragging 
            ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            : "none"
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl hover:bg-muted/30 transition-all duration-200",
          subTask.completed && "opacity-75",
          isCurrentlyDragging && "bg-card/95 backdrop-blur-sm border border-primary/50 shadow-lg",
          "ml-0 group-hover:ml-6 sm:group-hover:ml-8"
        )}
      >
        {/* Sub-task Checkbox - Enhanced for touch */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggle(subTask.id)}
          className={cn(
            "h-5 w-5 sm:h-6 sm:w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 touch-manipulation",
            subTask.completed 
              ? "bg-primary border-primary text-primary-foreground shadow-lg" 
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          <AnimatePresence>
            {subTask.completed && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Sub-task Title */}
        <div className="flex-1 min-w-0">
          <span 
            className={cn(
              "text-sm sm:text-base cursor-pointer hover:text-primary transition-colors duration-200 touch-manipulation block",
              subTask.completed 
                ? "text-muted-foreground line-through" 
                : "text-foreground"
            )}
            onClick={() => onEdit(subTask)}
          >
            {subTask.title}
          </span>
        </div>

        {/* Sub-task Actions - Always visible on mobile */}
        <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(subTask)}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-muted/50 rounded-full touch-manipulation"
              title="Edit sub-task"
            >
              <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(subTask.id)}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full touch-manipulation"
              title="Delete sub-task"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Drag overlay effect */}
      {isCurrentlyDragging && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}