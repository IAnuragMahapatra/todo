'use client';

import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Tag as TagIcon,
  MoreHorizontal,
  Edit2,
  Check,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TaskItem as TaskItemType, SubTask, TaskTag, DEFAULT_TAGS } from '@/lib/types';
import { SubTaskList } from './sub-task-list';
import { useTaskStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskItemProps {
  task: TaskItemType;
  className?: string;
}

export function TaskItem({ task, className }: TaskItemProps) {
  const { updateTask, deleteTask, toggleTask } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showProgress, setShowProgress] = useState(task.progress !== undefined);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);

  const handleToggleComplete = () => {
    toggleTask(task.id);
  };

  const handleProgressChange = (value: number[]) => {
    updateTask(task.id, { progress: value[0] });
  };

  const handleTitleEdit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      updateTask(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
    setEditTitle(task.title);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title);
    }
  };

  const handleTagSelect = (tag: TaskTag) => {
    updateTask(task.id, { tag });
    setShowTagSelector(false);
  };

  const handleCustomTag = () => {
    if (customTagInput.trim()) {
      const customTag: TaskTag = {
        id: `custom-${Date.now()}`,
        label: customTagInput.trim(),
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      };
      handleTagSelect(customTag);
      setCustomTagInput('');
      setShowCustomTagInput(false);
    }
  };

  const handleRemoveTag = () => {
    updateTask(task.id, { tag: undefined });
  };

  const handleToggleSubTasks = () => {
    updateTask(task.id, { 
      showSubTasks: !task.showSubTasks,
      subTasks: task.subTasks || []
    });
  };

  const handleSubTasksUpdate = (subTasks: SubTask[]) => {
    updateTask(task.id, { subTasks });
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const completedSubTasks = task.subTasks?.filter(st => st.completed).length || 0;
  const totalSubTasks = task.subTasks?.length || 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden",
        task.completed && "opacity-75",
        className
      )}
    >
      {/* Main Task */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          {/* Completion Checkbox - Enhanced for touch */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleComplete}
            className={cn(
              "mt-1 h-6 w-6 sm:h-7 sm:w-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 touch-manipulation",
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

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {/* Task Title */}
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleTitleEdit}
                  onKeyDown={handleKeyPress}
                  className="flex-1 bg-transparent border-none outline-none text-foreground focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 text-base sm:text-lg touch-manipulation"
                  autoFocus
                />
              ) : (
                <h4 
                  className={cn(
                    "flex-1 font-medium cursor-pointer hover:text-primary transition-colors duration-200 text-base sm:text-lg touch-manipulation",
                    task.completed 
                      ? "text-muted-foreground line-through" 
                      : "text-foreground"
                  )}
                  onClick={() => setIsEditing(true)}
                >
                  {task.title}
                </h4>
              )}

              {/* Tag Display */}
              <AnimatePresence>
                {task.tag && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs sm:text-sm", task.tag.color)}
                    >
                      {task.tag.label}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress Bar - Enhanced for mobile */}
            <AnimatePresence>
              {showProgress && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-3 sm:mb-4"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="flex-1">
                      <Slider
                        value={[task.progress || 0]}
                        onValueChange={handleProgressChange}
                        max={100}
                        step={5}
                        className="w-full touch-manipulation"
                      />
                    </div>
                    <motion.span 
                      key={task.progress}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-sm sm:text-base text-muted-foreground w-12 sm:w-14 text-right font-medium"
                    >
                      {task.progress || 0}%
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sub-tasks Summary */}
            <AnimatePresence>
              {totalSubTasks > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2 sm:space-x-3 text-sm text-muted-foreground mb-2"
                >
                  <span className="text-xs sm:text-sm">{completedSubTasks}/{totalSubTasks} subtasks</span>
                  <div className="h-1.5 w-16 sm:w-20 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-primary/80"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Task Actions - Enhanced for mobile */}
          <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            {/* Sub-tasks Toggle */}
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSubTasks}
                className="h-9 w-9 sm:h-10 sm:w-10 p-0 hover:bg-muted/50 rounded-full touch-manipulation"
                title="Toggle sub-tasks"
              >
                <motion.div
                  animate={{ rotate: task.showSubTasks ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
              </Button>
            </motion.div>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 sm:h-10 sm:w-10 p-0 hover:bg-muted/50 rounded-full touch-manipulation"
                  >
                    <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-52">
                <DropdownMenuItem onClick={() => setIsEditing(true)} className="touch-manipulation">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Title
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setShowProgress(!showProgress)} className="touch-manipulation">
                  <div className="h-4 w-4 mr-2 flex items-center">
                    <div className="h-2 w-4 bg-current rounded-full opacity-60" />
                  </div>
                  {showProgress ? 'Hide' : 'Show'} Progress
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setShowTagSelector(true)} className="touch-manipulation">
                  <TagIcon className="h-4 w-4 mr-2" />
                  {task.tag ? 'Change Tag' : 'Add Tag'}
                </DropdownMenuItem>

                {task.tag && (
                  <DropdownMenuItem onClick={handleRemoveTag} className="touch-manipulation">
                    <X className="h-4 w-4 mr-2" />
                    Remove Tag
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive touch-manipulation"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tag Selector - Enhanced for mobile */}
        <AnimatePresence>
          {showTagSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-muted/30 rounded-xl border border-border/50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Select Tag</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTagSelector(false)}
                  className="h-8 w-8 p-0 rounded-full touch-manipulation"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {DEFAULT_TAGS.map((tag) => (
                  <motion.button
                    key={tag.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTagSelect(tag)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 touch-manipulation",
                      tag.color
                    )}
                  >
                    {tag.label}
                  </motion.button>
                ))}
              </div>

              {/* Custom Tag Input */}
              <AnimatePresence>
                {showCustomTagInput ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCustomTag();
                        if (e.key === 'Escape') setShowCustomTagInput(false);
                      }}
                      placeholder="Custom tag name"
                      className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCustomTag}
                      className="h-8 w-8 p-0 rounded-full touch-manipulation"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </motion.div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomTagInput(true)}
                    className="w-full h-9 text-sm touch-manipulation"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Custom Tag
                  </Button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sub-tasks */}
      <AnimatePresence>
        {task.showSubTasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-border/50"
          >
            <SubTaskList
              subTasks={task.subTasks || []}
              onUpdate={handleSubTasksUpdate}
              parentTaskId={task.id}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}