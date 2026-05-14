export const JOB_BOARD_DOMAINS: string[] = [
  // 🇺🇦 Українські платформи
  'djinni.co',
  'dou.ua',
  'work.ua',
  'robota.ua',
  'jooble.org',
  'grc.ua',
  'jobs.ua',
  'rabota.ua',

  // 🌍 Світові платформи
  'linkedin.com',
  'glassdoor.com',
  'indeed.com',
  'wellfound.com',
  'remoteok.com',
  'dice.com',
  'monster.com',
  'ziprecruiter.com',
  'simplyhired.com',
  'careerbuilder.com',
  'hired.com',
  'greenhouse.io',
  'lever.co',
  'workday.com',
  'smartrecruiters.com',
  'jobvite.com',

  // 💻 IT / Tech спеціалізовані
  'stackoverflow.com/jobs',
  'github.com/jobs',
  'techjobsforgood.com',
  'angel.co',
  'toptal.com',
  'upwork.com',
  'freelancer.com',

  // 🌐 Remote-орієнтовані
  'remote.co',
  'weworkremotely.com',
  'flexjobs.com',
  'remoteleaf.com',
  'justremote.co',
  'remotive.com',
];

export type ValidationsStatus =
  | 'verified'
  | 'experimental'
  | 'invalid'
  | 'idle';

export const getUrlsValidationStatus = (url: string): ValidationsStatus => {
  if (!url.trim()) return 'idle';

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase().replace('www.', '');
    const isVerified = JOB_BOARD_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    );

    return isVerified ? 'verified' : 'experimental';
  } catch (e) {
    return 'invalid';
  }
};
