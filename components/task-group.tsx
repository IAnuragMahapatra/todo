'use client';

import React, { useState } from 'react';
import { ChevronDown, MoreHorizontal, Edit2, Trash2, Plus, Check, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTaskStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableGroupTask } from './draggable-group-task';

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskGroupProps {
  id: string;
  title: string;
  tasks: TaskItem[];
  className?: string;
  onRename?: (groupId: string, newTitle: string) => void;
  onDelete?: (groupId: string) => void;
  onTaskToggle?: (groupId: string, taskId: string) => void;
}

export function TaskGroup({
  id,
  title,
  tasks,
  className,
  onRename,
  onDelete,
  onTaskToggle,
}: TaskGroupProps) {
  const { updateGroup, deleteGroup, toggleGroupTask, addTaskToGroup, reorderGroupTasks } = useTaskStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Make the entire group sortable
  const {
    attributes: groupAttributes,
    listeners: groupListeners,
    setNodeRef: setGroupNodeRef,
    transform: groupTransform,
    transition: groupTransition,
    isDragging: isGroupDragging,
  } = useSortable({ 
    id,
    data: {
      type: 'group',
      group: { id, title, tasks },
    },
  });

  const groupStyle = {
    transform: CSS.Transform.toString(groupTransform),
    transition: groupTransition,
  };

  // Toggle collapsed state and persist to store
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    updateGroup(id, { collapsed: newState });
  };

  // Handle rename functionality
  const handleRename = () => {
    if (editTitle.trim() && editTitle !== title) {
      if (onRename) {
        onRename(id, editTitle.trim());
      } else {
        updateGroup(id, { title: editTitle.trim() });
      }
    }
    setIsEditing(false);
    setEditTitle(title);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(title);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else {
      deleteGroup(id);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    if (onTaskToggle) {
      onTaskToggle(id, taskId);
    } else {
      toggleGroupTask(id, taskId);
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: TaskItem = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: newTaskTitle.trim(),
        completed: false,
      };
      
      addTaskToGroup(id, newTask);
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const handleAddTaskKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setShowAddTask(false);
      setNewTaskTitle('');
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <motion.div 
      ref={setGroupNodeRef}
      style={groupStyle}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden",
        isGroupDragging && "z-50 rotate-1 scale-105 shadow-2xl",
        className
      )}
    >
      {/* Group Drag Handle */}
      <div
        {...groupAttributes}
        {...groupListeners}
        className={cn(
          "absolute left-2 top-6 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing touch-manipulation",
          "h-8 w-8 rounded-lg bg-muted/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-muted hover:scale-110",
          isGroupDragging && "opacity-100 bg-primary/20 border-primary/50"
        )}
        title="Drag to reorder group"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Group Header */}
      <div className={cn(
        "flex items-center justify-between p-4 sm:p-6 border-b border-border/50 transition-all duration-200",
        "ml-0 group-hover:ml-10 sm:group-hover:ml-12"
      )}>
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          {/* Collapse Toggle - Enhanced for touch */}
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapsed}
              className="h-9 w-9 sm:h-10 sm:w-10 p-0 hover:bg-muted/50 transition-all duration-200 rounded-full touch-manipulation"
            >
              <motion.div
                animate={{ rotate: isCollapsed ? -90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </motion.div>
            </Button>
          </motion.div>

          {/* Group Title */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyPress}
                className="bg-transparent border-none outline-none text-lg sm:text-xl font-semibold text-foreground w-full focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 touch-manipulation"
                autoFocus
              />
            ) : (
              <h3 
                className="text-lg sm:text-xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors duration-200 truncate touch-manipulation"
                onClick={() => setIsEditing(true)}
              >
                {title}
              </h3>
            )}
          </div>

          {/* Task Count Badge & Progress */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="text-sm sm:text-base text-muted-foreground font-medium">
              {completedCount}/{totalCount}
            </div>
            {totalCount > 0 && (
              <div className="h-2 w-12 sm:w-16 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-primary/80"
                />
              </div>
            )}
            {totalCount > 0 && completedCount === totalCount && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-primary"
              >
                ✨
              </motion.div>
            )}
          </div>
        </div>

        {/* Group Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 sm:h-10 sm:w-10 p-0 hover:bg-muted/50 transition-all duration-200 rounded-full touch-manipulation ml-2"
              >
                <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => setShowAddTask(true)}
              className="cursor-pointer touch-manipulation"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setIsEditing(true)}
              className="cursor-pointer touch-manipulation"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Rename Group
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="cursor-pointer text-destructive focus:text-destructive touch-manipulation"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task List */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Add New Task Input */}
            <AnimatePresence>
              {showAddTask && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 sm:p-6 border-b border-border/30"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-muted/20 rounded-xl border border-dashed border-border">
                    <div className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0" /> {/* Spacer for alignment */}
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={handleAddTaskKeyPress}
                      placeholder="Add a task to this group..."
                      className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 touch-manipulation"
                      autoFocus
                    />
                    <div className="flex items-center space-x-1">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleAddTask}
                          disabled={!newTaskTitle.trim()}
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-primary/10 hover:text-primary rounded-full touch-manipulation"
                          title="Add task"
                        >
                          <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowAddTask(false);
                            setNewTaskTitle('');
                          }}
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full touch-manipulation"
                          title="Cancel"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 rotate-45" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Existing Tasks */}
            {tasks.length > 0 ? (
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                  {tasks.map((task) => (
                    <DraggableGroupTask
                      key={task.id}
                      task={task}
                      groupId={id}
                      onToggle={handleTaskToggle}
                    />
                  ))}
                </SortableContext>
              </div>
            ) : !showAddTask ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 sm:p-12 text-center"
              >
                <div className="text-muted-foreground text-sm sm:text-base mb-4">
                  No tasks in this group yet
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddTask(true)}
                  className="text-sm hover:bg-primary/5 hover:text-primary hover:border-primary/50 touch-manipulation"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Task
                </Button>
              </motion.div>
            ) : null}

            {/* Quick Add Task Button (when not in add mode) */}
            {!showAddTask && tasks.length > 0 && (
              <div className="p-4 sm:p-6 pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddTask(true)}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/50 transition-all duration-200 rounded-xl touch-manipulation"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Add another task
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag overlay effect */}
      {isGroupDragging && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl pointer-events-none" />
      )}
    </motion.div>
  );
}