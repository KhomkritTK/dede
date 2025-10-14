import { apiClient } from '@/lib/api'

// New License Request
export interface NewLicenseRequest {
  licenseType: string
  projectName: string
  projectAddress: string
  province: string
  district: string
  subdistrict: string
  postalCode: string
  energyType: string
  capacity: string
  capacityUnit: string
  expectedStartDate: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  description: string
}

// Renewal License Request
export interface RenewalLicenseRequest {
  licenseType: string
  licenseNumber: string
  projectName: string
  projectAddress: string
  currentCapacity: string
  currentCapacityUnit: string
  requestedCapacity: string
  requestedCapacityUnit: string
  expiryDate: string
  requestedExpiryDate: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  reason: string
}

// Extension License Request
export interface ExtensionLicenseRequest {
  licenseType: string
  licenseNumber: string
  projectName: string
  currentCapacity: string
  currentCapacityUnit: string
  requestedCapacity: string
  requestedCapacityUnit: string
  extensionReason: string
  expectedStartDate: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  description: string
}

// Reduction License Request
export interface ReductionLicenseRequest {
  licenseType: string
  licenseNumber: string
  projectName: string
  currentCapacity: string
  currentCapacityUnit: string
  requestedCapacity: string
  requestedCapacityUnit: string
  reductionReason: string
  expectedStartDate: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  description: string
}

// License API Service
export const licenseApi = {
  // Create new license request
  async createNewLicenseRequest(data: NewLicenseRequest) {
    return await apiClient.post('/api/v1/licenses/new', data)
  },

  // Create renewal license request
  async createRenewalLicenseRequest(data: RenewalLicenseRequest) {
    return await apiClient.post('/api/v1/licenses/renewal', data)
  },

  // Create extension license request
  async createExtensionLicenseRequest(data: ExtensionLicenseRequest) {
    return await apiClient.post('/api/v1/licenses/extension', data)
  },

  // Create reduction license request
  async createReductionLicenseRequest(data: ReductionLicenseRequest) {
    return await apiClient.post('/api/v1/licenses/reduction', data)
  },

  // Get license types
  async getLicenseTypes() {
    return await apiClient.get('/api/v1/licenses/types')
  },

  // Get user's license requests
  async getMyLicenseRequests(page = 1, limit = 10) {
    return await apiClient.get(`/api/v1/licenses/my?page=${page}&limit=${limit}`)
  },

  // Get specific license request
  async getLicenseRequest(id: string) {
    return await apiClient.get(`/api/v1/licenses/${id}`)
  }
}