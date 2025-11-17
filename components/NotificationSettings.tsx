'use client';

import { useState, useEffect } from 'react';
import { notificationService } from '@/lib/notifications';
import { Bell, BellOff, Check, X } from 'lucide-react';

export default function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    if (notificationService.isSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    const granted = await notificationService.requestPermission();
    setPermission(Notification.permission);
    setLoading(false);

    if (granted) {
      // Show test notification
      notificationService.show({
        title: '🔔 Notifications Enabled!',
        body: 'You will now receive notifications for important events',
        tag: 'notification-enabled',
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BellOff className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Notifications Not Supported</p>
            <p className="text-xs text-gray-600 mt-1">
              Your browser doesn't support push notifications
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <X className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Notifications Blocked</p>
            <p className="text-xs text-red-700 mt-1">
              You've blocked notifications. To enable them, update your browser settings.
            </p>
            <details className="mt-2">
              <summary className="text-xs text-red-600 cursor-pointer hover:underline">
                How to enable in browser settings
              </summary>
              <div className="mt-2 text-xs text-red-700 space-y-1">
                <p><strong>Chrome/Edge:</strong> Settings → Privacy and security → Site settings → Notifications</p>
                <p><strong>Firefox:</strong> Settings → Privacy & Security → Permissions → Notifications</p>
                <p><strong>Safari:</strong> Preferences → Websites → Notifications</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'granted') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Notifications Enabled</p>
            <p className="text-xs text-green-700 mt-1">
              You'll receive notifications for transactions, tasks, and more
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">Enable Notifications</p>
          <p className="text-xs text-blue-700 mt-1">
            Get notified about transactions, tasks, and important updates
          </p>
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="mt-3 bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Requesting...' : 'Enable Notifications'}
          </button>
        </div>
      </div>
    </div>
  );
}
