export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

/** Message namespaces merged by the request config. Each page owns exactly one namespace. */
export const namespaces = [
  'common',
  'home',
  'training',
  'history',
  'certificates',
  // Manager/admin space ("espace responsable"): one namespace per section.
  'adminCommon',
  'adminDashboard',
  'adminTrainings',
  'adminSessions',
  'adminUsers',
  'adminMails',
  'adminSettings',
  'adminCertificates',
] as const;
