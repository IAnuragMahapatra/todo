'use client';

import { Menu, Plus, FolderPlus, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { SettingsPanel } from '@/components/settings-panel';
import { DraggableTaskItem } from '@/components/draggable-task-item';
import { TaskGroup } from '@/components/task-group';
import { DroppableGroup } from '@/components/droppable-group';
import { useState, useEffect } from 'react';
import { useTaskStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { TaskItem } from '@/components/task-item';

// Beautiful Logo Component
function TaskLogo({ className }: { className?: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative ${className}`}
    >
      {/* Outer glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl scale-110 opacity-50" />
      
      {/* Main logo container */}
      <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg border border-primary/20">
        {/* Inner design - layered squares representing tasks */}
        <div className="relative">
          {/* Background squares */}
          <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-1">
            <div className="bg-primary-foreground/30 rounded-sm" />
            <div className="bg-primary-foreground/60 rounded-sm" />
            <div className="bg-primary-foreground/90 rounded-sm" />
            <div className="bg-primary-foreground rounded-sm" />
          </div>
          
          {/* Checkmark overlay */}
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
            className="relative z-10 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10"
          >
            <svg 
              className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </motion.div>
        </div>
        
        {/* Subtle inner border */}
        <div className="absolute inset-0.5 rounded-xl border border-primary-foreground/10" />
      </div>
      
      {/* Floating particles */}
      <motion.div 
        animate={{ 
          y: [0, -8, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-1 -right-1 w-1 h-1 bg-primary/40 rounded-full" 
      />
      <motion.div 
        animate={{ 
          y: [0, -6, 0],
          opacity: [0.2, 0.6, 0.2]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute -bottom-1 -left-1 w-0.5 h-0.5 bg-accent/60 rounded-full" 
      />
    </motion.div>
  );
}

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [addMode, setAddMode] = useState<'task' | 'group' | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  
  const { 
    tasks, 
    groups, 
    addTask, 
    addGroup,
    reorderTasks,
    reorderGroups,
    moveTaskToGroup,
    getTotalTasksCount, 
    getCompletedTasksCount, 
    isAllTasksCompleted 
  } = useTaskStore();
  const [mounted, setMounted] = useState(false);

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

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle.trim(),
        completed: false,
        subTasks: [],
        showSubTasks: false,
      });
      setNewTaskTitle('');
      setAddMode(null);
      setShowAddOptions(false);
    }
  };

  const handleAddGroup = () => {
    if (newGroupTitle.trim()) {
      addGroup({
        title: newGroupTitle.trim(),
        tasks: [],
        collapsed: false,
      });
      setNewGroupTitle('');
      setAddMode(null);
      setShowAddOptions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'task' | 'group') => {
    if (e.key === 'Enter') {
      if (type === 'task') {
        handleAddTask();
      } else {
        handleAddGroup();
      }
    } else if (e.key === 'Escape') {
      setAddMode(null);
      setShowAddOptions(false);
      setNewTaskTitle('');
      setNewGroupTitle('');
    }
  };

  const selectAddMode = (mode: 'task' | 'group') => {
    setAddMode(mode);
    setNewTaskTitle('');
    setNewGroupTitle('');
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setDraggedItem(active.data.current);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle moving tasks between groups
    if (activeData?.type === 'task' && overData?.type === 'group') {
      const taskId = active.id as string;
      const targetGroupId = overData.groupId;
      
      // Move task to group
      moveTaskToGroup(taskId, targetGroupId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle task reordering within individual tasks
    if (activeData?.type === 'task' && overData?.type === 'task') {
      const oldIndex = tasks.findIndex(task => task.id === activeId);
      const newIndex = tasks.findIndex(task => task.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(tasks, oldIndex, newIndex);
        reorderTasks(newOrder);
      }
    }

    // Handle group reordering
    if (activeData?.type === 'group' && overData?.type === 'group') {
      const oldIndex = groups.findIndex(group => group.id === activeId);
      const newIndex = groups.findIndex(group => group.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(groups, oldIndex, newIndex);
        reorderGroups(newOrder);
      }
    }
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const totalTasks = getTotalTasksCount();
  const completedTasks = getCompletedTasksCount();
  const allCompleted = isAllTasksCompleted();
  const hasTasks = totalTasks > 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),transparent)]" />
        
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center justify-between p-4 sm:p-6 lg:p-8"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <TaskLogo />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
                The To-Do List
              </h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm text-muted-foreground hidden sm:block"
              >
                Stay organized, stay productive
              </motion.p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-muted/50 transition-all duration-200 hover:scale-105 touch-manipulation"
            >
              <Menu className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Settings menu</span>
            </Button>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="relative z-10 px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-4xl mx-auto">
            {hasTasks ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Progress Overview */}
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 sm:p-6 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
                        {allCompleted ? "All Done! 🎉" : "Progress"}
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {completedTasks} of {totalTasks} tasks completed
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl sm:text-3xl font-bold text-primary">
                          {Math.round((completedTasks / totalTasks) * 100)}%
                        </div>
                      </div>
                      <div className="w-16 sm:w-20 h-16 sm:h-20 relative">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="2"
                          />
                          <motion.path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeDasharray={`${(completedTasks / totalTasks) * 100}, 100`}
                            initial={{ strokeDasharray: "0, 100" }}
                            animate={{ strokeDasharray: `${(completedTasks / totalTasks) * 100}, 100` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Individual Tasks */}
                <AnimatePresence>
                  {tasks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 sm:space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-foreground">Individual Tasks</h3>
                        <span className="text-sm text-muted-foreground">{tasks.length} tasks</span>
                      </div>
                      
                      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3 sm:space-y-4">
                          {tasks.map((task) => (
                            <DraggableTaskItem
                              key={task.id}
                              task={task}
                              isDragging={activeId === task.id}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Task Groups */}
                <AnimatePresence>
                  {groups.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-foreground">Task Groups</h3>
                        <span className="text-sm text-muted-foreground">{groups.length} groups</span>
                      </div>
                      
                      <SortableContext items={groups.map(group => group.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4 sm:space-y-6">
                          {groups.map((group) => (
                            <DroppableGroup key={group.id} id={group.id} className="relative">
                              <TaskGroup
                                id={group.id}
                                title={group.title}
                                tasks={group.tasks}
                              />
                            </DroppableGroup>
                          ))}
                        </div>
                      </SortableContext>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 sm:space-y-8 max-w-md mx-auto"
              >
                {/* Animated celebration emoji with glow effect */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl scale-150 animate-pulse" />
                  <motion.div 
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative text-6xl sm:text-7xl lg:text-8xl"
                  >
                    🎉
                  </motion.div>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground/90 leading-tight tracking-tight">
                    Ready to get started!
                  </h2>
                  <p className="text-lg sm:text-xl font-medium bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Let&apos;s create your first task! 🚀
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-4">
                    Start your productivity journey by adding your first task or creating a task group below.
                  </p>
                </div>

                <div className="pt-4 sm:pt-8">
                  <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground/60">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-muted-foreground/20" />
                    <span>Tap + to get started</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-muted-foreground/20" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        {/* Add Interface */}
        <AnimatePresence>
          {showAddOptions && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-20 sm:bottom-24 left-4 right-4 z-40"
            >
              <div className="max-w-2xl mx-auto">
                <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="flex">
                    {/* Left Side - Add Options */}
                    <div className="flex flex-col border-r border-border/50">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectAddMode('task')}
                        className={`flex items-center space-x-3 p-4 sm:p-6 transition-all duration-200 touch-manipulation ${
                          addMode === 'task' 
                            ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                            : 'hover:bg-muted/30 text-foreground'
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          addMode === 'task' 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          <CheckSquare className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm sm:text-base">New Task</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Add a single task</div>
                        </div>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectAddMode('group')}
                        className={`flex items-center space-x-3 p-4 sm:p-6 transition-all duration-200 touch-manipulation ${
                          addMode === 'group' 
                            ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                            : 'hover:bg-muted/30 text-foreground'
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          addMode === 'group' 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          <FolderPlus className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm sm:text-base">New Group</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Organize related tasks</div>
                        </div>
                      </motion.button>
                    </div>

                    {/* Right Side - Input Field */}
                    <div className="flex-1 p-4 sm:p-6">
                      <AnimatePresence mode="wait">
                        {addMode === 'task' && (
                          <motion.div
                            key="task-input"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type="text"
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              onKeyDown={(e) => handleKeyPress(e, 'task')}
                              placeholder="What needs to be done?"
                              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base sm:text-lg touch-manipulation focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
                              autoFocus
                            />
                            <Button
                              onClick={handleAddTask}
                              disabled={!newTaskTitle.trim()}
                              size="sm"
                              className="h-10 w-10 rounded-full touch-manipulation hover:scale-105 transition-transform duration-200"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        )}

                        {addMode === 'group' && (
                          <motion.div
                            key="group-input"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type="text"
                              value={newGroupTitle}
                              onChange={(e) => setNewGroupTitle(e.target.value)}
                              onKeyDown={(e) => handleKeyPress(e, 'group')}
                              placeholder="Name your task group..."
                              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base sm:text-lg touch-manipulation focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
                              autoFocus
                            />
                            <Button
                              onClick={handleAddGroup}
                              disabled={!newGroupTitle.trim()}
                              size="sm"
                              className="h-10 w-10 rounded-full touch-manipulation hover:scale-105 transition-transform duration-200"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        )}

                        {!addMode && (
                          <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center h-12 text-muted-foreground text-sm sm:text-base"
                          >
                            Select an option to get started
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Add Button */}
        <div className="fixed bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/80 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            
            {/* Main button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={() => setShowAddOptions(!showAddOptions)}
                size="lg"
                className="relative h-14 w-14 sm:h-16 sm:w-16 lg:h-18 lg:w-18 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary border-2 border-primary/20 hover:border-primary/30 touch-manipulation"
              >
                <motion.div
                  animate={{ rotate: showAddOptions ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                </motion.div>
                <span className="sr-only">Add new task or group</span>
              </Button>
            </motion.div>
            
            {/* Ripple effect on hover */}
            <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
          </div>
        </div>

        {/* Floating particles effect (subtle) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/10 rounded-full" 
          />
          <motion.div 
            animate={{ 
              y: [0, -15, 0],
              opacity: [0.05, 0.2, 0.05]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent/20 rounded-full" 
          />
          <motion.div 
            animate={{ 
              y: [0, -25, 0],
              opacity: [0.02, 0.1, 0.02]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-primary/5 rounded-full" 
          />
        </div>

        {/* Settings Panel */}
        <SettingsPanel 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && draggedItem ? (
            <div className="opacity-90 rotate-3 scale-105">
              {draggedItem.type === 'task' && (
                <TaskItem task={draggedItem.task} />
              )}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}