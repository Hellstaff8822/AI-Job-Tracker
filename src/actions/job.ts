'use server';

import { prisma } from '../../lib/prisma';
import OpenAI from 'openai';
import { Job, StatusHistory } from '../../generated/prisma';
import * as cheerio from 'cheerio';

import { auth } from '@clerk/nextjs/server';
import { unstable_noStore as noStore } from 'next/cache';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function parseAndSaveJob(
  url: string,
  language: string = 'ua'
): Promise<
  | { success: true; job: Job }
  | { success: false; error: string }
> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: language === 'ua' ? 'Неавторизовано' : 'Unauthorized',
    };
  }

  try {
    const existingJob = await prisma.job.findFirst({
      where: { userId, url },
    });
    if (existingJob) {
      return {
        success: false,
        error:
          language === 'ua'
            ? 'Ви вже додали цю вакансію! 🧐'
            : 'You already added this vacancy! 🧐',
      };
    }

    let response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);

      return {
        success: false,
        error:
          language === 'ua'
            ? 'Не вдалося підключитися до сайту. Можливо, діє захист від парсингу.'
            : 'Could not connect to the site. Parsing protection might be active.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          language === 'ua'
            ? 'Не вдалося зчитати вакансію. Сайт заблокував доступ'
            : 'Could not read the vacancy. Access blocked by the site.',
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const metaLogo =
      $('meta[property="og:image"]').attr('content') ||
      $('link[rel="icon"]').attr('href') ||
      $('img[alt*="logo" i]').attr('src');
    $('script, style, noscript, iframe').remove();

    const pageTitle = $('title').text();
    const cleanText = `${pageTitle} ${$('body').text()}`
      .replace(/\s+/g, ' ')
      .trim();

    const finalContent = cleanText.substring(0, 12000);
    
    let responseAI;
    try {
      responseAI = await openai.chat.completions.create({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `
    You are a professional IT Recruiter. Your task is to analyze the page text and extract job vacancy data.
    
    JOB CRITERIA: The text must contain a job position title and a list of responsibilities or requirements.
    
    IF THE TEXT IS A JOB VACANCY:
    Return JSON with fields: isJob: true, company, position, salary, technologies (array), workFormat, description, logoUrl.
    
    IF THE TEXT IS NOT A JOB VACANCY (e.g., home page, article, NPM documentation, social profile):
    Return JSON: { "isJob": false }.
    
    IMPORTANT RULES:
    1. Return ONLY pure JSON.
    2. Provide 'company', 'position', 'salary', and 'workFormat' in ENGLISH.
    3. Keep the 'description' in its ORIGINAL language.
    4. Standardize 'workFormat' to one of: 'Remote', 'Office', 'Hybrid'.
    5. If salary is not specified, set it to 'Competitive'.
  `,
          },
          {
            role: 'user',
            content: `Page text: ${pageTitle}\n\n${finalContent}`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1500,
      });
    } catch (aiError) {
      console.error('AI Error:', aiError);
      return {
        success: false,
        error:
          language === 'ua'
            ? 'Помилка ШІ при аналізі вакансії. Спробуйте пізніше.'
            : 'AI error analyzing the vacancy. Please try again later.',
      };
    }

    const content = responseAI.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        error:
          language === 'ua'
            ? 'Не вдалося отримати відповідь від ШІ.'
            : 'Failed to get a response from the AI.',
      };
    }

    const parsedData = JSON.parse(content);

    if (parsedData.isJob === false) {
      return {
        success: false,
        error:
          language === 'ua'
            ? 'Це посилання не містить опису вакансії.'
            : 'This link does not contain a job description.',
      };
    }

    const newJob = await prisma.job.create({
      data: {
        userId,
        company:
          parsedData.company ||
          pageTitle.split('|')[0].trim() ||
          'Unknown company',
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
        
        history: {
          create: {
            status: 'Backlog',
          },
        },
      },
      include: {
        notes: true,
        history: true, 
      },
    });

    return { success: true, job: newJob };
  } catch (error: unknown) {
    console.error('❌ Parse and save job error:', error);
    return {
      success: false,
      error:
        language === 'ua'
          ? 'Сталася неочікувана помилка при обробці запиту.'
          : 'An unexpected error occurred while processing the request.',
    };
  }
}

export async function getJobsAction() {
  const { userId } = await auth();
  noStore();
  if (!userId) throw new Error('You are not authorized!');

  try {
    const jobs = await prisma.job.findMany({
      where: { userId },
      include: { notes: true, history: true },
      orderBy: { createdAt: 'desc' },
    });
    return jobs;
  } catch (error: unknown) {
    console.error('Error fetching jobs:', error);
    throw new Error(`Error fetching jobs: ${error instanceof Error ? error.message : String(error)}`);
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
  } catch (error: unknown) {
    throw new Error(`Error deleting job: ${error instanceof Error ? error.message : String(error)}`);
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
  } catch (error: unknown) {
    console.error('❌ Add Note Error:', error instanceof Error ? error.message : String(error));
    throw new Error('Error adding note');
  }
}
export async function deleteNoteAction(noteId: string) {
  try {
    await prisma.note.delete({
      where: { id: noteId },
    });
    return { success: true };
  } catch (error: unknown) {
    console.error('❌ Delete Note Error:', error instanceof Error ? error.message : String(error));
    throw new Error('Error deleting note');
  }
}

export async function generateAIInsightsAction(jobId: string, language: string = 'ua') {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId, userId },
    });
    if (!job || !job.description) throw new Error('Description is empty');
    
    const systemPrompt = language === 'ua'
      ? 'Ти — професійний IT-рекрутер. Твоє завдання: проаналізувати вакансію і надати короткий план підготовки: 5 питань для інтерв’ю, Elevator Pitch та ключові поради. Відповідь давай українською мовою у форматі Markdown.'
      : 'You are a professional IT recruiter. Your task is to analyze the vacancy and provide a short preparation plan: 5 interview questions, an Elevator Pitch, and key tips. Provide the response in English in Markdown format.';

    const userPrompt = language === 'ua'
      ? `Проаналізуй цю вакансію: Позиція: ${job.position}, Компанія: ${job.company}, Опис: ${job.description}`
      : `Analyze this vacancy: Position: ${job.position}, Company: ${job.company}, Description: ${job.description}`;

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash-lite',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });
    const insights = completion.choices[0].message.content;
    await prisma.job.update({
      where: { id: jobId, userId },
      data: { aiInsights: insights },
    });
    return insights;
  } catch (error: unknown) {
    console.error('❌ AI Error:', error instanceof Error ? error.message : String(error));
    const msg = language === 'ua' ? 'Помилка при генерації порад' : 'Error generating advice';
    throw new Error(msg);
  }
}



export async function updateJobStatusAction(
  jobId: string,
  status: string
): Promise<{
  success: boolean;
  job: Job;
  historyRecord: StatusHistory;
}> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedJob = await tx.job.update({
        where: { id: jobId, userId },
        data: { status },
      });
      // Зберігаємо створений запис історії змін статусу
      const historyRecord = await tx.statusHistory.create({
        data: {
          jobId,
          status,
        },
      });
      return { updatedJob, historyRecord };
    });
    // Повертаємо і оновлену вакансію, і новий запис історії для миттєвої синхронізації
    return { 
      success: true, 
      job: result.updatedJob, 
      historyRecord: result.historyRecord 
    };
  } catch (error: unknown) {
    console.error('❌ Update Status Error:', error instanceof Error ? error.message : String(error));
    throw new Error('Error updating status in database');
  }
}

