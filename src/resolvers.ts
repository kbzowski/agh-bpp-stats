import log from 'loglevel';

import { getEvalPoints } from './bpp';
import { Discipline } from './discipline';
import { printable } from './helpers';
import { AuthorDetails, EvalPoints, PublicationDetails } from './types';

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
 * @returns {(pd: PublicationDetails, a: AuthorDetails) => number}
 */
export const totalPtsDividedByAuthorsResolver = async (
  pd: PublicationDetails,
  a: AuthorDetails,
) => {
  log.debug(`Evaluation of ${printable(a)}: ${pd.data.title}`);
  const evalPts: EvalPoints = await getEvalPoints(a, pd.id);

  // Dzielenie przez m - ilosc autorow z AGH
  let authorsNum = pd.data.authors.reduce(
    (sum, author) => (!author.external ? sum + 1 : sum),
    0,
  );

  // Max 10 autorow
  if (authorsNum > 10) authorsNum = 10;

  // Sprobuj wyliczyc z ewaluacji, a jesli nie ma danych z punktow ogolnych
  if (evalPts) return evalPts.wzor_p_c / authorsNum;
  if (pd.data.points) return pd.data.points.wzor_p_c / authorsNum;
  return 0;
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
