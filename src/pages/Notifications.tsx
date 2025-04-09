import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: "update" | "system" | "alert";
};

const mockNotifications: Notification[] = [
  {
    id: "2",
    title: "Welcome to CourseGPT",
    message: "Thanks for joining CourseGPT! Start creating your first course.",
    read: true,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    type: "system",
  },
  {
    id: "3",
    title: "Course published",
    message: "Your course 'JavaScript Basics' has been published and is now available to students.",
    read: false,
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    type: "alert",
  },
  {
    id: "4",
    title: "Weekly summary",
    message: "Here's your weekly summary: 2 new lessons created, 5 students enrolled.",
    read: true,
    createdAt: new Date(Date.now() - 604800000), // 7 days ago
    type: "system",
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter(n => !n.read).length;
  const updateCount = notifications.filter(n => n.type === "update").length;
  const systemCount = notifications.filter(n => n.type === "system").length;
  const alertCount = notifications.filter(n => n.type === "alert").length;

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return notification.type === activeTab;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" className="shrink-0">
              <CheckIcon className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="all" className="relative">
              All
              {notifications.length > 0 && (
                <span className="ml-1 text-xs inline-flex items-center justify-center">
                  ({notifications.length})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <span className="ml-1 text-xs">
                  ({unreadCount})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="update">
              Updates
              {updateCount > 0 && (
                <span className="ml-1 text-xs">
                  ({updateCount})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="system">
              System
              {systemCount > 0 && (
                <span className="ml-1 text-xs">
                  ({systemCount})
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {activeTab === "all" ? "All notifications" :
                   activeTab === "unread" ? "Unread notifications" :
                   activeTab === "update" ? "Course updates" :
                   "System notifications"}
                </CardTitle>
                <CardDescription>
                  {filteredNotifications.length === 0 
                    ? "No notifications to display" 
                    : `Showing ${filteredNotifications.length} notification${filteredNotifications.length !== 1 ? 's' : ''}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No notifications to display</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 rounded-lg border ${!notification.read ? 'bg-primary/5 border-primary/20' : ''} transition-all hover:bg-muted/50`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{notification.title}</h3>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notification.id)}
                              className="h-8"
                            >
                              <CheckIcon className="h-3.5 w-3.5 mr-1" />
                              Mark as read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 text-destructive hover:text-destructive"
                          >
                            <TrashIcon className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Notifications;
