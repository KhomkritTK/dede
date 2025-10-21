import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, Users, ArrowRight } from 'lucide-react';

interface WorkflowState {
  id: string;
  name: string;
  description: string;
  type: 'start' | 'process' | 'decision' | 'end';
  position: { x: number; y: number };
  color: string;
}

interface WorkflowTransition {
  id: string;
  from: string;
  to: string;
  condition?: string;
  label: string;
}

interface WorkflowData {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  currentState?: string;
}

interface RequestData {
  id: number;
  licenseType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  currentAssignee?: {
    id: number;
    fullName: string;
  };
  history: {
    id: number;
    fromStatus: string;
    toStatus: string;
    changedBy: {
      id: number;
      fullName: string;
    };
    changedAt: string;
    reason?: string;
  }[];
}

const WorkflowVisualization: React.FC<{ requestId?: number }> = ({ requestId }) => {
  const [loading, setLoading] = useState(true);
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    if (requestId) {
      fetchWorkflowData();
      fetchRequestData();
    } else {
      fetchGenericWorkflowData();
    }
  }, [requestId]);

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflow/state/${requestId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow data');
      }
      const data = await response.json();
      setWorkflowData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestData = async () => {
    try {
      const response = await fetch(`/api/workflow/requests/${requestId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch request data');
      }
      const data = await response.json();
      setRequestData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchGenericWorkflowData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflow/diagram');
      if (!response.ok) {
        throw new Error('Failed to fetch workflow diagram');
      }
      const data = await response.json();
      setWorkflowData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStateIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <CheckCircle className="h-6 w-6" />;
      case 'process':
        return <FileText className="h-6 w-6" />;
      case 'decision':
        return <AlertCircle className="h-6 w-6" />;
      case 'end':
        return <CheckCircle className="h-6 w-6" />;
      default:
        return <Clock className="h-6 w-6" />;
    }
  };

  const getStateColor = (stateId: string) => {
    if (!workflowData || !workflowData.currentState) {
      return '#e5e7eb'; // gray-200
    }

    if (stateId === workflowData.currentState) {
      return '#3b82f6'; // blue-500
    }

    // Check if this state is in the history
    if (requestData && requestData.history) {
      const isInHistory = requestData.history.some(
        h => h.toStatus === stateId
      );
      if (isInHistory) {
        return '#10b981'; // green-500
      }
    }

    return '#e5e7eb'; // gray-200
  };

  const renderState = (state: WorkflowState) => {
    const isSelected = selectedState === state.id;
    const color = getStateColor(state.id);

    return (
      <div
        key={state.id}
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
          isSelected ? 'scale-110 z-10' : ''
        }`}
        style={{
          left: `${state.position.x}px`,
          top: `${state.position.y}px`,
        }}
        onClick={() => setSelectedState(isSelected ? null : state.id)}
      >
        <div
          className={`flex items-center justify-center w-16 h-16 rounded-full border-2 ${
            isSelected ? 'border-gray-800' : 'border-gray-300'
          }`}
          style={{ backgroundColor: color }}
        >
          <div className="text-white">
            {getStateIcon(state.type)}
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs font-medium whitespace-nowrap">{state.name}</p>
        </div>
      </div>
    );
  };

  const renderTransition = (transition: WorkflowTransition) => {
    if (!workflowData) return null;

    const fromState = workflowData.states.find(s => s.id === transition.from);
    const toState = workflowData.states.find(s => s.id === transition.to);

    if (!fromState || !toState) return null;

    // Calculate the line position
    const x1 = fromState.position.x;
    const y1 = fromState.position.y;
    const x2 = toState.position.x;
    const y2 = toState.position.y;

    // Calculate the midpoint for the arrow
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Calculate the angle for the arrow
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    return (
      <svg
        key={transition.id}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: -1 }}
      >
        <defs>
          <marker
            id={`arrowhead-${transition.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6b7280"
            />
          </marker>
        </defs>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#6b7280"
          strokeWidth="2"
          markerEnd={`url(#arrowhead-${transition.id})`}
        />
        {transition.label && (
          <text
            x={midX}
            y={midY - 5}
            textAnchor="middle"
            className="text-xs bg-white px-1"
          >
            {transition.label}
          </text>
        )}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading workflow...</p>
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
            onClick={() => {
              setError(null);
              if (requestId) {
                fetchWorkflowData();
                fetchRequestData();
              } else {
                fetchGenericWorkflowData();
              }
            }} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!workflowData) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {requestId ? 'Workflow Visualization' : 'DEDE Workflow Diagram'}
        </h1>
        {requestId && (
          <button 
            onClick={() => {
              fetchWorkflowData();
              fetchRequestData();
            }} 
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Request Information */}
      {requestData && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Request Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Request ID</p>
              <p className="text-sm">#{requestData.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">License Type</p>
              <p className="text-sm">{requestData.licenseType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Current Status</p>
              <p className="text-sm">{requestData.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Created At</p>
              <p className="text-sm">{new Date(requestData.createdAt).toLocaleString('th-TH')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Updated At</p>
              <p className="text-sm">{new Date(requestData.updatedAt).toLocaleString('th-TH')}</p>
            </div>
            {requestData.currentAssignee && (
              <div>
                <p className="text-sm font-medium text-gray-600">Current Assignee</p>
                <p className="text-sm">{requestData.currentAssignee.fullName}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workflow Visualization */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Workflow Diagram</h2>
        <div className="relative" style={{ height: '500px' }}>
          {/* Render transitions first (behind states) */}
          {workflowData.transitions.map(transition => renderTransition(transition))}
          
          {/* Render states */}
          {workflowData.states.map(state => renderState(state))}
        </div>
      </div>

      {/* State Details */}
      {selectedState && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">State Details</h2>
          {workflowData.states.find(s => s.id === selectedState) && (
            <div>
              <p className="text-sm font-medium text-gray-600">Name</p>
              <p className="text-sm">{workflowData.states.find(s => s.id === selectedState)?.name}</p>
              <p className="text-sm font-medium text-gray-600 mt-2">Description</p>
              <p className="text-sm">{workflowData.states.find(s => s.id === selectedState)?.description}</p>
              <p className="text-sm font-medium text-gray-600 mt-2">Type</p>
              <p className="text-sm">{workflowData.states.find(s => s.id === selectedState)?.type}</p>
            </div>
          )}
        </div>
      )}

      {/* Request History */}
      {requestData && requestData.history && requestData.history.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Request History</h2>
          <div className="space-y-4">
            {requestData.history.map((historyItem) => (
              <div key={historyItem.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {historyItem.changedBy.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      changed status from {historyItem.fromStatus} to {historyItem.toStatus}
                    </p>
                  </div>
                  {historyItem.reason && (
                    <p className="text-sm text-gray-600 mt-1">
                      Reason: {historyItem.reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(historyItem.changedAt).toLocaleString('th-TH')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Legend</h2>
        <div className="flex flex-wrap space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <p className="text-sm">Current State</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <p className="text-sm">Completed State</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gray-200"></div>
            <p className="text-sm">Pending State</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisualization;