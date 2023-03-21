import log from 'loglevel';

import { getEvalPoints } from './bpp';
import { Discipline } from './discipline';
import { findAuthor, printable } from './helpers';
import { AuthorDetails, PublicationDetails } from './types';

/**
 * Returns 1 if author is contributor, 0 - otherwise
 * @param {PublicationDetails} pd
 * @param {AuthorDetails} a
 * @returns {number}
 */
export const simpleResolver = (pd: PublicationDetails, a: AuthorDetails) => {
  return 1;
};

/**
 * Returns total number of points per publication divided by number of authors from department
 * @param {number} minTotalPoints Returns 0 if total points is less than minTotalPoints
 * @param {string} limitTo Limit to authors from department_abbrev, takes only authors who are employees (i.e., not retired)
 * @param {AuthorDetails[]} authorsDetails Authors database context (needed to count number of authors)
 * @returns {(pd: PublicationDetails, a: AuthorDetails) => Promise<number | number>}
 */
export const totalPointsInDepartmentResolver =
  (minTotalPoints: number, limitTo: string, authorsDetails: AuthorDetails[]) =>
  async (pd: PublicationDetails, a: AuthorDetails) => {
    log.debug(`Evaluation of ${printable(a)}: ${pd.data.title}`);

    // If retired then return 0
    const ad = findAuthor(authorsDetails, a.id);
    if (ad.data.skos_group === 'Emeryt') return 0;

    // Dividing by m - number of authors from AGH or from a given department
    let authorsNum = pd.data.authors.reduce((sum, author) => {
      const ad = findAuthor(authorsDetails, author.id_autor);
      if (!ad) return sum; // if author is not in database - assume external or not from department
      if (author.external) return sum;
      const dep = ad.data.institution.department.department_abbrev;
      const isRetired = ad.data.skos_group === 'Emeryt';
      return dep === limitTo && !isRetired ? sum + 1 : sum;
    }, 0);

    // Max 10 authors
    if (authorsNum > 10) authorsNum = 10;

    if (pd.data.points == null) return 0;

    const total = pd.data.points.wzor_p_c;
    if (total < minTotalPoints) return 0;

    return pd.data.points.wzor_p_c / authorsNum;
  };

/**
 * Returns total number of points per publication divided by number of authors
 * @param {number} minTotalPoints Returns 0 if total points is less then minTotalPoints
 * @returns {(pd: PublicationDetails, a: AuthorDetails) => Promise<number | number>}
 */
export const totalPtsDividedByAuthorsResolver =
  (minTotalPoints: number) =>
  async (pd: PublicationDetails, a: AuthorDetails) => {
    log.debug(`Evaluation of ${printable(a)}: ${pd.data.title}`);

    // Dzielenie przez m - ilosc autorow z AGH
    let authorsNum = pd.data.authors.reduce(
      (sum, author) => (!author.external ? sum + 1 : sum),
      0,
    );

    // Max 10 autorow
    if (authorsNum > 10) authorsNum = 10;

    if (pd.data.points == null) return 0;

    const total = pd.data.points.wzor_p_c;
    if (total < minTotalPoints) return 0;

    return pd.data.points.wzor_p_c / authorsNum;
  };

/**
 * Returns resolver for slot scoring at given discipline
 * @returns {number}
 * @param discipline
 */
export const evalResolver =
  (discipline: Discipline) =>
  async (pd: PublicationDetails, a: AuthorDetails) => {
    try {
      log.debug(`Evaluation of ${printable(a)}: ${pd.data.title}`);
      const evalPts = await getEvalPoints(a, pd.id);
      if (evalPts?.nazwa_dyscypliny == discipline) return evalPts?.sloty_p_u_;
    } catch (e) {
      log.error(`Failed evaluation of ${printable(a)}: ${pd.data.title}`);
    }
    return 0.0;
  };
