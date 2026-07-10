// Moderation Agent
// Screens usernames and community/report text for a kids' product. Conservative:
// blocks profanity, personal-info leakage (emails/phones), and impersonation of staff.

const PROFANITY = ['damn', 'hell', 'stupid', 'idiot', 'hate', 'kill'];
const STAFF = ['admin', 'moderator', 'brainbooster', 'staff', 'official'];
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE = /\b\d[\d\s-]{7,}\d\b/;

/**
 * @param {string} name
 * @returns {{ok:boolean, reasons:string[], suggestion?:string}}
 */
export function screenUsername(name) {
  const reasons = [];
  const lower = (name || '').toLowerCase();
  if (!name || name.trim().length < 2) reasons.push('too-short');
  if (name && name.length > 20) reasons.push('too-long');
  if (PROFANITY.some((w) => lower.includes(w))) reasons.push('profanity');
  if (STAFF.some((w) => lower.includes(w))) reasons.push('impersonation');
  if (EMAIL.test(name || '')) reasons.push('contains-email');
  const ok = reasons.length === 0;
  return ok ? { ok, reasons } : { ok, reasons, suggestion: `Player${Math.abs(hash(name || '')) % 1000}` };
}

/** Screen free text (reports, community messages) for unsafe content or PII. */
export function screenText(text) {
  const reasons = [];
  const lower = (text || '').toLowerCase();
  if (PROFANITY.some((w) => lower.includes(w))) reasons.push('profanity');
  if (EMAIL.test(text || '')) reasons.push('contains-email');
  if (PHONE.test(text || '')) reasons.push('contains-phone');
  return { ok: reasons.length === 0, reasons };
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
