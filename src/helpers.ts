import { AuthorBase, AuthorDetails } from './types';

/**
 * Waits a set amount of time given in milliseconds. Used to counter systems that detect too many requests.
 * @param {number} ms
 * @returns {Promise<any>}
 */
export const delay = (ms: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Returns authors personals as string. Useful for debugging
 * @param {AuthorBase | AuthorDetails | number} author
 * @returns {string}
 */
export const printable = (
  author: AuthorBase | AuthorDetails | number,
): string => {
  if (typeof author === 'number') return String(author);
  if ('firstname' in author) return `${author.firstname} ${author.lastname}`;
  if ('data' in author)
    return `${author.data.firstname} ${author.data.lastname}`;

  throw new Error('Cannot identify author personalities');
};

/**
 * Returns a numeric author ID based on the passed argument.
 * @param {AuthorBase | AuthorDetails | number} author
 * @returns {number}
 */
export const authorId = (
  author: AuthorBase | AuthorDetails | number,
): number => {
  if (typeof author === 'number') return author;
  if ('id_author' in author) return author.id_author;
  if ('id' in author) return author.id;

  throw new Error('Cannot identify author id');
};
