/* eslint-disable unused-imports/no-unused-imports */
import log from 'loglevel';

import { distinctPublications, pubsAuthorsAssociation } from './algorithms';
import {
  getAllAuthors,
  getAuthorsDetails,
  getAuthorsPublications,
} from './bpp';
import { findDepartmentByName } from './departments';
import { filterBySkos } from './helpers';
import { loadJson, saveCsv, saveJson } from './io';
import {
  AuthorBase,
  AuthorDetails,
  AuthorsPublications,
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
    const authors = loadJson<AuthorBase[]>('authors.json');
    const authorsDetails = await getAuthorsDetails(authors);
    saveJson(authorsDetails, 'authors_details.json');
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
    const pubs = loadJson('pubs.json') as Set<PublicationEntry>;
    const authorsDetails = loadJson<AuthorDetails[]>('authors_details.json');
    const data = pubsAuthorsAssociation(authorsDetails, pubs);

    const authorsIds = authorsDetails.map((a) => a.id);
    const papersIds = [...pubs].map((p) => p.id);
    saveCsv(data, 'association.csv', authorsIds, papersIds);
  }
}

void main();
