/* eslint-disable unused-imports/no-unused-imports */
import log from 'loglevel';

import {
  buildPublicationStats,
  buildPubsAuthorsMatrix,
  distinctPublications,
  filterByDiscipline,
  filterBySkos,
  filteroutPositions,
  syncPubsWithAuthors,
} from './src/algorithms';
import {
  getAllAuthors,
  getAuthorsDetails,
  getAuthorsPublications,
  getEvalPointsArray,
} from './src/bpp';
import { findDepartmentByName } from './src/departments';
import { Discipline } from './src/discipline';
import { printable } from './src/helpers';
import { loadJson, saveArrayCsv, saveJson, saveMatrixCsv } from './src/io';
import { Position } from './src/positions';
import { evalResolver, simpleResolver } from './src/resolvers';
import {
  AuthorBase,
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

const fetchAuthors = async () => {
  const dep = findDepartmentByName(
    'Wydział Inżynierii Metali i Informatyki Przemysłowej',
  );
  const authors = await getAllAuthors({
    wydzial: dep,
    rok_od: 2021,
    rok_do: 2021,
  });
  let authorsDetails = await getAuthorsDetails(authors, 3000);

  authorsDetails = filteroutPositions(authorsDetails, [
    Position.EMERYT,
    Position.PRACOWNIK_INZYNIERYJNO_TECHNICZNY,
    Position.SPECJALISTA,
    Position.STAZYSTA,
  ]);

  saveJson(authorsDetails, 'authors_details.json');
};

const fetchPubs = async () => {
  // Pobierz publikacje pracownikow
  let authorsDetails = loadJson<AuthorDetails[]>('authors_details.json');
  authorsDetails = filterBySkos(authorsDetails);
  const pubsByAuthors: AuthorsPublications[] = await getAuthorsPublications(
    authorsDetails,
    { from: 2019 },
  );
  saveJson(pubsByAuthors, 'authors_pubs.json');
};

const authorPubAssociation = async () => {
  // Stworz macierz autor/publikacja z punktami z ewaluacji na przecieciu
  const authors = loadJson<AuthorDetails[]>('authors_details.json');
  const authorsPubs = loadJson<AuthorsPublications[]>('authors_pubs.json');

  const association = await buildPubsAuthorsMatrix(
    authors,
    authorsPubs,
    simpleResolver,
  );

  // Zapisz macierz do CSV
  const headers = authors.map((a) => printable(a));
  const indexes = [...distinctPublications(authorsPubs)].map((p) => p.id);
  saveMatrixCsv(association, 'association.csv', headers, indexes);
};

export async function app() {
  log.setLevel('debug');

  // await fetchAuthors();
  // await fetchPubs();
  await authorPubAssociation();
}

void app();
