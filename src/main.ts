/* eslint-disable unused-imports/no-unused-imports */
import log from 'loglevel';

import { filterByDiscipline, filterBySkos } from './algorithms';
import { getAuthorsPublications } from './bpp';
import { Discipline } from './discipline';
import { loadJson, saveJson } from './io';
import { AuthorDetails, AuthorsPublications } from './types';

export async function main() {
  log.setLevel('debug');

  let authorsDetails = loadJson<AuthorDetails[]>(
    'agh_authors_details_with_shares.json',
  );
  authorsDetails = filterBySkos(authorsDetails);
  authorsDetails = filterByDiscipline(
    authorsDetails,
    Discipline.INFORMATYKA_TECHNICZNA_I_TELEKOMUNIKACJA,
    false,
  );
  const pubsByAuthors: AuthorsPublications[] = await getAuthorsPublications(
    authorsDetails,
    { from: 2019 },
  );
  saveJson(pubsByAuthors, 'authors_pubs.json');
}

void main();
