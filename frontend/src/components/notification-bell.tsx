'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Bell } from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

 type NotificationRecord = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  sentAt: string;
  readAt?: string | null;
};

 type NotificationResponse = {
  total: number;
  notifications: NotificationRecord[];
};

const fetchNotifications = () => apiClient.get<NotificationResponse>('/notifications');

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 10000,
  });

  const unreadCount = data?.notifications.filter((notification) => !notification.readAt).length ?? 0;

  const markAllMutation = useMutation({
    mutationFn: () => apiClient.post('/notifications/read'),
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (open && unreadCount > 0) {
      markAllMutation.mutate();
    }
  }, [open, unreadCount, markAllMutation]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </Button>
      {open ? (
        <div className="absolute right-0 mt-2 w-80 space-y-3 rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-lg shadow-slate-900/10 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            {data?.notifications.length ? (
              data.notifications.slice(0, 10).map((notification) => (
                <div key={notification.id} className="rounded-xl border border-slate-200/60 bg-white/80 p-3">
                  <p className="font-semibold text-slate-900">{notification.type.replaceAll('_', ' ')}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(notification.sentAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No notifications yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
