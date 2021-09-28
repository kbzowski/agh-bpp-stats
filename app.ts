/* eslint-disable unused-imports/no-unused-imports */
import log from 'loglevel';

import {
  buildPubsAuthorsMatrix,
  distinctPublications,
  filterByDiscipline,
  filterByFaculty,
  filterBySkos,
} from './src/algorithms';
import { getAuthorsPublications } from './src/bpp';
import { DepartmentAbbreviation } from './src/departments';
import { Discipline } from './src/discipline';
import { client } from './src/got-client';
import { printable } from './src/helpers';
import { loadJson, saveCsv, saveJson } from './src/io';
import { evalResolver, simpleResolver } from './src/resolvers';
import { AuthorDetails, AuthorsPublications } from './src/types';

export async function app() {
  log.setLevel('debug');

  let authors = loadJson<AuthorDetails[]>(
    'agh_authors_details_with_shares.json',
  );
  authors = filterBySkos(authors);
  authors = filterByFaculty(authors, DepartmentAbbreviation.WIMiIP);
  authors = filterByDiscipline(
    authors,
    Discipline.INFORMATYKA_TECHNICZNA_I_TELEKOMUNIKACJA,
    false,
  );

  // const authorsPubs = await getAuthorsPublications(authors, {
  //   from: 2017,
  // });
  // saveJson(authorsPubs, 'wimiip_it_pubs.json');
  const authorsPubs = loadJson<AuthorsPublications[]>('wimiip_it_pubs.json');

  const association = await buildPubsAuthorsMatrix(
    authors,
    authorsPubs,
    evalResolver(Discipline.INFORMATYKA_TECHNICZNA_I_TELEKOMUNIKACJA),
  );

  const headers = authors.map((a) => printable(a));
  const indexes = [...distinctPublications(authorsPubs)].map((p) => p.id);
  saveCsv(association, 'association.csv', headers, indexes);

  const x = 3;
}

void app();
