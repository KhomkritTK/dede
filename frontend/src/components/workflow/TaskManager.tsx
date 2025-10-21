import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, Users, CheckCircle, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Task {
  id: number;
  requestID: number;
  licenseType: string;
  taskTitle: string;
  description: string;
  assignedBy: {
    id: number;
    fullName: string;
  };
  assignedTo: {
    id: number;
    fullName: string;
  };
  status: string;
  priority: string;
  deadline?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

const TaskManager: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    taskTitle: '',
    description: '',
    assignedToID: '',
    priority: 'normal',
    deadline: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [user, filter]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filter.status) queryParams.append('status', filter.status);
      if (filter.priority) queryParams.append('priority', filter.priority);
      if (filter.assignedTo) queryParams.append('assigned_to', filter.assignedTo);

      const response = await fetch(`/api/workflow/tasks?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/workflow/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assignedToID: formData.assignedToID ? parseInt(formData.assignedToID) : null,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      setShowCreateForm(false);
      resetForm();
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/workflow/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          assignedToID: formData.assignedToID ? parseInt(formData.assignedToID) : null,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setShowEditForm(false);
      setSelectedTask(null);
      resetForm();
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/workflow/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const completeTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/workflow/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'Task completed'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete task');
      }

      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const assignTask = async (taskId: number, userId: number) => {
    try {
      const response = await fetch(`/api/workflow/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign task');
      }

      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      taskTitle: '',
      description: '',
      assignedToID: '',
      priority: 'normal',
      deadline: ''
    });
  };

  const openEditForm = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      taskTitle: task.taskTitle,
      description: task.description,
      assignedToID: task.assignedTo?.id.toString() || '',
      priority: task.priority,
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''
    });
    setShowEditForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'reassigned':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
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

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">จัดการงาน</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          สร้างงานใหม่
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="assigned">มอบหมายแล้ว</option>
              <option value="reassigned">มอบหมายใหม่</option>
              <option value="completed">เสร็จสิ้น</option>
              <option value="overdue">ล่าช้า</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ความสำคัญ
            </label>
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="high">สูง</option>
              <option value="normal">ปกติ</option>
              <option value="low">ต่ำ</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ผู้รับผิดชอบ
            </label>
            <select
              value={filter.assignedTo}
              onChange={(e) => setFilter({ ...filter, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ status: '', priority: '', assignedTo: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right"
          >
            &times;
          </button>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">รายการงาน</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่องาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ประเภทใบอนุญาต
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้รับผิดชอบ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ความสำคัญ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  กำหนดการ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    ไม่มีงาน
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className={isOverdue(task.deadline) ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.taskTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.licenseType} #{task.requestID}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.assignedTo ? task.assignedTo.fullName : 'ยังไม่ได้มอบหมาย'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.deadline ? (
                        <div className={isOverdue(task.deadline) ? 'text-red-600' : ''}>
                          {new Date(task.deadline).toLocaleDateString('th-TH')}
                          {isOverdue(task.deadline) && (
                            <div className="flex items-center mt-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              <span className="text-xs">ล่าช้า</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => completeTask(task.id)}
                            className="text-green-600 hover:text-green-900"
                            title="เสร็จสิ้น"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditForm(task)}
                          className="text-blue-600 hover:text-blue-900"
                          title="แก้ไข"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600 hover:text-red-900"
                          title="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900">สร้างงานใหม่</h3>
              <form onSubmit={createTask} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ชื่องาน
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.taskTitle}
                    onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    รายละเอียด
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ผู้รับผิดชอบ
                  </label>
                  <select
                    value={formData.assignedToID}
                    onChange={(e) => setFormData({ ...formData, assignedToID: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">เลือกผู้รับผิดชอบ</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ความสำคัญ
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">ต่ำ</option>
                    <option value="normal">ปกติ</option>
                    <option value="high">สูง</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    กำหนดการ
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    สร้าง
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditForm && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900">แก้ไขงาน</h3>
              <form onSubmit={updateTask} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ชื่องาน
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.taskTitle}
                    onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    รายละเอียด
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ผู้รับผิดชอบ
                  </label>
                  <select
                    value={formData.assignedToID}
                    onChange={(e) => setFormData({ ...formData, assignedToID: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">เลือกผู้รับผิดชอบ</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ความสำคัญ
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">ต่ำ</option>
                    <option value="normal">ปกติ</option>
                    <option value="high">สูง</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    กำหนดการ
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedTask(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;