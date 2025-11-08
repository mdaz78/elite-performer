import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up projects and associating courses...')

  // Get all users
  const users = await prisma.user.findMany()

  if (users.length === 0) {
    console.log('❌ No users found in the database.')
    return
  }

  for (const user of users) {
    console.log(`\n👤 Processing user: ${user.email || user.id}`)

    // Find or create "Study Project"
    let studyProject = await prisma.project.findFirst({
      where: {
        userId: user.id,
        name: 'Study Project',
      },
    })

    if (!studyProject) {
      studyProject = await prisma.project.create({
        data: {
          userId: user.id,
          name: 'Study Project',
          description: 'Project for all coding courses',
          status: 'active',
        },
      })
      console.log('✅ Created "Study Project"')
    } else {
      console.log('ℹ️  "Study Project" already exists')
    }

    // Find or create "Trading Project"
    let tradingProject = await prisma.project.findFirst({
      where: {
        userId: user.id,
        name: 'Trading Project',
      },
    })

    if (!tradingProject) {
      tradingProject = await prisma.project.create({
        data: {
          userId: user.id,
          name: 'Trading Project',
          description: 'Project for all trading courses',
          status: 'active',
        },
      })
      console.log('✅ Created "Trading Project"')
    } else {
      console.log('ℹ️  "Trading Project" already exists')
    }

    // Associate all coding courses with Study Project
    const codingCourses = await prisma.codingCourse.findMany({
      where: {
        userId: user.id,
        projectId: null,
      },
    })

    if (codingCourses.length > 0) {
      await prisma.codingCourse.updateMany({
        where: {
          userId: user.id,
          projectId: null,
        },
        data: {
          projectId: studyProject.id,
        },
      })
      console.log(`✅ Associated ${codingCourses.length} coding course(s) with "Study Project"`)
    } else {
      console.log('ℹ️  No coding courses to associate')
    }

    // Associate all trading courses with Trading Project
    const tradingCourses = await prisma.tradingCourse.findMany({
      where: {
        userId: user.id,
        projectId: null,
      },
    })

    if (tradingCourses.length > 0) {
      await prisma.tradingCourse.updateMany({
        where: {
          userId: user.id,
          projectId: null,
        },
        data: {
          projectId: tradingProject.id,
        },
      })
      console.log(`✅ Associated ${tradingCourses.length} trading course(s) with "Trading Project"`)
    } else {
      console.log('ℹ️  No trading courses to associate')
    }
  }

  console.log('\n✨ Setup complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
