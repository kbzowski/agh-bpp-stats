import * as cheerio from 'cheerio';
import log from 'loglevel';
import pluralize from 'pluralize';
import { stringify } from 'query-string';

import { alphabet } from './constants';
import { client as got } from './got-client';
import { authorId, delay, findAuthor, printable } from './helpers';
import {
  AuthorBase,
  AuthorDetails,
  AuthorPaperEval,
  AuthorPubsQuery,
  AuthorsList,
  AuthorsListQuery,
  AuthorsPublications,
  EvalPoints,
  PublicationDetails,
  PublicationsList,
} from './types';

export const getAuthors = async (
  letter: string,
  query: AuthorsListQuery,
): Promise<AuthorsList> => {
  const { rok_od, rok_do, wydzial } = query;
  const queryStr = stringify({
    rok_od,
    rok_do,
    wydzial: wydzial?.id_department,
  });

  log.debug(`Fetching authors for letter: ${letter}`);

  return got(
    `https://bpp2020.agh.edu.pl/api/query/authors/letter/${letter}?${queryStr}`,
  ).json<AuthorsList>();
};

export const getAllAuthors = async (
  query: AuthorsListQuery,
): Promise<AuthorBase[]> => {
  const authors: AuthorBase[] = [];
  for (const letter of alphabet) {
    const part = await getAuthors(letter, query);
    authors.push(...part.data);
  }

  return authors;
};

export const getAuthorDetails = async (id: number): Promise<AuthorDetails> => {
  // BPP base data
  const response = got(`https://bpp2020.agh.edu.pl/api/query/authors/${id}`);
  const details = await response.json<AuthorDetails>();

  // Skos
  if (details.data.skos_link)
    details.data.skos_group = await getSkosGroup(details.data.skos_link);

  // Discipline shares ratio
  const shares = await getDisciplineShares(id);
  if (details.disciplines?.[0]) details.disciplines[0].share = shares[0];
  if (details.disciplines?.[1]) details.disciplines[1].share = shares[1];

  return details;
};

export const getAuthorsDetails = async (
  authors: AuthorBase[] | number[],
  delayMs = 1000,
): Promise<AuthorDetails[]> => {
  const ids = [];
  for (const author of authors) {
    if (typeof author === 'number') ids.push(author);
    else if ('id_author' in author) ids.push(author.id_author);
  }

  const authorsDetails: AuthorDetails[] = [];
  for (const id of ids) {
    const details = await getAuthorDetails(id);
    log.debug(
      `Fetching details: ${details.data.firstname} ${details.data.lastname}`,
    );

    authorsDetails.push(details);
    await delay(delayMs);
  }

  return authorsDetails;
};

export const getAuthorPublicationsIds = async (
  authorId: number,
  query?: AuthorPubsQuery,
): Promise<number[]> => {
  const queryStr = stringify(query);
  let skip = 0;
  const allPubs: number[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const data = await got<PublicationsList>(
        `https://bpp2020.agh.edu.pl/api/query/publications/?authorId=${authorId}&${queryStr}&skip=${skip}`,
      ).json<PublicationsList>();
      if (data.data.length == 0) break;

      const ids = data.data.map((pub) => pub.id_publ);
      allPubs.push(...ids);
      skip += 10;
    } catch (e) {
      log.error(e);
    }
  }
  return allPubs;
};

/**
 * Returns authors publication matching parameters query.
 * Note that query parameters take into account the date the publication was submitted to the library, not the date the publication was published!
 * @param {AuthorBase[] | AuthorDetails[] | number[]} authors
 * @param {AuthorPubsQuery} query
 * @returns {Promise<AuthorsPublications[]>}
 */
