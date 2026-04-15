import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const schemes = await prisma.gradingScheme.findMany({
    include: { bands: true }
  })
  console.log(JSON.stringify(schemes, null, 2))
}
main()
