import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Strip sslmode from URL and set ssl explicitly to avoid pg-connection-string
  // deprecation warning about sslmode='require' changing semantics in pg v9.
  const url = new URL(process.env.DATABASE_URL!)
  url.searchParams.delete("sslmode")
  const pool = new Pool({ connectionString: url.toString(), ssl: { rejectUnauthorized: true } })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
