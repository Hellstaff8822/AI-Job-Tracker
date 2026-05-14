'use server';

import { prisma } from '../../lib/prisma';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

import { auth } from '@clerk/nextjs/server';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function parseAndSaveJob(url: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok)
      throw new Error(`Сайт відповів помилкою: ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    let metaLogo =
      $('meta[property="og:image"]').attr('content') ||
      $('link[rel="icon"]').attr('href') ||
      $('img[alt*="logo" i]').attr('src');
    $('script, style, noscript, iframe').remove();

    const pageTitle = $('title').text();
    let cleanText = `${pageTitle} ${$('body').text()}`
      .replace(/\s+/g, ' ')
      .trim();
    const finalContent = cleanText.substring(0, 12000);
    const responseAI = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `Ти — експерт з аналізу вакансій. Твоє завдання — знайти назву компанії, посаду та деталі. 
          Якщо в тексті є назва компанії (часто на початку або в заголовку), обов'язково витягни її.
          Поверни JSON: { company, position, technologies (array), salary, workFormat, contactInfo, description, logoUrl }.
          Якщо logoUrl не знайдено в тексті, використовуй це значення: ${metaLogo || 'null'}`,
        },
        {
          role: 'user',
          content: `Проаналізуй вакансію: ${finalContent}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });
    const content = responseAI.choices[0]?.message?.content;
    if (!content) throw new Error('Порожня відповідь');
    const parsedData = JSON.parse(content);
    const newJob = await prisma.job.create({
      data: {
        userId,
        company:
          parsedData.company ||
          pageTitle.split('|')[0].trim() ||
          'Невідома компанія',
        position: parsedData.position || 'Frontend Developer',
        technologies: Array.isArray(parsedData.technologies)
          ? parsedData.technologies
          : [],
        salary: parsedData.salary,
        workFormat: parsedData.workFormat,
        contactInfo: parsedData.contactInfo,
        description: parsedData.description,
        logoUrl: parsedData.logoUrl || metaLogo,
        url: url,
        status: 'Backlog',
      },
    });
    return newJob;
  } catch (error: any) {
    throw new Error(`Помилка: ${error.message}`);
  }
}

export async function getJobsAction() {
  const { userId } = await auth();

  if (!userId) throw new Error('Ви не авторизовані!');

  try {
    const jobs = await prisma.job.findMany({
      where: { userId },
      include: { notes: true },
      orderBy: { createdAt: 'desc' },
    });
    return jobs;
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    throw new Error(`Помилка: ${error.message}`);
  }
}

export async function deleteJobAction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  try {
    await prisma.job.deleteMany({
      where: { id, userId },
    });
    return { success: true };
  } catch (error: any) {
    throw new Error(`Помилка видалення: ${error.message}`);
  }
}
export async function addNoteAction(jobId: string, text: string) {
  try {
    const note = await prisma.note.create({
      data: {
        text,
        jobId,
      },
    });
    return note;
  } catch (error: any) {
    console.error('❌ Add Note Error:', error.message);
    throw new Error('Не вдалося додати нотатку');
  }
}
export async function deleteNoteAction(noteId: string) {
  try {
    await prisma.note.delete({
      where: { id: noteId },
    });
    return { success: true };
  } catch (error: any) {
    console.error('❌ Delete Note Error:', error.message);
    throw new Error('Не вдалося видалити нотатку');
  }
}

export async function generateAIInsightsAction(jobId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  try {
    const job = await prisma.job.findUnique({
       where: { id: jobId, userId },
    });
    if (!job || !job.description) throw new Error('Опис вакансії порожній');
    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content:
            'Ти — професійний IT-рекрутер. Твоє завдання: проаналізувати вакансію і надати короткий план підготовки: 5 питань для інтерв’ю, Elevator Pitch та ключові поради. Відповідь давай українською мовою у форматі Markdown.',
        },
        {
          role: 'user',
          content: `Проаналізуй цю вакансію: Позиція: ${job.position}, Компанія: ${job.company}, Опис: ${job.description}`,
        },
      ],
    });
    const insights = completion.choices[0].message.content;
    await prisma.job.update({
      where: { id: jobId, userId },
      data: { aiInsights: insights },
    });
    return insights;
  } catch (error: any) {
    console.error('❌ AI Error:', error.message);
    throw new Error('Не вдалося згенерувати поради');
  }
}
