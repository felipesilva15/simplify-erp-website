/**
 * Utilitários de normalização de nomes. O projeto adota o padrão:
 * pasta/rota/menu no plural (`states`), classe/model no singular (`State`).
 */

const IRREGULAR_PLURALS: Record<string, string> = {
  person: 'people',
  man: 'men',
  woman: 'women',
  child: 'children',
  foot: 'feet',
  tooth: 'teeth',
  goose: 'geese',
  mouse: 'mice',
};

/**
 * Pluraliza apenas para derivar nomes de pasta/rota. É deliberadamente
 * conservador: palavras já terminadas em `s` são consideradas plurais.
 * Sempre pode ser sobrescrito com a opção `--plural`.
 */
export function pluralize(value: string): string {
  const word = value.trim();

  if (!word) {
    return word;
  }

  const lower = word.toLowerCase();
  if (IRREGULAR_PLURALS[lower]) {
    return IRREGULAR_PLURALS[lower];
  }

  if (/s$/i.test(word) && !/ss$/i.test(word)) {
    return word;
  }

  if (/[^aeiou]y$/i.test(word)) {
    return `${word.slice(0, -1)}ies`;
  }

  if (/(s|x|z|ch|sh)$/i.test(word)) {
    return `${word}es`;
  }

  return `${word}s`;
}

/** Singulariza para derivar o nome da classe/model. Conservador e sobrescrevível. */
export function singularize(value: string): string {
  const word = value.trim();

  if (!word) {
    return word;
  }

  const lower = word.toLowerCase();
  const irregular = Object.entries(IRREGULAR_PLURALS).find(([, plural]) => plural === lower);
  if (irregular) {
    return irregular[0];
  }

  if (/ies$/i.test(word)) {
    return `${word.slice(0, -3)}y`;
  }

  if (/(ses|xes|zes|ches|shes)$/i.test(word)) {
    return word.slice(0, -2);
  }

  if (/s$/i.test(word) && !/ss$/i.test(word)) {
    return word.slice(0, -1);
  }

  return word;
}

/** `partner-type` → `PARTNER_TYPE`; `PartnerTypes` → `PARTNER_TYPES`. */
export function constantCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .replace(/_+/g, '_')
    .toUpperCase();
}

/** `partner-type` → `Partner type`; `ibge_code` → `Ibge code`. */
export function humanize(value: string): string {
  const words = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/);

  return words
    .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word.toLowerCase()))
    .join(' ');
}

/** `Partner type` → `partner type` (para títulos como "Listar estados"). */
export function decapitalize(value: string): string {
  return value.length ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}
