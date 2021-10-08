export interface Department {
  readonly department_name: string;
  readonly id_department: number;
  readonly department_abbrev?: string;
  readonly department_full_name?: string;
  readonly department_id?: number;
}

export interface AuthorsListQuery {
  rok_od?: number;
  rok_do?: number;
  wydzial?: Department;
}

export interface AuthorPubsQuery {
  from?: number;
  to?: number;
  wos?: number;
  iflf?: number;
  scopus?: number;
}

export interface AuthorsList {
  readonly data: AuthorBase[];
}

export interface AuthorBase {
  readonly count_affi: number;
  readonly count_naffi: number;
  readonly firstname: string;
  readonly id_author: number;
  readonly id_department: number;
  readonly id_unit: number;
  readonly lastname: string;
  readonly unit_abbrev: string;
}

export interface AuthorDetails {
  readonly data: PersonalData;
  readonly disciplines: Discipline[];
  readonly id: number;
  readonly stats: Stat[];
  readonly years: Years;
}

export interface PersonalData {
  readonly firstname: string;
  readonly id_author: number;
  readonly institution: Institution;
  readonly lastname: string;
  readonly outer_dbs: OuterDbs;
  readonly skos_link: string;
  readonly stanowisko: string;
  readonly tytulnauk: string;
  skos_group?: string;
}

export interface Institution {
  readonly department: Department;
  readonly unit: Unit;
}

export interface Unit {
  readonly unit_abbrev: string;
  readonly unit_full_name: string;
  readonly unit_id: number;
}

export interface OuterDbs {
  readonly id_inspire: null;
  readonly id_opi_np: number;
  readonly id_opi_pbn: number;
  readonly id_opi_polon: string;
  readonly id_orcid: string;
  readonly id_research_gate: null;
  readonly id_researcherid: string;
  readonly id_scopus: string;
  readonly id_skos: number;
}

export interface Discipline {
  readonly code: number;
  readonly is_primary: boolean;
  readonly label: string;
  share?: number;
}

export interface Stat {
  readonly key: string;
  readonly label: string;
  readonly value: number | string;
  readonly count?: number;
}

export interface Years {
  readonly max: number;
  readonly min: number;
}

export interface PublicationsList {
  readonly count: number;
  readonly data: PublicationDataBasic[];
}

export interface PublicationDataBasic {
  readonly afiliated_agh: boolean;
  readonly created_at: string;
  readonly description: string;
  readonly id_autor: number;
  readonly id_jezyk: number;
  readonly id_publ: number;
  readonly id_rodzajpubl: number;
  readonly impactfactor: number | null;
  readonly is_scopus: boolean;
  readonly is_wos: boolean;
  readonly pozzarok: number;
  readonly recenzja: boolean;
  readonly typ_label: string;
}

export interface PublicationDetails {
  readonly data: PublicationDetailsData;
  readonly id: number;
}

export interface PublicationAuthor {
  readonly external: boolean;
  readonly firstname: string;
  readonly id_autor: number;
  readonly lastname: string;
}

export interface PublicationDetailsData {
  readonly abstract: string[];
  readonly authors: PublicationAuthor[];
  readonly description: string;
  readonly doi: string;
  readonly has_cover: boolean;
  readonly id_publication: number;
  readonly id_wos: string;
  readonly indexing: Indexing[];
  readonly jezykpubl: string;
  readonly keywords: Keyword[];
  readonly points: Points;
  readonly publication_type: string;
  readonly reviewed: boolean;
  readonly scopus_indexing: string;
  readonly title: string;
  readonly tytulr: string | null;
  readonly wos_indexing: string;
  readonly year_of_publication: number;
}

export interface Indexing {
  readonly baza_ref: string;
  readonly id_bazref: number;
  readonly uid_bazref: string;
}

export interface Keyword {
  readonly id_keyword: number;
  readonly keyword: string;
}

export interface Points {
  readonly wzor_p_c: number;
}

export interface EvalPoints {
  readonly id_autor: number;
  readonly id_dyscypliny: number;
  readonly id_publ: number;
  readonly id_typpubl: number;
  readonly nazwa_dyscypliny: string;
  readonly rok_wydania: number;
  readonly rola: number;
  readonly sloty_p_u_: number; // punktacja za slot
  readonly sloty_u_: number; // udział w slocie
  readonly typ: string;
  readonly wzor_k_: number;
  readonly wzor_m: number;
  readonly wzor_p: number;
  readonly wzor_p_c: number; // punktacja całkowita
}

interface AuthorsPublications {
  authorId: number;
  entries: PublicationDetails[];
}

export interface PublicationEntry {
  id: number;
  title: string;
  authorsIds: number[];
}

export type AuthorsShares = {
  [number]: [number, number];
};

export type AuthorPaperEval = {
  paperId: number;
  authorId: number;
  points: EvalPoints;
};
