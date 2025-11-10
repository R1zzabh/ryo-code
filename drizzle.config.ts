import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  // url: process.env.POSTGRES_URL!,
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
})
