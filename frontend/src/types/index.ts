export interface AuthUser {
  id: string | number
  email: string
  displayName: string
  avatarUrl?: string
  roles: string[]
  adminProtected?: boolean
  createdAt?: string
}
