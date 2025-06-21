import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TaskItem, TaskGroup, SubTask, TaskTag } from './types';
import toast from 'react-hot-toast';

interface TaskStore {
  // State
  tasks: TaskItem[];
  groups: TaskGroup[];
  
  // Task Actions
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  updateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
  reorderTasks: (newOrder: TaskItem[]) => void;
  moveTaskToGroup: (taskId: string, groupId: string) => void;
  
  // Group Actions
  addGroup: (group: Omit<TaskGroup, 'id'>) => void;
  updateGroup: (groupId: string, updates: Partial<TaskGroup>) => void;
  deleteGroup: (groupId: string) => void;
  toggleGroupTask: (groupId: string, taskId: string) => void;
  addTaskToGroup: (groupId: string, task: { id: string; title: string; completed: boolean }) => void;
  reorderGroups: (newOrder: TaskGroup[]) => void;
  reorderGroupTasks: (groupId: string, newOrder: any[]) => void;
  
  // Sub-task Actions
  updateSubTasks: (taskId: string, subTasks: SubTask[]) => void;
  
  // Utility Actions
  clearAllData: () => void;
  importData: (data: { tasks: TaskItem[]; groups: TaskGroup[] }) => void;
  
  // Computed Properties
  getCompletedTasksCount: () => number;
  getTotalTasksCount: () => number;
  isAllTasksCompleted: () => boolean;
}

// Cheerful toast messages
const TOAST_MESSAGES = {
  taskComplete: [
    "You nailed it! Task complete 💪",
    "Boom! Another one bites the dust 🎯",
    "Task crushed! You're on fire 🔥",
    "Victory! Task conquered 🏆",
    "Awesome work! Task done ✨"
  ],
  allSubTasksComplete: [
    "Sub-tasks demolished! You're unstoppable 🚀",
    "All sub-tasks crushed! Master level achieved 🎖️",
    "Sub-task sweep complete! Legendary 🌟",
    "Every sub-task conquered! You're amazing 💫"
  ],
  groupComplete: [
    "Focus group cleared! 🧠✨",
    "Group mission accomplished! 🎊",
    "Entire group conquered! Champion mode 🏅",
    "Group goals smashed! Incredible 🎉"
  ],
  allTasksComplete: [
    "All tasks done — go touch grass 🍀",
    "Everything complete! Time to celebrate 🎈",
    "Mission accomplished! You're a productivity legend 🌟",
    "All done! Go enjoy life, you earned it 🌈",
    "Perfect score! Time for some well-deserved rest 😎"
  ],
  newGroup: [
    "New task group created! Let's organize 📁",
    "Group ready for action! 🎯",
    "Task group assembled! Time to conquer 💪"
  ],
  taskMoved: [
    "Task moved successfully! 📦",
    "Reorganized like a pro! 🎯",
    "Task relocated! Perfect organization 📋"
  ]
};

// Get random message from array
const getRandomMessage = (messages: string[]) => 
  messages[Math.floor(Math.random() * messages.length)];

