export const MASK_ALIASES: Record<string, string> = {
  PHONE_BR: '(00) 0000-0000||(00) 00000-0000',
  DOCUMENT: '000.000.000-00||AA.AAA.AAA/AAAA-AA||XXXXXXXXXXXXXXXXXXXX',
};

export const MASK_PATTERN: Record<string, { pattern: RegExp }> = {
  A: {
    pattern: /[a-zA-Z0-9]/
  }
};