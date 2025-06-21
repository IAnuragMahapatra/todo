'use client';

import React, { useState } from 'react';
import { Plus, Check, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SubTask } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { DraggableSubTask } from './draggable-subtask';

interface SubTaskListProps {
  subTasks: SubTask[];
  onUpdate: (subTasks: SubTask[]) => void;
  parentTaskId: string;
}

export function SubTaskList({ subTasks, onUpdate, parentTaskId }: SubTaskListProps) {
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Configure sensors for better touch/mouse support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      const newSubTask: SubTask = {
        id: `${parentTaskId}-subtask-${Date.now()}`,
        title: newSubTaskTitle.trim(),
        completed: false,
      };
      
      const updatedSubTasks = [...subTasks, newSubTask];
      onUpdate(updatedSubTasks);
      setNewSubTaskTitle('');
      setShowAddInput(false);
    }
  };

  const handleToggleSubTask = (subTaskId: string) => {
    const updatedSubTasks = subTasks.map(subTask =>
      subTask.id === subTaskId 
        ? { ...subTask, completed: !subTask.completed }
        : subTask
    );
    onUpdate(updatedSubTasks);
  };

  const handleDeleteSubTask = (subTaskId: string) => {
    const updatedSubTasks = subTasks.filter(subTask => subTask.id !== subTaskId);
    onUpdate(updatedSubTasks);
  };

  const handleEditSubTask = (subTaskId: string) => {
    if (editTitle.trim()) {
      const updatedSubTasks = subTasks.map(subTask =>
        subTask.id === subTaskId 
          ? { ...subTask, title: editTitle.trim() }
          : subTask
      );
      onUpdate(updatedSubTasks);
    }
    setEditingId(null);
    setEditTitle('');
  };

  const startEditing = (subTask: SubTask) => {
    setEditingId(subTask.id);
    setEditTitle(subTask.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  // Handle drag end for reordering subtasks
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = subTasks.findIndex(subTask => subTask.id === active.id);
    const newIndex = subTasks.findIndex(subTask => subTask.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedSubTasks = arrayMove(subTasks, oldIndex, newIndex);
      onUpdate(reorderedSubTasks);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 sm:p-6 space-y-3">
        {/* Existing Sub-tasks */}
        <SortableContext items={subTasks.map(subTask => subTask.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {subTasks.map((subTask, index) => (
              <motion.div
                key={subTask.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
              >
                {editingId === subTask.id ? (
                  <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl bg-muted/20 border border-border">
                    <div className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" /> {/* Spacer for alignment */}
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleEditSubTask(subTask.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSubTask(subTask.id);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-foreground focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 touch-manipulation"
                      autoFocus
                    />
                  </div>
                ) : (
                  <DraggableSubTask
                    subTask={subTask}
                    parentTaskId={parentTaskId}
                    onToggle={handleToggleSubTask}
                    onEdit={startEditing}
                    onDelete={handleDeleteSubTask}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>

        {/* Add New Sub-task */}
        <AnimatePresence>
          {showAddInput ? (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-muted/20 rounded-xl border border-dashed border-border"
            >
              <div className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" /> {/* Spacer for alignment */}
              <input
                type="text"
                value={newSubTaskTitle}
                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubTask();
                  if (e.key === 'Escape') {
                    setShowAddInput(false);
                    setNewSubTaskTitle('');
                  }
                }}
                placeholder="Add a sub-task..."
                className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 touch-manipulation"
                autoFocus
              />
              <div className="flex items-center space-x-1">
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddSubTask}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-primary/10 hover:text-primary rounded-full touch-manipulation"
                    title="Add sub-task"
                  >
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddInput(false);
                      setNewSubTaskTitle('');
                    }}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full touch-manipulation"
                    title="Cancel"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 rotate-45" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddInput(true)}
                className="w-full h-10 sm:h-12 text-sm sm:text-base text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/50 transition-all duration-200 rounded-xl touch-manipulation"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Add sub-task
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}