import 'data-forge-fs';

import { AuthorDetails, AuthorsPublications, PublicationEntry } from './types';
/**
 * Distinguishes non-repeating papers from source
 * @param {AuthorsPublications[]} source
 * @returns {Set<PublicationEntry>}
 */
export const distinctPublications = (
  source: AuthorsPublications[],
): Set<PublicationEntry> => {
  const pubs = new Set<PublicationEntry>();
  for (const item of source) {
    for (const pub of item.entries) {
      const authorsIds = pub.data.authors.map((a) => a.id_autor);
      pubs.add({ id: pub.id, title: pub.data.title, authorsIds });
    }
  }

  return pubs;
};

/**
 *
 * @param {AuthorDetails[]} authors
 * @param {Set<PublicationEntry>} publications
 * @param valueResolver Set value on at the intersection of author and publication
 */
export const pubsAuthorsAssociation = (
  authors: AuthorDetails[],
  publications: Set<PublicationEntry>,
  valueResolver: (
    publication: PublicationEntry,
    author: AuthorDetails,
  ) => number,
) => {
  const data = [];

  for (const pub of publications) {
    const item = authors.map((author) => {
      // true jesli autor jest autorem paperu, false - jesli nie
      const isAuthor = pub.authorsIds.some((pa) => pa === author.id); // pa - publication author
      if (isAuthor) return valueResolver(pub, author);
      return 0;
    });
    data.push(item);
  }

  return data;
};
