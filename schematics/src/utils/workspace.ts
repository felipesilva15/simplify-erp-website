export interface AngularJsonProject {
  sourceRoot?: string;
}

export interface AngularJson {
  projects?: Record<string, AngularJsonProject>;
}

/**
 * Lê a raiz do código-fonte a partir do `angular.json` (normalmente `src`).
 * Cai em `src` quando o arquivo não existe ou não define `sourceRoot`.
 */
export function readSourceRoot(readFile: (path: string) => string | null): string {
  const raw = readFile('/angular.json');

  if (!raw) {
    return 'src';
  }

  try {
    const config = JSON.parse(raw) as AngularJson;
    const roots = Object.values(config.projects ?? {})
      .map((project) => project.sourceRoot)
      .filter((root): root is string => typeof root === 'string' && root.length > 0);

    return roots[0] ?? 'src';
  } catch {
    return 'src';
  }
}
