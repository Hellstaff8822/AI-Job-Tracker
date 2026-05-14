import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  const jobs = await prisma.job.findMany()
  console.log(`✅ Connected. Found ${jobs.length} jobs.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
