'use client'

import { AuthContextType } from './useAuthLogic'

// Re-export from the .tsx file
export { AuthProvider, useAuth } from './useAuth'

// Export types for use in other files
export type { AuthContextType } from './useAuthLogic'