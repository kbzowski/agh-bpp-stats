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
 * @param filename
 */
export const pubsAuthorsAssociation = (
  authors: AuthorDetails[],
  publications: Set<PublicationEntry>,
) => {
  const data = [];

  for (const pub of publications) {
    const item = authors.map((author) => {
      // 1 jesli autor jest autorem paperu, 0 - jesli nie
      return pub.authorsIds.some((pa) => pa === author.id) ? 1 : 0; // pa - publication author
    });
    data.push(item);
  }

  return data;
};
