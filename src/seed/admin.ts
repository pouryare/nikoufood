import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Creates the first administrator, or (ADMIN_RESET=1) sets a new password for an existing account.
 *   ADMIN_EMAIL=you@example.ir ADMIN_PASSWORD=... payload run src/seed/admin.ts
 * Used by the server installer (`nikou install`, `nikou reset-login`). Never prints the password.
 */
async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || ''
  if (!email || password.length < 8) {
    console.error('ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters are required.')
    process.exit(2)
  }
  const payload = await getPayload({ config })
  const found = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0 })
  if (found.docs[0]) {
    if (process.env.ADMIN_RESET !== '1') {
      payload.logger.info(`Admin ${email} already exists; nothing changed.`)
      process.exit(0)
    }
    await payload.update({ collection: 'users', id: found.docs[0].id, data: { password } })
    payload.logger.info(`New password set for ${email}.`)
    process.exit(0)
  }
  const users = await payload.count({ collection: 'users' })
  if (users.totalDocs > 0 && process.env.ADMIN_RESET !== '1') {
    payload.logger.info('An account already exists; the first-admin step was skipped. Use `nikou reset-login <email>` to set a password.')
    process.exit(0)
  }
  await payload.create({ collection: 'users', data: { email, password, name: 'مدیر', role: 'admin' } })
  payload.logger.info(`Admin account created: ${email}`)
  process.exit(0)
}

// Top-level await: `payload run` exits as soon as the module finishes loading.
try {
  await main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
