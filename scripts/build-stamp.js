const STOCKHOLM_TZ = 'Europe/Stockholm';

function formatNowStamp(prefix = '001') {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: STOCKHOLM_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(new Date());
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const stamp = `${lookup.year}${lookup.month}${lookup.day}${lookup.hour}${lookup.minute}`;
  return `${prefix || ''}${stamp}`;
}

function validateStamp(stamp) {
  if (typeof stamp !== 'string') {
    return false;
  }

  if (/^\d{12}$/.test(stamp)) {
    return true;
  }

  if (/^\d{3}\d{12}$/.test(stamp)) {
    return true;
  }

  return false;
}

function resolveStamp(rawArg) {
  let stampArg = rawArg;

  if (!stampArg || stampArg === 'auto') {
    const prefix = process.env.SQ_BUILD_PREFIX || '001';
    stampArg = formatNowStamp(prefix);
  }

  if (!validateStamp(stampArg)) {
    throw new Error('Build stamp must be 12 digits (YYYYMMDDHHMM) optionally prefixed with three digits.');
  }

  return stampArg;
}

module.exports = {
  STOCKHOLM_TZ,
  formatNowStamp,
  validateStamp,
  resolveStamp
};
