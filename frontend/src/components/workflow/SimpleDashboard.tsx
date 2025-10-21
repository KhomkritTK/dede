import React, { useState, useEffect } from 'react';
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

const SimpleDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('activities');

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
          <button 
            onClick={fetchDashboardData} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { statistics, recentActivities, upcomingDeadlines, pendingTasks, notifications } = dashboardData;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">DEDE แดชบอร์ด</h1>
        <button 
          onClick={fetchDashboardData} 
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          รีเฟรช
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">คำขอทั้งหมด</p>
              <p className="text-2xl font-bold">{statistics.totalRequests}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getProgressPercentage()}% ดำเนินการเสร็จสิ้น
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">คำขอใหม่</p>
              <p className="text-2xl font-bold">{statistics.newRequests}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-4">
            รอดำเนินการ
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">งานที่รอดำเนินการ</p>
              <p className="text-2xl font-bold">{statistics.pendingTasks}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-4">
            {statistics.overdueTasks} งานล่าช้า
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">คำขอล่าช้า</p>
              <p className="text-2xl font-bold text-red-600">{statistics.overdueRequests}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-xs text-gray-500 mt-4">
            ต้องการดำเนินการ
          </p>
        </div>
      </div>

      {/* Tabs for different sections */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              กิจกรรมล่าสุด
            </button>
            <button
              onClick={() => setActiveTab('deadlines')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'deadlines'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              กำหนดการ
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              งานที่รอดำเนินการ
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              การแจ้งเตือน
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'activities' && (
            <div>
              <h2 className="text-lg font-medium mb-4">กิจกรรมล่าสุด</h2>
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
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.newStatus)}`}>
                            {activity.newStatus}
                          </span>
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
            </div>
          )}

          {activeTab === 'deadlines' && (
            <div>
              <h2 className="text-lg font-medium mb-4">กำหนดการที่ใกล้ถึง</h2>
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
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(deadline.priority)}`}>
                            {deadline.priority}
                          </span>
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
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            deadline.daysUntil <= 3 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {deadline.daysUntil} วัน
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <h2 className="text-lg font-medium mb-4">งานที่รอดำเนินการ</h2>
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
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
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
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-medium mb-4">การแจ้งเตือน</h2>
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
                          {notification.type === 'task_assigned' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                          {notification.type === 'deadline_reminder' && <Clock className="h-4 w-4 text-purple-600" />}
                          {notification.type === 'comment_created' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                          {(!notification.type || !['task_assigned', 'deadline_reminder', 'comment_created'].includes(notification.type)) && <FileText className="h-4 w-4 text-purple-600" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          {!notification.readAt && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              ใหม่
                            </span>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;