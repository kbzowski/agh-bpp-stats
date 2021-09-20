import got from 'got';
import { stringify } from 'query-string';

import { alphabet } from './constants';
import {
  Author,
  AuthorDetails,
  AuthorPubsQuery,
  AuthorsList,
  AuthorsListQuery, Publication,
  PublicationDetails,
  Publications,
} from './types';

export const getAuthors = async ( letter: string, query: AuthorsListQuery): Promise<AuthorsList> => {
  const {rok_od, rok_do, wydzial} = query
  const queryStr = stringify({rok_od, rok_do, wydzial: wydzial.id_department})
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

export const getAuthorPublications = async (authorId: number, query?: AuthorPubsQuery): Promise<Publication[]> => {
  const queryStr = stringify(query)
  let skip = 0
  const allPubs: Publication[] = [];

  // eslint-disable-next-line no-constant-condition
  while(true) {
    const data = await got<Publications>(`https://bpp2020.agh.edu.pl/api/query/publications/?authorId=${authorId}&${queryStr}&skip=${skip}`).json<Publications>()
    if(data.data.length == 0) break;

    skip += 10;
    allPubs.push(...data.data);
  }

  return allPubs;
}

export const getPublicationDetails = async (id: number): Promise<PublicationDetails> => {
  const response = got<PublicationDetails>(`https://bpp2020.agh.edu.pl/api/query/publications/${id}`);
  return response.json<PublicationDetails>();
}
