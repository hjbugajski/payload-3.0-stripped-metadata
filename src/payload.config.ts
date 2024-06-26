import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    autoLogin: {
      email: 'demo@payloadcms.com',
      password: 'password',
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  onInit: async (payload) => {
    const users = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (users.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'demo@payloadcms.com',
          password: 'password',
        },
      })
    }
  },
  serverURL: 'http://localhost:3000',
})
