import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

export const CMS_CACHE_TAG = 'cms'

/**
 * Any content change purges the cached CMS reads so editors see their edits right away.
 * Wrapped in try/catch because the same hooks also run from CLI scripts (seed, migrations)
 * where Next.js' cache is not available.
 */
const purge = () => {
  try {
    revalidateTag(CMS_CACHE_TAG, { expire: 0 })
  } catch {
    // not running inside Next.js: nothing to purge
  }
}

export const revalidateCollectionChange: CollectionAfterChangeHook = ({ doc }) => {
  purge()
  return doc
}

export const revalidateCollectionDelete: CollectionAfterDeleteHook = ({ doc }) => {
  purge()
  return doc
}

export const revalidateGlobalChange: GlobalAfterChangeHook = ({ doc }) => {
  purge()
  return doc
}
