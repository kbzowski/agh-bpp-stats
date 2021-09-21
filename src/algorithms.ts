import { AuthorsPublications, PublicationEntry } from './types';

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
