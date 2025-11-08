import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking database columns...')

  try {
    // Try to query with scheduledDate to see if it exists
    const modules = await prisma.courseModule.findMany({
      take: 1,
      select: {
        id: true,
        scheduledDate: true,
      },
    })
    console.log('✅ CourseModule.scheduledDate column exists')
    console.log('Sample:', modules[0])
  } catch (error: any) {
    console.error('❌ Error querying CourseModule.scheduledDate:', error.message)
    if (error.message.includes('does not exist')) {
      console.log('⚠️  Column is missing. Need to add it manually.')
    }
  }

  try {
    const tradingModules = await prisma.tradingCourseModule.findMany({
      take: 1,
      select: {
        id: true,
        scheduledDate: true,
      },
    })
    console.log('✅ TradingCourseModule.scheduledDate column exists')
    console.log('Sample:', tradingModules[0])
  } catch (error: any) {
    console.error('❌ Error querying TradingCourseModule.scheduledDate:', error.message)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
