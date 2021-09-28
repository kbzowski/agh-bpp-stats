/* eslint-disable unused-imports/no-unused-imports */
import log from 'loglevel';

import {
  buildPublicationStats,
  buildPubsAuthorsMatrix,
  distinctPublications,
  filterByDiscipline,
  filterByFaculty,
  filterByPosition,
  filterBySkos,
  filteroutPositions,
  mergeAuthorsWithShares,
  syncPubsWithAuthors,
} from './src/algorithms';
import {
  getAllAuthors,
  getAuthorsDetails,
  getAuthorsPublications,
  getDisciplinesShares,
} from './src/bpp';
import {
  DepartmentAbbreviation,
  findDepartmentByAbbrev,
  findDepartmentByName,
} from './src/departments';
import { Discipline } from './src/discipline';
import { printable } from './src/helpers';
import { loadJson, saveArrayCsv, saveJson, saveMatrixCsv } from './src/io';
import { Position } from './src/positions';
import { evalResolver } from './src/resolvers';
import { AuthorDetails, AuthorsPublications, AuthorsShares } from './src/types';

export async function app() {
  log.setLevel('debug');

  const evalDiscipline = Discipline.INFORMATYKA_TECHNICZNA_I_TELEKOMUNIKACJA;
  const yearStart = 2017;

  let authors = [];
  // !! Ponizsze buduje baze autorow od poczatku
  // const dep = findDepartmentByAbbrev(DepartmentAbbreviation.WIMiIP);
  // authors = await getAllAuthors({ wydzial: dep, rok_od: yearStart });
  // authors = await getAuthorsDetails(authors);
  // //
  // authors = await getDisciplinesShares(authors);
  // authors = filterBySkos(authors);
  // authors = filterByDiscipline(authors, evalDiscipline, false);
  // authors = filteroutPositions(authors, [
  //   Position.EMERYT,
  //   Position.PRACOWNIK_INZYNIERYJNO_TECHNICZNY,
  //   Position.SPECJALISTA,
  //   Position.STAZYSTA,
  // ]);
  // saveJson(authors, 'wimiip_authors_details_with_shares.json');
  authors = loadJson<AuthorDetails[]>(
    'wimiip_authors_details_with_shares.json',
  );
  authors = filterByDiscipline(authors, evalDiscipline, false);

  // Ponizsze buduje baze publikacji i zapisuje do pliku do pozniejszego wczytania
  let authorsPubs = [];
  // authorsPubs = await getAuthorsPublications(authors, {
  //   from: yearStart,
  // });
  // saveJson(authorsPubs, 'wimiip_pubs.json');

  // Jesli dane zrodlowe byly zapisane wczesniej, mozna je otworzyc
  // Generalna zasada jest taka, ze publikacje musza pasowac do listy autorow
  // Wiec jesli bylo filtrowanie pracownikow (np. po pozycji lub dyscyplinie) - to nalezy usunac ich publikacje
  authorsPubs = loadJson<AuthorsPublications[]>('wimiip_pubs.json');
  authorsPubs = syncPubsWithAuthors(authorsPubs, authors);

  // // Stworz macierz autor/publikacja z punktami z ewaluacji na przecieciu
  // const association = await buildPubsAuthorsMatrix(
  //   authors,
  //   authorsPubs,
  //   evalResolver(evalDiscipline),
  // );

  // // Zapisz macierz do CSV
  // const headers = authors.map((a) => printable(a));
  // const indexes = [...distinctPublications(authorsPubs)].map((p) => p.id);
  // saveMatrixCsv(association, 'IM_association.csv', headers, indexes);

  // Generuje statystyki publikacji do ewaluacji
  const stats = await buildPublicationStats(
    authors,
    authorsPubs,
    evalDiscipline,
  );
  saveJson(stats, 'ITIT_stats.json');
  saveArrayCsv(stats, 'ITIT_stats.csv');
}

void app();
