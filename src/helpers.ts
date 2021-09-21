import { Author, AuthorDetails } from './types';

export const delay = (ms: number): Promise<any> => {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

export const filterBySkos = (arr: AuthorDetails[]): AuthorDetails[] => {
  return arr.filter(a => a.data.outer_dbs.id_skos);
}

export const authorPersonals = (author: Author | AuthorDetails| number): string => {
  if(typeof author === 'number' ) return String(author);
  if("firstname" in author) return `${author.firstname} ${author.lastname}`
  if("data" in author) return `${author.data.firstname} ${author.data.lastname}`

  throw new Error("Cannot identify author personalities");
}

export const authorId = (author: Author | AuthorDetails| number): number => {
  if(typeof author === 'number' ) return author;
  if("id_author" in author) return author.id_author;
  if("id" in author) return author.id;

  throw new Error("Cannot identify author id");
}