// Custom toast with celebration
const celebrationToast = (message: string, emoji: string = '🎉') => {
  toast.success(message, {
    duration: 4000,
    style: {
      background: 'hsl(var(--card))',
      color: 'hsl(var(--card-foreground))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: 'hsl(var(--primary))',
      secondary: 'hsl(var(--primary-foreground))',
    },
  });
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial State
      tasks: [],
      groups: [],

      // Task Actions
      addTask: (taskData) => {
        const newTask: TaskItem = {
          ...taskData,
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          subTasks: taskData.subTasks || [],
          showSubTasks: false,
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask]
        }));
      },

      updateTask: (taskId, updates) => {
        set((state) => {
          const updatedTasks = state.tasks.map((task) => {
            if (task.id === taskId) {
              const updatedTask = { ...task, ...updates };
              
              // Check if all sub-tasks are completed
              if (updates.subTasks) {
                const allSubTasksCompleted = updates.subTasks.length > 0 && 
                  updates.subTasks.every(st => st.completed);
                
                if (allSubTasksCompleted && !task.subTasks?.every(st => st.completed)) {
                  celebrationToast(getRandomMessage(TOAST_MESSAGES.allSubTasksComplete));
                }
              }
              
              return updatedTask;
            }
            return task;
          });

          return { tasks: updatedTasks };
        });
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId)
        }));
      },

      toggleTask: (taskId) => {
        set((state) => {
          const updatedTasks = state.tasks.map((task) => {
            if (task.id === taskId) {
              const newCompleted = !task.completed;
              
              // Show celebration toast when task is completed
              if (newCompleted) {
                celebrationToast(getRandomMessage(TOAST_MESSAGES.taskComplete));
              }
              
              return { ...task, completed: newCompleted };
            }
            return task;
          });

          // Check if all tasks are now completed
          const allCompleted = updatedTasks.length > 0 && updatedTasks.every(task => task.completed);
          const wasAllCompleted = state.tasks.length > 0 && state.tasks.every(task => task.completed);
          
          if (allCompleted && !wasAllCompleted && state.groups.every(group => 
            group.tasks.every(task => task.completed))) {
            setTimeout(() => {
              celebrationToast(getRandomMessage(TOAST_MESSAGES.allTasksComplete));
            }, 500);
          }

          return { tasks: updatedTasks };
        });
      },

      reorderTasks: (newOrder) => {
        set({ tasks: newOrder });
      },

      moveTaskToGroup: (taskId, groupId) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (!task) return state;

          // Convert TaskItem to simple task for group
          const groupTask = {
            id: task.id,
            title: task.title,
            completed: task.completed,
          };

          const updatedTasks = state.tasks.filter(t => t.id !== taskId);
          const updatedGroups = state.groups.map(group => 
            group.id === groupId 
              ? { ...group, tasks: [...group.tasks, groupTask] }
              : group
          );

          celebrationToast(getRandomMessage(TOAST_MESSAGES.taskMoved));

          return {
            tasks: updatedTasks,
            groups: updatedGroups
          };
        });
      },

      // Group Actions
      addGroup: (groupData) => {
        const newGroup: TaskGroup = {
          ...groupData,
          id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tasks: groupData.tasks || [],
          collapsed: false,
        };
        
        set((state) => ({
          groups: [...state.groups, newGroup]
        }));

        celebrationToast(getRandomMessage(TOAST_MESSAGES.newGroup));
      },

      updateGroup: (groupId, updates) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId ? { ...group, ...updates } : group
          )
        }));
      },

      deleteGroup: (groupId) => {
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== groupId)
        }));
      },

      toggleGroupTask: (groupId, taskId) => {
        set((state) => {
          const updatedGroups = state.groups.map((group) => {
            if (group.id === groupId) {
              const updatedTasks = group.tasks.map((task) => {
                if (task.id === taskId) {
                  const newCompleted = !task.completed;
                  
                  // Show celebration toast when task is completed
                  if (newCompleted) {
                    celebrationToast(getRandomMessage(TOAST_MESSAGES.taskComplete));
                  }
                  
                  return { ...task, completed: newCompleted };
                }
                return task;
              });

              // Check if all tasks in this group are now completed
              const allGroupTasksCompleted = updatedTasks.length > 0 && 
                updatedTasks.every(task => task.completed);
              const wasGroupCompleted = group.tasks.length > 0 && 
                group.tasks.every(task => task.completed);
              
              if (allGroupTasksCompleted && !wasGroupCompleted) {
                setTimeout(() => {
                  celebrationToast(getRandomMessage(TOAST_MESSAGES.groupComplete));
                }, 300);
              }

              return { ...group, tasks: updatedTasks };
            }
            return group;
          });

          // Check if all tasks globally are now completed
          const allIndividualTasks = state.tasks.every(task => task.completed);
          const allGroupTasks = updatedGroups.every(group => 
            group.tasks.length === 0 || group.tasks.every(task => task.completed));
          const totalTasks = state.tasks.length + updatedGroups.reduce((acc, group) => acc + group.tasks.length, 0);
          
          if (totalTasks > 0 && allIndividualTasks && allGroupTasks) {
            const wasAllCompleted = state.tasks.every(task => task.completed) && 
              state.groups.every(group => group.tasks.every(task => task.completed));
            
            if (!wasAllCompleted) {
              setTimeout(() => {
                celebrationToast(getRandomMessage(TOAST_MESSAGES.allTasksComplete));
              }, 800);
            }
          }

          return { groups: updatedGroups };
        });
      },

      addTaskToGroup: (groupId, task) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId 
              ? { ...group, tasks: [...group.tasks, task] }
              : group
          )
        }));
      },

      reorderGroups: (newOrder) => {
        set({ groups: newOrder });
      },

      reorderGroupTasks: (groupId, newOrder) => {
        set((state) => ({
          groups: state.groups.map(group =>
            group.id === groupId 
              ? { ...group, tasks: newOrder }
              : group
          )
        }));
      },

      // Sub-task Actions
      updateSubTasks: (taskId, subTasks) => {
        get().updateTask(taskId, { subTasks });
      },

      // Utility Actions
      clearAllData: () => {
        set({ tasks: [], groups: [] });
        toast.success('All data cleared! Fresh start 🌱', {
          duration: 3000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        });
      },

      importData: (data) => {
        set({
          tasks: data.tasks || [],
          groups: data.groups || []
        });
        toast.success('Data imported successfully! 📥', {
          duration: 3000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        });
      },

      // Computed Properties
      getCompletedTasksCount: () => {
        const state = get();
        const individualCompleted = state.tasks.filter(task => task.completed).length;
        const groupCompleted = state.groups.reduce((acc, group) => 
          acc + group.tasks.filter(task => task.completed).length, 0);
        return individualCompleted + groupCompleted;
      },

      getTotalTasksCount: () => {
        const state = get();
        const individualTotal = state.tasks.length;
        const groupTotal = state.groups.reduce((acc, group) => acc + group.tasks.length, 0);
        return individualTotal + groupTotal;
      },

      isAllTasksCompleted: () => {
        const state = get();
        const totalTasks = state.getTotalTasksCount();
        const completedTasks = state.getCompletedTasksCount();
        return totalTasks > 0 && totalTasks === completedTasks;
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        groups: state.groups,
      }),
    }
  )
);