import 'data-forge-fs';

import { DepartmentAbbreviation, findDepartmentByAbbrev } from './departments';
import { Discipline } from './discipline';
import { Position } from './positions';
import {
  AuthorDetails,
  AuthorsPublications,
  AuthorsShares,
  PublicationDetails,
  PublicationEntry,
} from './types';
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
 * Returns information about publication for particular author
 * @param {AuthorsPublications[]} pubs
 * @param {number} authorId
 * @param {number} pubId
 * @returns {PublicationDetails}
 */
const findPublicationDetails = (
  pubs: AuthorsPublications[],
  authorId: number,
  pubId: number,
) => {
  const authorPubs = pubs.find((a) => a.authorId === authorId);
  return authorPubs.entries.find((p) => p.id === pubId);
};

/**
 * Returns the author/publication connection matrix. The intersection contains the value returned by resolver.
 * @param {AuthorDetails[]} authors
 * @param {AuthorsPublications[]} authorsPubs
 * @param valueResolver Set value on at the intersection of author and publication
 * @returns {Array<Array<number>>}
 */
export const buildPubsAuthorsMatrix = async (
  authors: AuthorDetails[],
  authorsPubs: AuthorsPublications[],
  valueResolver: (
    publication: PublicationDetails,
    author: AuthorDetails,
  ) => number | Promise<number>,
): Promise<Array<Array<number | Promise<number>>>> => {
  const data = [];

  const publications = distinctPublications(authorsPubs);

  for (const pub of publications) {
    const row = [];
    for (const author of authors) {
      // true jesli autor jest autorem paperu, false - jesli nie
      const isAuthor = pub.authorsIds.some((pa) => pa === author.id); // pa - publication author

      if (isAuthor) {
        const pubInfo = findPublicationDetails(authorsPubs, author.id, pub.id);
        const data = await valueResolver(pubInfo, author);
        row.push(data);
      }
      row.push(0);
    }
    data.push(row);
  }

  return data;
};

/**
 * Returns authors evaluated in given discipline
 * @param {AuthorDetails[]} authors
 * @param {Discipline} discipline
 * @param {boolean} onlyPrimary - filter only if discipline is set as primary
 * @param {number} minShare
 * @returns {AuthorDetails[]}
 */
export const filterByDiscipline = (
  authors: AuthorDetails[],
  discipline: Discipline,
  onlyPrimary: boolean,
  minShare = 0,
): AuthorDetails[] => {
  return authors.filter((a) => {
    if (onlyPrimary)
      return a.disciplines.some(
        (d) => d.label == discipline && d.is_primary && d.share > minShare,
      );
    else
      return a.disciplines.some(
        (d) => d.label == discipline && d.share > minShare,
      );
  });
};

/**
 * Returns authors with a link to SKOS in their profile (allows to filter authors who no longer work at the university)
 * @param {AuthorDetails[]} authors
 * @returns {AuthorDetails[]}
 */
export const filterBySkos = (authors: AuthorDetails[]): AuthorDetails[] => {
  return authors.filter((a) => a.data.skos_link);
};

/**
 * Returns authors filtered by department (faculty)
 * @param {AuthorDetails[]} authors
 * @param {DepartmentAbbreviation} departmentAbbrev
 * @returns {AuthorDetails[]}
 */
export const filterByFaculty = (
  authors: AuthorDetails[],
  departmentAbbrev: DepartmentAbbreviation,
): AuthorDetails[] => {
  const department = findDepartmentByAbbrev(departmentAbbrev);
  return authors.filter(
    (a) =>
      a.data.institution.department.department_id == department.id_department,
  );
};

/**
 * Returns authors working on any of the following positions
 * @param {AuthorDetails[]} authors
 * @param {Position[]} positions
 * @returns {AuthorDetails[]}
 */
export const filterByPosition = (
  authors: AuthorDetails[],
  positions: Position[],
): AuthorDetails[] => {
  return authors.filter((a) =>
    positions.some((pos) => pos == a.data.stanowisko),
  );
};

/**
 * Merges authors with share ratios of evaluation disciplines
 * @param {AuthorDetails[]} authors
 * @param {AuthorsShares} shares
 */
export const mergeAuthorsWithShares = (
  authors: AuthorDetails[],
  shares: AuthorsShares,
) => {
  for (const author of authors) {
    const id = author.id;
    if (author.disciplines.length > 0)
      author.disciplines[0].share = shares[id][0];
    if (author.disciplines.length > 1)
      author.disciplines[1].share = shares[id][1];
  }
};
