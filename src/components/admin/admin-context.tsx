'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import type { AdminActionRequest, AdminActionType, SelectedAdminEntity } from '@/types/admin'

interface AdminContextValue {
  selectedEntity: SelectedAdminEntity | null
  selectEntity: (entity: SelectedAdminEntity) => void
  clearSelection: () => void
  actionRequest: AdminActionRequest | null
  requestAction: (type: AdminActionType) => void
  clearAction: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminContextProvider({ children }: { children: React.ReactNode }) {
  const [selectedEntity, setSelectedEntity] = useState<SelectedAdminEntity | null>(null)
  const [actionRequest, setActionRequest] = useState<AdminActionRequest | null>(null)

  const value = useMemo(
    () => ({
      selectedEntity,
      selectEntity: setSelectedEntity,
      clearSelection: () => setSelectedEntity(null),
      actionRequest,
      requestAction: (type: AdminActionType) => setActionRequest({ type, nonce: Date.now() }),
      clearAction: () => setActionRequest(null),
    }),
    [actionRequest, selectedEntity],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdminContext() {
  const context = useContext(AdminContext)

  if (!context) {
    throw new Error('useAdminContext debe utilizarse dentro de AdminContextProvider')
  }

  return context
}
