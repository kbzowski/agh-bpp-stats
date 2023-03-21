/* eslint-disable unused-imports/no-unused-imports */
import log from 'loglevel';

import {
  buildPublicationStats,
  buildPubsAuthorsMatrix,
  distinctPublications,
  filterByDiscipline,
  filterBySkos,
  filteroutPositions,
  filterPublicationsByPublishedYear,
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
import { totalPtsDividedByAuthorsResolver } from './src/resolvers';
import {
  AuthorDetails,
  AuthorPaperEval,
  AuthorsPublications,
} from './src/types';

/**
 * Create database of Agh authors and their publications. Takes all AGH authors from BPP and their publications.
 * @param from - start year
 * @param to - end year
 * @returns {Promise<void>}
 */
async function bootstrapDatabase(from: number, to?: number) {
  let authors = [];
  authors = await getAllAuthors({ rok_od: from, rok_do: to });
  authors = await getAuthorsDetails(authors);
  saveJson(authors, 'agh_authors.json');

  const authorsPubs = await getAuthorsPublications(authors, {
    from,
    to,
  });
  saveJson(authorsPubs, 'agh_pubs.json');

  const points = await getEvalPointsArray(authors, authorsPubs);
  saveJson(points, 'agh_points.json');
}

/**
 * Creates a list containing scores for evaluations for each employee who has declared a particular discipline
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
    rok_od: 2022,
    rok_do: 2022,
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
  const authorsDetails = loadJson<AuthorDetails[]>('authors_details.json');
  // authorsDetails = filterBySkos(authorsDetails); // Doktorantow nie ma w SKOS
  let pubsByAuthors: AuthorsPublications[] = await getAuthorsPublications(
    authorsDetails,
    { from: 2022, to: 2022 },
  );
  saveJson(pubsByAuthors, 'authors_pubs.json');
};

const authorPubAssociation = async () => {
  // Create an author/publication matrix with evaluation scores at the intersection
  const authors = loadJson<AuthorDetails[]>('authors_details.json');
  const authorsPubs = loadJson<AuthorsPublications[]>('authors_pubs.json');

  const sortedAuthors = authors.sort((a, b) =>
    a.data.institution.unit.unit_abbrev.localeCompare(
      b.data.institution.unit.unit_abbrev,
    ),
  );

  const association = await buildPubsAuthorsMatrix(
    sortedAuthors,
    authorsPubs,
    totalPtsDividedByAuthorsResolver(40, 'WIMiIP', authors),
  );

  // Save the matrix to CSV
  const names = sortedAuthors.map((a) => printable(a));
  const deps = sortedAuthors.map((a) => a.data.institution.unit.unit_abbrev);
  const indexes = [...distinctPublications(authorsPubs)].map(
    (p) => `${p.title} (${p.id})`,
  );
  saveMatrixCsv(association, 'association.csv', [names, deps], indexes);
};

export async function authorsPubsPoints() {
  log.setLevel('debug');
  // await bootstrapDatabase(2022);

  // await fetchAuthors();
  // await fetchPubs();
  await authorPubAssociation();
}
