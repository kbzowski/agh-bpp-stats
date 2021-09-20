export interface Department {
  readonly department_name: string;
  readonly id_department:   number;
  readonly department_abbrev?:    string;
  readonly department_full_name?: string;
  readonly department_id?:        number;
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
  readonly data: Author[];
}

export interface Author {
  readonly count_affi:    number;
  readonly count_naffi:   number;
  readonly firstname:     string;
  readonly id_author:     number;
  readonly id_department: number;
  readonly id_unit:       number;
  readonly lastname:      string;
  readonly unit_abbrev:   string;

  readonly external?:  boolean;
  readonly id_autor?:  number;
}

export interface AuthorDetails {
  readonly data:        PersonalData;
  readonly disciplines: Discipline[];
  readonly id:          number;
  readonly stats:       Stat[];
  readonly years:       Years;
}

export interface PersonalData {
  readonly firstname:   string;
  readonly id_author:   number;
  readonly institution: Institution;
  readonly lastname:    string;
  readonly outer_dbs:   OuterDbs;
  readonly skos_link:   string;
  readonly stanowisko:  string;
  readonly tytulnauk:   string;
}

export interface Institution {
  readonly department: Department;
  readonly unit:       Unit;
}

export interface Unit {
  readonly unit_abbrev:    string;
  readonly unit_full_name: string;
  readonly unit_id:        number;
}

export interface OuterDbs {
  readonly id_inspire:       null;
  readonly id_opi_np:        number;
  readonly id_opi_pbn:       number;
  readonly id_opi_polon:     string;
  readonly id_orcid:         string;
  readonly id_research_gate: null;
  readonly id_researcherid:  string;
  readonly id_scopus:        string;
  readonly id_skos:          number;
}

export interface Discipline {
  readonly code:       number;
  readonly is_primary: boolean;
  readonly label:      string;
}

export interface Stat {
  readonly key:    string;
  readonly label:  string;
  readonly value:  number | string;
  readonly count?: number;
}

export interface Years {
  readonly max: number;
  readonly min: number;
}

export interface Publications {
  readonly count: number;
  readonly data:  Publication[];
}

export interface Publication {
  readonly afiliated_agh: boolean;
  readonly created_at:    string;
  readonly description:   string;
  readonly id_autor:      number;
  readonly id_jezyk:      number;
  readonly id_publ:       number;
  readonly id_rodzajpubl: number;
  readonly impactfactor:  number | null;
  readonly is_scopus:     boolean;
  readonly is_wos:        boolean;
  readonly pozzarok:      number;
  readonly recenzja:      boolean;
  readonly typ_label:     string;
}

export interface PublicationDetails {
  readonly data: PublicationData;
  readonly id:   number;
}

export interface PublicationData {
  readonly abstract:            string[];
  readonly authors:             Author[];
  readonly description:         string;
  readonly doi:                 string;
  readonly has_cover:           boolean;
  readonly id_publication:      number;
  readonly id_wos:              string;
  readonly indexing:            Indexing[];
  readonly jezykpubl:           string;
  readonly keywords:            Keyword[];
  readonly points:              Points;
  readonly publication_type:    string;
  readonly reviewed:            boolean;
  readonly scopus_indexing:     string;
  readonly title:               string;
  readonly tytulr:              null;
  readonly wos_indexing:        string;
  readonly year_of_publication: number;
}

export interface Indexing {
  readonly baza_ref:   string;
  readonly id_bazref:  number;
  readonly uid_bazref: string;
}

export interface Keyword {
  readonly id_keyword: number;
  readonly keyword:    string;
}

export interface Points {
  readonly wzor_p_c: number;
}

