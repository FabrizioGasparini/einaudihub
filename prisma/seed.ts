import { prisma } from '../lib/prisma'
import { RoleName } from '@prisma/client'

// const prisma = new PrismaClient() // Removed this line

async function main() {
  console.log('Seeding categories...')
  const categories = ['Generale', 'Scuola', 'Eventi', 'Domande', 'Oggetti Smarriti', 'Progetti'];
  for (const name of categories) {
    const slug = name.toLowerCase().replace(/ /g, '-');
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
  }

  console.log('Seeding classes and users...')

  // Classes
  const class1A = await prisma.class.upsert({
    where: { year_section: { year: 1, section: "A" } },
    update: {},
    create: { year: 1, section: "A" }
  })
  
  const class5C = await prisma.class.upsert({
    where: { year_section: { year: 5, section: "C" } },
    update: {},
    create: { year: 5, section: "C" }
  })

  // Users
  
  // 1. Student
  try {
    const s = await prisma.user.upsert({
      where: { email: 'student@test.com' },
      update: {},
      create: {
        email: 'student@test.com',
        name: 'Mario Rossi (Studente)',
        classId: class1A.id,
      }
    })
    // Add role separately to safe check
    const sRole = await prisma.userRole.findFirst({ where: { userId: s.id, role: RoleName.STUDENT }})
    if (!sRole) {
        await prisma.userRole.create({ data: { userId: s.id, role: RoleName.STUDENT } })
    }
  } catch(e) { console.error("Error creating student", e) }

  // 2. Class Rep
  try {
    const r = await prisma.user.upsert({
        where: { email: 'rep@test.com' },
        update: {},
        create: {
        email: 'rep@test.com',
        name: 'Luigi Verdi (Rappresentante)',
        classId: class1A.id,
        }
    })
    const rRole1 = await prisma.userRole.findFirst({ where: { userId: r.id, role: RoleName.CLASS_REP }})
    if (!rRole1) {
        await prisma.userRole.create({ data: { userId: r.id, role: RoleName.CLASS_REP, classId: class1A.id } })
        await prisma.userRole.create({ data: { userId: r.id, role: RoleName.STUDENT } })
    }
  } catch(e) { console.error("Error creating rep", e) }


  // 3. School Rep
  try {
    const sr = await prisma.user.upsert({
        where: { email: 'schoolrep@test.com' },
        update: {},
        create: {
        email: 'schoolrep@test.com',
        name: 'Anna Bianchi (Rappresentante Istituto)',
        classId: class5C.id,
        }
    })
    const srRole = await prisma.userRole.findFirst({ where: { userId: sr.id, role: RoleName.SCHOOL_REP }})
    if (!srRole) {
        await prisma.userRole.create({ data: { userId: sr.id, role: RoleName.SCHOOL_REP, schoolWide: true } })
        await prisma.userRole.create({ data: { userId: sr.id, role: RoleName.STUDENT } })
    }
  } catch(e) { console.error("Error creating school rep", e) }

  // 4. Admin
  try {
    const adm = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
        email: 'admin@test.com',
        name: 'Admin User',
        }
    })
    const admRole = await prisma.userRole.findFirst({ where: { userId: adm.id, role: RoleName.ADMIN }})
    if (!admRole) {
        await prisma.userRole.create({ data: { userId: adm.id, role: RoleName.ADMIN, schoolWide: true } })
    }
  } catch(e) { console.error("Error creating admin", e) }
  
  console.log('Seeding finished.')
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

