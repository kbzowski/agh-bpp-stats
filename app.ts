/* eslint-disable unused-imports/no-unused-imports */
import log from 'loglevel';

import {
  buildPublicationStats,
  filterByDiscipline,
  filteroutPositions,
  syncPubsWithAuthors,
} from './src/algorithms';
import {
  getAllAuthors,
  getAuthorsDetails,
  getAuthorsPublications,
  getEvalPointsArray,
} from './src/bpp';
import { Discipline } from './src/discipline';
import { loadJson, saveArrayCsv, saveJson } from './src/io';
import { Position } from './src/positions';
import {
  AuthorDetails,
  AuthorPaperEval,
  AuthorsPublications,
} from './src/types';

/**
 * Tworzy baze pracownikow i publikacji oraz zapisuje je do pliku
 * @returns {Promise<void>}
 */
async function bootstrapDatabase() {
  const yearStart = 2017;

  let authors = [];
  authors = await getAllAuthors({ rok_od: yearStart });
  authors = await getAuthorsDetails(authors);
  saveJson(authors, 'agh_authors.json');

  const authorsPubs = await getAuthorsPublications(authors, {
    from: yearStart,
  });
  saveJson(authorsPubs, 'agh_pubs.json');

  const points = await getEvalPointsArray(authors, authorsPubs);
  saveJson(points, 'agh_points.json');
}

/**
 * Tworzy liste zawierajace punktacje dla ewaluacji dla kazdego pracownika ktory zadeklarowal dana dyscypline
 * @returns {Promise<void>}
 */
async function generateShameList() {
  const evalDiscipline = Discipline.INZYNIERIA_MATERIALOWA;

  let authors = loadJson<AuthorDetails[]>('agh_authors.json');
  authors = filterByDiscipline(authors, evalDiscipline, false, 0.0);
  authors = filteroutPositions(authors, [
    Position.EMERYT,
    Position.PRACOWNIK_INZYNIERYJNO_TECHNICZNY,
    Position.SPECJALISTA,
    Position.STAZYSTA,
  ]);

  let authorsPubs = loadJson<AuthorsPublications[]>('agh_pubs.json');
  authorsPubs = syncPubsWithAuthors(authorsPubs, authors);

  const points = loadJson<AuthorPaperEval[]>('agh_points.json');

  const stats = await buildPublicationStats(
    authors,
    authorsPubs,
    evalDiscipline,
    points,
  );

  saveArrayCsv(stats, 'IM_stats.csv');
}

export async function app() {
  log.setLevel('debug');

  await bootstrapDatabase();
  await generateShameList();

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
}

void app();
