import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'

const EMAIL = 'demo@example.com'
const PASSWORD = 'password123'

async function main() {
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {},
    create: {
      email: EMAIL,
      name: 'Demo User',
      password: await bcrypt.hash(PASSWORD, 10),
    },
  })

  // Start from a clean slate so re-seeding doesn't pile up duplicates.
  await prisma.project.deleteMany({ where: { userId: user.id } })

  const lms = await prisma.project.create({
    data: {
      name: 'LMS Project',
      type: 'PROJECT',
      userId: user.id,
      sections: {
        create: [
          { title: 'Backend', position: 0 },
          { title: 'Frontend', position: 1 },
          { title: 'Testing', position: 2 },
        ],
      },
    },
    include: { sections: true },
  })

  const byTitle = Object.fromEntries(lms.sections.map((s) => [s.title, s.id]))

  // Todos carry both projectId and sectionId, so they're created after the
  // sections exist rather than nested inside them.
  await prisma.todo.createMany({
    data: [
      { text: 'Design the database schema', status: 'DONE', position: 0, projectId: lms.id, sectionId: byTitle.Backend },
      { text: 'Auth endpoints', status: 'PROGRESS', position: 1, projectId: lms.id, sectionId: byTitle.Backend },
      { text: 'Lesson player layout', position: 0, projectId: lms.id, sectionId: byTitle.Frontend },
    ],
  })

  await prisma.project.create({
    data: {
      name: 'Jewellery Website',
      type: 'SIMPLE',
      userId: user.id,
      todos: {
        create: [
          { text: 'Shoot the product photos', status: 'DONE', position: 0 },
          { text: 'Write the collection copy', position: 1 },
          { text: 'Set up the payment gateway', position: 2 },
        ],
      },
    },
  })

  console.log(`Seeded. Log in with ${EMAIL} / ${PASSWORD}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