export const getAuthorsPublications = async (
  authors: AuthorBase[] | AuthorDetails[] | number[],
  query?: AuthorPubsQuery,
): Promise<AuthorsPublications[]> => {
  const authorsPubs = Array<AuthorsPublications>();
  for (const author of authors) {
    const id = authorId(author);

    log.debug(`Fetching published papers: ${printable(author)}`);
    const ids = await getAuthorPublicationsIds(id, query);

    const pubs = [];
    for (const id of ids) {
      const pub = await getPublicationDetails(id);
      if (!pub.data.points) {
        // if bpp2020 does not have points for the publication, try to get them from slot proxy
        const evalPoints = await getEvalPoints(author, id);
        if (evalPoints) pub.data.points = { wzor_p_c: evalPoints.wzor_p_c }; // assign points from bpp
      }
      pubs.push(pub);
    }

    const count = pubs.length;
    log.debug(`\tFound: ${count} ${pluralize('entry', count)}`);
    authorsPubs.push({ authorId: id, entries: pubs });

    await delay(1000);
  }

  return authorsPubs;
};

export const getPublicationDetails = async (
  id: number,
): Promise<PublicationDetails> => {
  try {
    const response = got(
      `https://bpp2020.agh.edu.pl/api/query/publications/${id}`,
    );
    return response.json<PublicationDetails>();
  } catch (error) {
    log.error(error);
    return null;
  }
};

export const getEvalPoints = async (
  author: AuthorBase | AuthorDetails | number,
  pubId: number,
): Promise<EvalPoints> | null => {
  const aid = authorId(author);
  const response = got(
    `https://sloty-proxy.bpp.agh.edu.pl/autor/${aid}/publikacja/${pubId}`,
  );
  const data = await response.json<EvalPoints[]>();
  if (data.length > 0) return data[0];
  else return null;
};

export const getEvalPointsArray = async (
  authors: AuthorDetails[],
  authorsPubs: AuthorsPublications[],
): Promise<AuthorPaperEval[]> => {
  const data: AuthorPaperEval[] = [];
  for (const author of authorsPubs) {
    const authorDetails = findAuthor(authors, author.authorId);
    log.debug(`Evaluating: ${printable(authorDetails)}`);

    for (const pub of author.entries) {
      data.push({
        paperId: pub.id,
        authorId: author.authorId,
        points: await getEvalPoints(author.authorId, pub.id),
      });
    }

    await delay(1000);
  }
  return data;
};

export const getIf = async (
  author: AuthorBase | AuthorDetails | number,
  pubId: number,
): Promise<number> => {
  const aid = authorId(author);
  const response = got(
    `https://bpp.agh.edu.pl/htmle.php?file=publikacja-pktm-iflf.html&id_publ=${pubId}&id_autor=${aid}&html=`,
  );
  const result = await response.text();
  const html = cheerio.load(result);

  // Parse Impact
  const impact = html('.ocena-iflf').text();
  const impactGroup = impact.match(/Impact Factor:.((\d*)(\.)*(\d+))/);

  if (impactGroup?.length > 0) return parseFloat(impactGroup[1]);
  else return 0.0;
};

export const getDisciplineShares = async (
  author: AuthorBase | AuthorDetails | number,
): Promise<[number, number]> => {
  const aid = authorId(author);
  const response = got(`https://bpp.agh.edu.pl/autor/${aid}`);
  const result = await response.text();
  const html = cheerio.load(result);

  const disc2Html = html("p[title='dyscyplina 2']")?.first()?.text();

  const shares: [number, number] = [1, 0];

  if (disc2Html) {
    const discGroup = disc2Html.match(/([0-9][0-9])%/);
    if (discGroup?.length > 0) {
      const percent = parseInt(discGroup[1]);
      shares[1] = percent / 100.0;
      shares[0] = 1 - percent / 100.0;
    }
  }

  return shares;
};

export const getSkosGroup = async (skosId: string): Promise<string> => {
  let result = '';
  try {
    const response = await got(`https://skos.agh.edu.pl/autor/${skosId}`);
    result = response.body;
  } catch (e) {
    return '';
  }

  const html = cheerio.load(result);

  let grp = '';
  html('table.info-osoba:first-of-type th').each(function (i, v) {
    const header = html(v).text().trim();
    if (header === 'Grupa' || header === 'Status') {
      grp = html(v.nextSibling).text().trim();
    }
  });

  return grp;
};
