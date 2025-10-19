import crypto from 'node:crypto';

export function hashAspiration({ function_area, short_term = '', long_term = '' }) {
  const key = [
    (function_area || '').trim().toLowerCase(),
    short_term.trim().toLowerCase(),
    long_term.trim().toLowerCase(),
  ].join('|');
  return crypto.createHash('md5').update(key).digest('hex');
}
