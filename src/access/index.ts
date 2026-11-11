import type { Access, FieldAccess } from 'payload'

type MaybeUser = { role?: 'admin' | 'editor' } | null | undefined

const roleOf = (user: unknown): MaybeUser => (user as MaybeUser) ?? null

export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => roleOf(user)?.role === 'admin'

/** Admins and editors can do everything that is content-related. */
export const isStaff: Access = ({ req: { user } }) => {
  const role = roleOf(user)?.role
  return role === 'admin' || role === 'editor'
}

export const anyone: Access = () => true

export const nobody: Access = () => false

/** Public visitors only see published documents; logged-in staff see drafts too. */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const staffOnlyField: FieldAccess = ({ req: { user } }) => Boolean(user)
