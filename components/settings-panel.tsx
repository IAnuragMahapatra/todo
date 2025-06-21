'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Palette, 
  Download, 
  Upload, 
  Trash2, 
  Sun, 
  Moon, 
  Monitor,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useTaskStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportData {
  tasks: any[];
  groups: any[];
  exportDate: string;
  version: string;
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative group ${className || ''}`}
      role="img"
      aria-label="Settings Icon"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl scale-110 opacity-50" />
      <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg border border-primary/20">
        <div className="relative">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', delay: 0.2 }}
            className="relative z-10 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 p-1 sm:p-1.5"
          >
            <svg
              className="w-full h-full text-primary-foreground group-hover:animate-spin-slow transition-transform duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V12a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </motion.div>
        </div>
        <div className="absolute inset-0.5 rounded-xl border border-primary-foreground/10" />
      </div>
      <motion.div
        animate={{ y: [0, -7, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-1 -right-1 w-1 h-1 bg-accent/40 rounded-full"
      />
      <motion.div
        animate={{ y: [0, -5, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute -bottom-1 -left-1 w-0.5 h-0.5 bg-primary/60 rounded-full"
      />
    </motion.div>
  );
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const { tasks, groups, clearAllData, importData } = useTaskStore();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show notification with auto-dismiss
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Export all data as JSON
  const handleExportData = () => {
    try {
      const exportData: ExportData = {
        tasks,
        groups,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };

      // Create and download the file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Tasks exported successfully! 📥', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export tasks. Please try again.');
    }
  };

  // Import JSON data and restore
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData: ExportData = JSON.parse(e.target?.result as string);
        
        // Validate the import data structure
        if (!importedData.tasks && !importedData.groups) {
          throw new Error('Invalid backup file format');
        }

        importData({
          tasks: importedData.tasks || [],
          groups: importedData.groups || []
        });

        // Refresh the page to reflect imported data
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error) {
        console.error('Import failed:', error);
        toast.error('Failed to import file. Please check the file format.');
      }
    };

    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear all data
  const handleClearAllData = () => {
    clearAllData();
    setShowClearDialog(false);
    
    // Refresh the page to reflect cleared data
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm sm:max-w-md bg-background/95 backdrop-blur-sm border-l border-border shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-card/50">
              <div className="flex items-center space-x-3">
                <SettingsIcon />
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Settings</h2>
              </div>
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-9 w-9 sm:h-10 sm:w-10 p-0 hover:bg-muted/50 rounded-full touch-manipulation"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Theme Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium text-foreground">Appearance</h3>
                </div>
                
                <div className="space-y-3">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:bg-muted/50 touch-manipulation",
                          theme === option.value 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-border text-foreground hover:border-border/60"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="font-medium text-sm sm:text-base">{option.label}</span>
                        </div>
                        <AnimatePresence>
                          {theme === option.value && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                            >
                              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <Separator />

              {/* Data Management Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium text-foreground">Data Management</h3>
                </div>

                <div className="space-y-3">
                  {/* Export Data */}
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      className="w-full justify-start h-12 sm:h-14 hover:bg-muted/50 touch-manipulation"
                    >
                      <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium text-sm sm:text-base">Export Tasks</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Download backup as JSON</div>
                      </div>
                    </Button>
                  </motion.div>

                  {/* Import Data */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full justify-start h-12 sm:h-14 hover:bg-muted/50 touch-manipulation"
                      >
                        <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium text-sm sm:text-base">Import Tasks</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Restore from JSON backup</div>
                        </div>
                      </Button>
                    </motion.div>
                  </div>

                  {/* Clear All Data */}
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => setShowClearDialog(true)}
                      variant="outline"
                      className="w-full justify-start h-12 sm:h-14 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 touch-manipulation"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium text-sm sm:text-base">Clear All Data</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Reset all tasks and settings</div>
                      </div>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              <Separator />

              {/* Info Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium text-foreground">About</h3>
                </div>
                
                <div className="p-4 sm:p-6 bg-muted/30 rounded-xl border border-border/50">
                  <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span className="font-medium">1.5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tasks:</span>
                      <span className="font-medium">{tasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Groups:</span>
                      <span className="font-medium">{groups.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Made by:</span>
                      <span className="font-medium">Anurag Mahapatra</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Notification */}
            <AnimatePresence>
              {notification && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6"
                >
                  <div className={cn(
                    "p-4 rounded-xl border shadow-lg backdrop-blur-sm",
                    notification.type === 'success' && "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400",
                    notification.type === 'error' && "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400",
                    notification.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                  )}>
                    <div className="flex items-center space-x-2">
                      {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
                      {notification.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                      {notification.type === 'info' && <Info className="h-4 w-4" />}
                      <span className="text-sm font-medium">{notification.message}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Data Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Clear All Data</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete all your tasks, 
              groups, settings, and other saved data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="touch-manipulation">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 touch-manipulation"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}