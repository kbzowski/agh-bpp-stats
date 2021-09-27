/* eslint-disable unused-imports/no-unused-imports */
import log from 'loglevel';

import {
  distinctPublications,
  filterByDiscipline,
  filterByPosition,
  filterBySkos,
  mergeAuthorsWithShares,
  pubsAuthorsAssociation,
} from './algorithms';
import {
  getAllAuthors,
  getAuthorsDetails,
  getAuthorsPublications,
  getDisciplineShares,
  getDisciplinesSharesForAuthors,
} from './bpp';
import { findDepartmentByName } from './departments';
import { Discipline } from './discipline';
import { loadJson, saveCsv, saveJson } from './io';
import { Position } from './positions';
import { simpleResolve } from './resolvers';
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
    const pubs = loadJson<Set<PublicationEntry>>('pubs.json');
    const authorsDetails = loadJson<AuthorDetails[]>('authors_details.json');
    const data = pubsAuthorsAssociation(authorsDetails, pubs, simpleResolve);

    const authorsIds = authorsDetails.map((a) => a.id);
    const papersIds = [...pubs].map((p) => p.id);
    saveCsv(data, 'association.csv', authorsIds, papersIds);
  }

  // Pobierz procentowy udzial dyscyplin
  {
    const authorsDetails = loadJson<AuthorDetails[]>(
      'agh_authors_details.json',
    );

    const shares: AuthorsShares = await getDisciplinesSharesForAuthors(
      authorsDetails,
    );
    saveJson(shares, 'agh_authors_shares.json');
  }

  // Polacz udzialy w dyscyplinach z info o autorach
  {
    const authorsDetails = loadJson<AuthorDetails[]>(
      'agh_authors_details.json',
    );
    const shares: AuthorsShares = loadJson<AuthorsShares>(
      'agh_authors_shares.json',
    );

    mergeAuthorsWithShares(authorsDetails, shares);
    saveJson(authorsDetails, 'agh_authors_details_with_shares.json');
  }
}

void main();
