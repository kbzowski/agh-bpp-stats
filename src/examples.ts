/* eslint-disable unused-imports/no-unused-imports */
import log from 'loglevel';

import {
  buildPubsAuthorsMatrix,
  distinctPublications,
  filterByDiscipline,
  filterByPosition,
  filterBySkos,
  mergeAuthorsWithShares,
} from './algorithms';
import {
  getAllAuthors,
  getAuthorsDetails,
  getAuthorsPublications,
  getDisciplineShares,
  getDisciplinesShares,
} from './bpp';
import { findDepartmentByName } from './departments';
import { Discipline } from './discipline';
import { loadJson, saveJson, saveMatrixCsv } from './io';
import { Position } from './positions';
import { simpleResolver } from './resolvers';
import {
  AuthorBase,
  AuthorDetails,
  AuthorsPublications,
  AuthorsShares,
  PublicationEntry,
} from './types';

export async function main() {
  log.setLevel('debug');

  // Pobierz wszystkich pracowników wydziału
  {
    const dep = findDepartmentByName(
      'Wydział Inżynierii Metali i Informatyki Przemysłowej',
    );
    const authors = await getAllAuthors({ wydzial: dep, rok_od: 2019 });
    saveJson(authors, 'authors.json');
  }

  // Pobierz dane szczegolowe pracownikow
  {
    const authors = loadJson<AuthorBase[]>('agh_authors.json');
    const authorsDetails = await getAuthorsDetails(authors, 3000);
    saveJson(authorsDetails, 'agh_authors_details.json');
  }

  // Pobierz publikacje pracownikow
  {
    let authorsDetails = loadJson<AuthorDetails[]>('authors_details.json');
    authorsDetails = filterBySkos(authorsDetails);
    const pubsByAuthors: AuthorsPublications[] = await getAuthorsPublications(
      authorsDetails,
      { from: 2019 },
    );
    saveJson(pubsByAuthors, 'authors_pubs.json');
  }

  // Wczytaj publikacje
  {
    const pubsByAuthors = loadJson<AuthorsPublications[]>('authors_pubs.json');
    const pubs = distinctPublications(pubsByAuthors);
    saveJson(pubs, 'pubs.json');
  }

  // Zbuduj macierz pracownik-publikacja
  {
    const pubsByAuthors = loadJson<AuthorsPublications[]>('authors_pubs.json');
    const pubs = loadJson<Set<PublicationEntry>>('pubs.json');
    const authorsDetails = loadJson<AuthorDetails[]>('authors_details.json');
    const data = await buildPubsAuthorsMatrix(
      authorsDetails,
      pubsByAuthors,
      simpleResolver,
    );

    const authorsIds = authorsDetails.map((a) => a.id);
    const papersIds = [...pubs].map((p) => p.id);
    saveMatrixCsv(data, 'association.csv', authorsIds, papersIds);
  }

  // Pobierz procentowy udzial dyscyplin dla autorow
  {
    let authorsDetails = loadJson<AuthorDetails[]>('agh_authors_details.json');
    authorsDetails = await getDisciplinesShares(authorsDetails);
    saveJson(authorsDetails, 'agh_authors_details_with_shares.json');
  }
}

void main();
