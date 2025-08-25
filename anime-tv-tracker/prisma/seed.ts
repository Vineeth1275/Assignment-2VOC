import { PrismaClient, Role, ShowType, ShowStatus } from '../src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'password123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const shows = await prisma.$transaction([
    prisma.show.upsert({
      where: { id: 'seed-naruto' },
      update: {},
      create: {
        id: 'seed-naruto',
        title: 'Naruto',
        type: ShowType.ANIME,
        status: ShowStatus.COMPLETED,
        releaseYear: 2002,
        genres: { set: ['Action', 'Adventure'] },
        tags: { set: ['Ninja', 'Shounen'] },
        streamingLinks: {
          create: [{ platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/', region: 'Global' }],
        },
      },
    }),
    prisma.show.upsert({
      where: { id: 'seed-breaking-bad' },
      update: {},
      create: {
        id: 'seed-breaking-bad',
        title: 'Breaking Bad',
        type: ShowType.TV,
        status: ShowStatus.COMPLETED,
        releaseYear: 2008,
        genres: { set: ['Crime', 'Drama'] },
        tags: { set: ['Chemistry', 'Antihero'] },
        streamingLinks: {
          create: [{ platform: 'Netflix', url: 'https://www.netflix.com/', region: 'Global' }],
        },
      },
    }),
  ]);

  await prisma.watchlistEntry.upsert({
    where: { userId_showId: { userId: admin.id, showId: shows[0].id } },
    update: {},
    create: {
      userId: admin.id,
      showId: shows[0].id,
      status: 'WATCHING',
      episodesWatched: 1,
    },
  });

  console.log('Seeded admin and sample shows.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

