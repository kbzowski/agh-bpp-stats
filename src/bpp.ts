import got from 'got';
import log from 'loglevel';
import * as pluralize from 'pluralize';
import { stringify } from 'query-string';

import { alphabet } from './constants';
import { authorId, authorPersonals, delay } from './helpers';
import {
  Author,
  AuthorDetails,
  AuthorPubsQuery,
  AuthorsList,
  AuthorsListQuery, AuthorsPublications,
  EmployeePublications,
  EvalPoints,
  PublicationDetails,
  PublicationsList,
} from './types';

export const getAuthors = async ( letter: string, query: AuthorsListQuery): Promise<AuthorsList> => {
  const {rok_od, rok_do, wydzial} = query
  const queryStr = stringify({rok_od, rok_do, wydzial: wydzial.id_department})

  log.debug(`Fetching authors for letter: ${letter}`)

  return got(`https://bpp2020.agh.edu.pl/api/query/authors/letter/${letter}?${queryStr}`).json<AuthorsList>();
}

export const getAllAuthors = async (query: AuthorsListQuery): Promise<Author[]> => {
  const authors: Author[] = []
  for(const letter of alphabet) {
    const part = await getAuthors(letter, query)
    authors.push(...part.data)
  }

  return authors;
}

export const getAuthorDetails = async (id: number): Promise<AuthorDetails> => {
  const response = got(`https://bpp2020.agh.edu.pl/api/query/authors/${id}`);
  return response.json<AuthorDetails>();
}

export const getAuthorsDetails = async (authors: Author[] | number [], delayMs = 1000): Promise<AuthorDetails[]> => {
  const ids = []
  for(const author of authors){
    if(typeof author === 'number') ids.push(author)
    else if("id_author" in author) ids.push(author.id_author)
  }

  const authorsDetails: AuthorDetails[] = [];
  for(const id of ids){
    const details = await getAuthorDetails(id)
    log.debug(`Fetching details: ${details.data.firstname} ${details.data.lastname}`)

    authorsDetails.push(details)
    await delay(delayMs);
  }

  return authorsDetails;
}

export const getAuthorPublicationsIds = async (authorId: number, query?: AuthorPubsQuery): Promise<number[]> => {
  const queryStr = stringify(query)
  let skip = 0
  const allPubs: number[] = [];

  // eslint-disable-next-line no-constant-condition
  while(true) {
    const data = await got<PublicationsList>(`https://bpp2020.agh.edu.pl/api/query/publications/?authorId=${authorId}&${queryStr}&skip=${skip}`).json<PublicationsList>()
    if(data.data.length == 0) break;

    const ids = data.data.map(pub => pub.id_publ);
    allPubs.push(...ids);
    skip += 10;
  }
  return allPubs;
}


export const getAuthorsPublications = async (authors: Author[] | AuthorDetails[] | number[], query?: AuthorPubsQuery): Promise<AuthorsPublications[]> => {
  const authorsPubs = Array<AuthorsPublications>();
  for(const author of authors){
    const id = authorId(author);

    log.debug(`Fetching published papers: ${authorPersonals(author)}`)
    const ids = await getAuthorPublicationsIds(id, query);

    const pubs = await Promise.all(ids.map(async id => getPublicationDetails(id)))
    const count = pubs.length
    log.debug(`\tFound: ${count} ${pluralize('entry', count)}`)
    authorsPubs.push({authorId: id, entries: pubs})
  }

  return authorsPubs;
}

export const getPublicationDetails = async (id: number): Promise<PublicationDetails> => {
  const response = got(`https://bpp2020.agh.edu.pl/api/query/publications/${id}`);
  return response.json<PublicationDetails>();
}

export const getPoints = async (author: Author | AuthorDetails | number, pubId: number): Promise<EvalPoints> | null => {
  const aid = authorId(author);
  const response = got(`https://sloty-proxy.bpp.agh.edu.pl/autor/${aid}/publikacja/${pubId}`);
  const data = await response.json<EvalPoints[]>();
  if(data.length > 0)
    return data[0];
  else return null;
}
