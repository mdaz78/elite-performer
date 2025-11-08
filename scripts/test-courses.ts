import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing course queries...')

  // Get first user
  const user = await prisma.user.findFirst()
  if (!user) {
    console.log('❌ No users found')
    return
  }

  console.log(`\n👤 User: ${user.email || user.id}`)

  // Test coding courses query
  try {
    const codingCourses = await prisma.codingCourse.findMany({
      where: { userId: user.id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    console.log(`\n✅ Found ${codingCourses.length} coding courses`)
    if (codingCourses.length > 0) {
      console.log(`   First course: ${codingCourses[0].name}`)
      console.log(`   Modules: ${codingCourses[0].modules.length}`)
    }
  } catch (error: any) {
    console.error('❌ Error querying coding courses:', error.message)
  }

  // Test trading courses query
  try {
    const tradingCourses = await prisma.tradingCourse.findMany({
      where: { userId: user.id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    console.log(`\n✅ Found ${tradingCourses.length} trading courses`)
    if (tradingCourses.length > 0) {
      console.log(`   First course: ${tradingCourses[0].name}`)
      console.log(`   Modules: ${tradingCourses[0].modules.length}`)
    }
  } catch (error: any) {
    console.error('❌ Error querying trading courses:', error.message)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
