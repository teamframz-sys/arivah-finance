// Browser Notification System

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  // Request notification permission from user
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Browser notifications are not supported');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission was denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Show a browser notification
  async show(options: NotificationOptions): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    // Auto-request permission if not already granted
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        badge: '/favicon.ico',
        requireInteraction: false,
        silent: false,
      });

      if (options.onClick) {
        notification.onclick = () => {
          window.focus();
          options.onClick?.();
          notification.close();
        };
      }

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Check if notifications are supported and enabled
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Check if permission is granted
  isGranted(): boolean {
    return this.permission === 'granted';
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// Convenience functions for common notification types
export const notify = {
  // Transaction notifications
  transactionCreated: (amount: number, category: string) => {
    notificationService.show({
      title: '💰 Transaction Added',
      body: `₹${amount.toLocaleString()} - ${category}`,
      tag: 'transaction',
    });
  },

  transactionUpdated: (amount: number, category: string) => {
    notificationService.show({
      title: '✏️ Transaction Updated',
      body: `₹${amount.toLocaleString()} - ${category}`,
      tag: 'transaction',
    });
  },

  transactionDeleted: () => {
    notificationService.show({
      title: '🗑️ Transaction Deleted',
      body: 'Transaction has been removed',
      tag: 'transaction',
    });
  },

  // Transfer notifications
  transferCreated: (amount: number, fromBusiness: string, toBusiness: string) => {
    notificationService.show({
      title: '🔄 Transfer Completed',
      body: `₹${amount.toLocaleString()} from ${fromBusiness} to ${toBusiness}`,
      tag: 'transfer',
    });
  },

  // Task notifications
  taskAssigned: (taskTitle: string, assignedTo: string) => {
    notificationService.show({
      title: '📋 Task Assigned',
      body: `"${taskTitle}" assigned to ${assignedTo}`,
      tag: 'task',
    });
  },

  taskCompleted: (taskTitle: string) => {
    notificationService.show({
      title: '✅ Task Completed',
      body: `"${taskTitle}" has been completed`,
      tag: 'task',
    });
  },

  taskDueSoon: (taskTitle: string, dueDate: string) => {
    notificationService.show({
      title: '⏰ Task Due Soon',
      body: `"${taskTitle}" is due on ${dueDate}`,
      tag: 'task-reminder',
    });
  },

  // Personal expense notifications
  expenseAdded: (amount: number, category: string) => {
    notificationService.show({
      title: '💳 Personal Expense Added',
      body: `₹${amount.toLocaleString()} - ${category}`,
      tag: 'personal-expense',
    });
  },

  expenseReimbursed: (amount: number) => {
    notificationService.show({
      title: '💵 Expense Reimbursed',
      body: `₹${amount.toLocaleString()} has been reimbursed`,
      tag: 'reimbursement',
    });
  },

  // Partner share notifications
  profitShared: (amount: number, partnerName: string) => {
    notificationService.show({
      title: '💰 Profit Shared',
      body: `₹${amount.toLocaleString()} distributed to ${partnerName}`,
      tag: 'profit-share',
    });
  },

  // Generic success/error notifications
  success: (title: string, message: string) => {
    notificationService.show({
      title: `✅ ${title}`,
      body: message,
      tag: 'success',
    });
  },

  error: (title: string, message: string) => {
    notificationService.show({
      title: `❌ ${title}`,
      body: message,
      tag: 'error',
    });
  },

  info: (title: string, message: string) => {
    notificationService.show({
      title: `ℹ️ ${title}`,
      body: message,
      tag: 'info',
    });
  },
};

// Initialize notification permission on app load
if (typeof window !== 'undefined') {
  // Check if user has previously interacted with the app
  const hasInteracted = localStorage.getItem('app_interacted');

  if (hasInteracted) {
    // Auto-request permission if user has interacted before
    notificationService.requestPermission();
  }

  // Set interaction flag on first user action
  const setInteracted = () => {
    localStorage.setItem('app_interacted', 'true');
    document.removeEventListener('click', setInteracted);
  };

  document.addEventListener('click', setInteracted);
}
