'use client'

import { useAuth } from '@/hooks/useAuth'
import { usePortalAuth } from '@/hooks/usePortalAuth'

export default function LoginStatus() {
  const { user: webViewUser, isAuthenticated: isWebViewAuth } = useAuth()
  const { user: portalUser, isAuthenticated: isPortalAuth } = usePortalAuth()

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-white rounded border">
          <h4 className="font-medium text-blue-600 mb-1">Web View Login</h4>
          <p className="text-sm">
            Status: {isWebViewAuth ? '✅ Logged In' : '❌ Not Logged In'}
          </p>
          {webViewUser && (
            <p className="text-sm">
              User: {webViewUser.fullName} ({webViewUser.role})
            </p>
          )}
        </div>
        
        <div className="p-3 bg-white rounded border">
          <h4 className="font-medium text-green-600 mb-1">Web Portal Login</h4>
          <p className="text-sm">
            Status: {isPortalAuth ? '✅ Logged In' : '❌ Not Logged In'}
          </p>
          {portalUser && (
            <p className="text-sm">
              User: {portalUser.fullName} ({portalUser.role})
            </p>
          )}
        </div>
      </div>
      
      {isWebViewAuth && isPortalAuth && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">
            ✅ Simultaneous login is working! Both Web View and Web Portal are active.
          </p>
        </div>
      )}
    </div>
  )
}