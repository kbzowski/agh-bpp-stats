import log from 'loglevel';

import { getEvalPoints } from './bpp';
import { Discipline } from './discipline';
import { printable } from './helpers';
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
 * Returns total number of points per publication divided by number of authors
 * @param {boolean} aghOnly takes only authors from AGH
 * @returns {(pd: PublicationDetails, a: AuthorDetails) => number}
 */
export const totalPtsDividedByAuthorsResolver =
  (aghOnly: boolean) => (pd: PublicationDetails, a: AuthorDetails) => {
    let authorsNum = 0;
    if (aghOnly)
      authorsNum = pd.data.authors.reduce(
        (sum, author) => (!author.external ? sum + 1 : sum),
        0,
      );
    else authorsNum = pd.data.authors.length;

    if (pd.data.points) return pd.data.points.wzor_p_c / authorsNum;
    else return 0;
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
