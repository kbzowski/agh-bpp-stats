import log from 'loglevel';

import { getEvalPoints } from './bpp';
import { DepartmentAbbreviation, findDepartmentByAbbrev } from './departments';
import { Discipline } from './discipline';
import { findAuthor, findPublicationDetails, printable } from './helpers';
import { Position } from './positions';
import {
  AuthorDetails,
  AuthorPaperEval,
  AuthorsPublications,
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
      } else {
        row.push(0);
      }
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
 * Returns authors NOT working on any of the following positions
 * @param {AuthorDetails[]} authors
 * @param {Position[]} positions
 * @returns {AuthorDetails[]}
 */
export const filteroutPositions = (
  authors: AuthorDetails[],
  positions: Position[],
): AuthorDetails[] => {
  return authors.filter(
    (a) => !positions.some((pos) => pos == a.data.stanowisko),
  );
};

/**
 * Returns an array of author points relative to publications and the given discipline.
 * @param {AuthorDetails[]} authors
 * @param {AuthorsPublications[]} authorsPubs
 * @param {Discipline} discipline
 * @param {AuthorPaperEval[]} points
 * @returns {Promise<any[]>}
 */
export const buildPublicationStats = async (
  authors: AuthorDetails[],
  authorsPubs: AuthorsPublications[],
  discipline: Discipline,
  points?: AuthorPaperEval[],
) => {
  const data = [];

  const forceEval = !points;

  const getCachedPoints = (aid, pid) =>
    points.find((pt) => pt.paperId === pid && pt.authorId === aid)?.points;

  for (const author of authorsPubs) {
    const authorDetails = findAuthor(authors, author.authorId);

    if (forceEval) log.debug(`Evaluating: ${printable(authorDetails)}`);

    let slot = 0;
    let pt = 0;

    for (const pub of author.entries) {
      const evalPts = forceEval
        ? await getEvalPoints(author.authorId, pub.id)
        : getCachedPoints(author.authorId, pub.id);

      if (evalPts?.nazwa_dyscypliny == discipline) {
        slot += evalPts.sloty_u_;
        pt += evalPts.sloty_p_u_;
      }
    }

    const share = authorDetails.disciplines.find(
      (d) => d.label == discipline,
    )?.share;

    data.push({
      authorId: authorDetails.id,
      author: printable(authorDetails),
      slot,
      pt,
      share,
      faculty: authorDetails.data.institution.department.department_abbrev,
      group: authorDetails.data.skos_group,
    });
  }

  return data;
};

/**
 * Removes publications whose authors are not in the given list of authors
 * @param {AuthorDetails[]} authors
 * @param {AuthorsPublications[]} publications
 * @returns {AuthorsPublications[]}
 */
export const syncPubsWithAuthors = (
  publications: AuthorsPublications[],
  authors: AuthorDetails[],
): AuthorsPublications[] => {
  return publications.filter((pub) => {
    return authors.find((a) => a.id == pub.authorId);
  });
};

/**
 * Filters the list of publications by publication date (rather than library submission)
 * @param {number} from
 * @param {number} to
 * @param {AuthorsPublications[]} publications
 * @returns {AuthorsPublications[]}
 */
export const filterPublicationsByPublishedYear = (
  from: number,
  to: number,
  publications: AuthorsPublications[],
): AuthorsPublications[] => {
  return publications.map((author) => ({
    ...author,
    entries: author.entries.filter(
      (pub) =>
        pub.data.year_of_publication >= from &&
        pub.data.year_of_publication <= to,
    ),
  }));
};
