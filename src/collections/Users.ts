import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'کاربر', plural: 'کاربران' },
  admin: { useAsTitle: 'email', group: 'سیستم', defaultColumns: ['name', 'email', 'role'] },
  auth: {
    tokenExpiration: 60 * 60 * 12,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isStaff,
    update: ({ req: { user } }) => {
      const u = user as { id?: string | number; role?: string } | null
      if (!u) return false
      if (u.role === 'admin') return true
      return { id: { equals: u.id } }
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // The very first account created becomes the administrator.
        if (operation === 'create') {
          const existing = await req.payload.count({ collection: 'users', overrideAccess: true })
          if (existing.totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', label: 'نام', type: 'text' },
    {
      name: 'role',
      label: 'نقش',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'مدیر', value: 'admin' },
        { label: 'ویراستار', value: 'editor' },
      ],
      access: {
        update: ({ req: { user } }) => (user as { role?: string } | null)?.role === 'admin',
      },
    },
  ],
}
