import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Clock, Users, CheckCircle, AlertCircle, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalRequests: number;
  newRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  overdueRequests: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

interface RecentActivity {
  id: number;
  licenseType: string;
  licenseRequestId: number;
  previousStatus: string;
  newStatus: string;
  changedBy: {
    id: number;
    fullName: string;
  };
  changeReason: string;
  createdAt: string;
}

interface UpcomingDeadline {
  id: number;
  requestID: number;
  licenseType: string;
  taskTitle: string;
  description: string;
  assignedTo: {
    id: number;
    fullName: string;
  };
  status: string;
  priority: string;
  deadline: string;
  daysUntil: number;
}

interface PendingTask {
  id: number;
  requestID: number;
  licenseType: string;
  taskTitle: string;
  description: string;
  assignedTo: {
    id: number;
    fullName: string;
  };
  status: string;
  priority: string;
  deadline?: string;
  createdAt: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  createdAt: string;
  readAt?: string;
}

interface DashboardData {
  statistics: DashboardStats;
  recentActivities: RecentActivity[];
  upcomingDeadlines: UpcomingDeadline[];
  pendingTasks: PendingTask[];
  notifications: Notification[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/workflow/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new_request':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <CheckCircle className="h-4 w-4" />;
      case 'deadline_reminder':
        return <Clock className="h-4 w-4" />;
      case 'comment_created':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = () => {
    if (!dashboardData) return 0;
    const { statistics } = dashboardData;
    const total = statistics.totalRequests;
    if (total === 0) return 0;
    return Math.round(((statistics.approvedRequests + statistics.rejectedRequests) / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { statistics, recentActivities, upcomingDeadlines, pendingTasks, notifications } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">DEDE แดชบอร์ด</h1>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          รีเฟรช
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คำขอทั้งหมด</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalRequests}</div>
            <Progress value={getProgressPercentage()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {getProgressPercentage()}% ดำเนินการเสร็จสิ้น
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คำขอใหม่</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.newRequests}</div>
            <p className="text-xs text-muted-foreground">
              รอดำเนินการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งานที่รอดำเนินการ</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.overdueTasks} งานล่าช้า
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คำขอล่าช้า</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.overdueRequests}</div>
            <p className="text-xs text-muted-foreground">
              ต้องการดำเนินการ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities">กิจกรรมล่าสุด</TabsTrigger>
          <TabsTrigger value="deadlines">กำหนดการ</TabsTrigger>
          <TabsTrigger value="tasks">งานที่รอดำเนินการ</TabsTrigger>
          <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>กิจกรรมล่าสุด</CardTitle>
              <CardDescription>
                กิจกรรมล่าสุดในระบบ DEDE
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  ไม่มีกิจกรรมล่าสุด
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.changedBy.fullName}
                          </p>
                          <Badge className={getStatusColor(activity.newStatus)}>
                            {activity.newStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {activity.licenseType} #{activity.licenseRequestId}
                        </p>
                        {activity.changeReason && (
                          <p className="text-sm text-gray-600 mt-1">
                            เหตุผล: {activity.changeReason}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.createdAt).toLocaleString('th-TH')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>กำหนดการที่ใกล้ถึง</CardTitle>
              <CardDescription>
                กำหนดการที่ใกล้ถึงในระบบ DEDE
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  ไม่มีกำหนดการที่ใกล้ถึง
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <CalendarDays className="h-4 w-4 text-orange-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {deadline.taskTitle}
                          </p>
                          <Badge className={getPriorityColor(deadline.priority)}>
                            {deadline.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {deadline.licenseType} #{deadline.requestID}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ผู้รับผิดชอบ: {deadline.assignedTo.fullName}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {new Date(deadline.deadline).toLocaleDateString('th-TH')}
                          </p>
                          <Badge variant={deadline.daysUntil <= 3 ? "destructive" : "outline"}>
                            {deadline.daysUntil} วัน
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>งานที่รอดำเนินการ</CardTitle>
              <CardDescription>
                งานที่รอดำเนินการในระบบ DEDE
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  ไม่มีงานที่รอดำเนินการ
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {task.taskTitle}
                          </p>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {task.licenseType} #{task.requestID}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ผู้รับผิดชอบ: {task.assignedTo.fullName}
                        </p>
                        {task.deadline && (
                          <div className="flex items-center mt-1 space-x-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              กำหนดการ: {new Date(task.deadline).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          สร้างเมื่อ: {new Date(task.createdAt).toLocaleString('th-TH')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>การแจ้งเตือน</CardTitle>
              <CardDescription>
                การแจ้งเตือนล่าสุดในระบบ DEDE
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  ไม่มีการแจ้งเตือน
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          {!notification.readAt && (
                            <Badge variant="secondary">ใหม่</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString('th-TH')}
                        </p>
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
  );
};

export default Dashboard;