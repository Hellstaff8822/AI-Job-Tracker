import { PrismaClient } from '../generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Очищення бази даних...');
  await prisma.job.deleteMany();

  console.log('Створення тестової вакансії...');
  const mockJob = await prisma.job.create({
    data: {
      userId: 'user_dev_test_123',
      company: 'OpenAI',
      position: 'Senior Frontend Engineer',
      status: 'Backlog',
      technologies: [
        'React',
        'Next.js',
        'TypeScript',
        'Tailwind CSS',
        'GraphQL',
      ],
      salary: '$120k - $150k',
      workFormat: 'Remote / US',
      contactInfo: 'hr@openai.com | t.me/openai_hr',
      description:
        'Шукаємо крутого Senior Frontend Engineer для розробки AI-інтерфейсів майбутнього...',
      url: 'https://openai.com',
    },
  });

  console.log('✅ База даних успішно заповнена:', mockJob.company);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
