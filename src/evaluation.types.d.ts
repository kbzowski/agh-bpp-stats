export interface Evaluation {
  _id: ID;
  authors: Author[];
  chosen_publications: any[];
  discipline: Discipline;
  limit: string;
  n_number: string;
  name: string;
  projectId: string;
  publications: Publication[];
  stats: Stats;
  used_per_author: UsedPerAuthor;
}

export interface ID {
  $oid: string;
}

export interface Author {
  employee_id: string;
  id_autor: number | null;
  limit: number | string;
  used_limit: number;
  name: string;
  overwritten_limit?: string;
}

export interface Discipline {
  code: string;
  label: string;
}

export interface Publication {
  id_autor: number;
  id_dyscypliny: number;
  id_key: string;
  id_publ: number;
  p: string;
  publisher_level: number | null;
  rk: number;
  rok_wydania: number;
  rola: number;
  typ: Typ;
  u: string;
}

export enum Typ {
  Article = 'article',
  Book = 'book',
  Chapter = 'chapter',
}

export interface Stats {
  points: number;
  slots: number;
}

// export interface UsedPerAuthor {}

export interface SelectedPapers {
  _id: { $oid: string };
  pc_info: { [key: string]: number };
  projectId: string;
  publications: { [key: string]: SelectedPublication };
  selected: number[];
}

export interface SelectedPublication {
  authors: number[];
  points?: number[];
}

export interface Limits {
  '1n': string;
  '2n': string;
  '3n': string;
  limit: string;
  limits: LimitElement[];
}

export interface LimitElement {
  limit: number | string;
  name: string;
  overLimit: boolean;
  sum: number;
}

export interface EvalLimits {
  limitTotal: number;
  limit1921mono: number;
  limitLevel2: number;
}
