import fs from 'fs';
import got from 'got-cjs';
import * as _ from 'lodash';

import {
  Author,
  EvalLimits,
  Evaluation,
  Limits,
  Publication,
  SelectedPapers,
} from './evaluation.types';
import { saveJson } from './io';

const context = {
  token: '',
};

const projectId = process.env['PROJECT_ID'];

const client = got.extend({
  hooks: {
    beforeRequest: [
      (options) => {
        if (!options.context || !options.context.token) {
          throw new Error('Token required');
        }

        // @ts-ignore
        options.headers['x-auth-token'] = options.context.token;
        options.headers['User-Agent'] =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0';
      },
    ],
  },
});

const login = async () => {
  const response = await got.post('https://bpp2020.agh.edu.pl/auth/login', {
    json: {
      password: process.env['PASSWORD'],
      username: process.env['USERNAME'],
    },
    responseType: 'json',
  });

  context.token = response.body['jwt'];
};

const fetch = async () => {
  const response = client.get(
    `https://bpp2020.agh.edu.pl/api/simulation/result/${projectId}`,
    {
      context,
    },
  );
  return response.json<Evaluation>();
};

const select = async (pubId: number, authors: Publication[]) => {
  const authorsId = authors.map((a) => a.id_autor);
  await client.post(
    `https://bpp2020.agh.edu.pl/api/simulation/result/${projectId}/manual/update/${pubId}`,
    {
      context,
      json: {
        authors: authorsId,
      },
      responseType: 'json',
    },
  );

  await client.post(
    `https://bpp2020.agh.edu.pl/api/simulation/result/${projectId}/manual/select/${pubId}`,
    {
      context,
    },
  );
};

const deselectAll = async () => {
  // Pobierz wszystkie wybrane do ewaluacji
  const response = await client
    .get(
      `https://bpp2020.agh.edu.pl/api/simulation/result/${projectId}/manual`,
      { context },
    )
    .json<SelectedPapers>();

  const selected = response.selected;

  // Usun z ewaluacji
  const total = selected.length;
  for (const [index, pubId] of selected.entries()) {
    console.log(`Usuwam z ewaluacji: ${pubId} (${index + 1}/${total})`);

    // Usun z listy
    await client.post(
      `https://bpp2020.agh.edu.pl/api/simulation/result/${projectId}/manual/deselect/${pubId}`,
      {
        context,
      },
    );

    // Odznacz autorów
    await client.post(
      `https://bpp2020.agh.edu.pl/api/simulation/result/${projectId}/manual/update/${pubId}`,
      {
        context,
        json: {
          authors: [],
        },
      },
    );
  }
};

const selectAll = async (chosen: Array<[number, Publication[]]>) => {
  const total = chosen.length;
  let index = 0;
  for (const [pubId, pub] of chosen) {
    console.log(`Dodaje do ewaluacji: ${pubId} (${index + 1}/${total})`);
    await select(pubId, pub);
    index++;
  }
};

const checkUserLimit = (authors: Author[], authorId: number, slot: number) => {
  const author = authors.find((author) => author.id_autor === authorId);

  author.used_limit = author.used_limit ?? 0;

  if (author.overwritten_limit) {
    if (author.used_limit + slot <= parseInt(author.overwritten_limit))
      return author;
    else return false;
  } else {
    if (author.used_limit + slot <= parseInt(author.limit as string))
      return author;
    else return false;
  }
};

const sumSlotsAndPoints = (chosen: Array<[number, Publication[]]>) => {
  let slotsAll = 0;
  let slots1921mono = 0;
  let slotsLevel2 = 0;
  let points = 0;

  for (const [pubId, pubDetails] of chosen) {
    for (const pub of pubDetails) {
      if (
        pub.typ === 'book' ||
        pub.typ === 'chapter' ||
        (pub.rok_wydania >= 2019 && pub.rok_wydania <= 2021)
      ) {
        slots1921mono += parseFloat(pub.u);
      }

      if (
        pub.typ != 'article' &&
        pub.publisher_level < 2 &&
        parseFloat(pub.p) < 200
      ) {
        slotsLevel2 += parseFloat(pub.u);
      }

      slotsAll += parseFloat(pub.u);
      points += parseFloat(pub.p);
    }
  }

  return { slotsAll, slots1921mono, slotsLevel2, points };
};

const groupByPaper = (papers: Publication[]) => {
  const map = new Map<number, Publication[]>();

  for (const pub of papers) {
    if (map.has(pub.id_publ)) {
      const item = map.get(pub.id_publ);
      item.push(pub);
    } else {
      map.set(pub.id_publ, [pub]);
    }
  }

  return Array.from(map);
};

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randTrue = (): boolean => {
  return getRandomIntInclusive(0, 1) ? false : true;
};

function chooseUdzial1(publications: Publication[], authors: Author[]) {
  const chosen = [];
  const u1 = publications
    .filter((p) => p.u === '1')
    .sort((a, b) => (parseFloat(a.u) < parseFloat(b.u) ? 1 : -1));

  for (const pub of u1) {
    const slot = parseFloat(pub.u);
    const author = checkUserLimit(authors, pub.id_autor, slot);
    if (author) {
      author.used_limit += slot;
      chosen.push([pub.id_publ, [pub]]);
    }
  }
  return chosen;
}

const optimize = async (data: Evaluation, limits: EvalLimits) => {
  let chosen = [];

  const best = [];

  let { publications, authors } = data;

  // Wybierz te z udzialem 1
  const u1 = chooseUdzial1(publications, authors);
  chosen = [...u1];

  // Usun publikacje dodane do chosen z u1
  const toRemove = new Set<Publication>(chosen.map((p) => p[1][0]));
  publications = publications.filter((p) => !toRemove.has(p));

  const groupedPubs = groupByPaper(publications);

  const res = sumSlotsAndPoints(chosen);
  let totalPoints = res.points;

  const authorsBackup = _.cloneDeep(authors);

  let i = 0n;
  while (true) {
    for (const [id, pub] of groupedPubs) {
      if (randTrue()) {
        const chosenPaperAuthors = [];
        for (const pubAuthor of pub) {
          if (randTrue()) {
            const user = checkUserLimit(
              authors,
              pubAuthor.id_autor,
              parseFloat(pubAuthor.u),
            );
            if (user) {
              user.used_limit += parseFloat(pubAuthor.u);
              chosenPaperAuthors.push(pubAuthor);
            }
          }
        }

        if (chosenPaperAuthors.length > 0)
          chosen.push([id, chosenPaperAuthors]);
      }
    }

    const newRes = sumSlotsAndPoints(chosen);
    if (
      newRes.points > totalPoints &&
      newRes.slots1921mono <= limits.limit1921mono &&
      newRes.slotsAll <= limits.limitTotal &&
      newRes.slotsLevel2 <= limits.limitLevel2
    ) {
      totalPoints = newRes.points;
      saveJson(chosen, 'best.json');
      console.log(
        `New best: ${totalPoints} at ${i}: ${JSON.stringify(newRes)}`,
      );

      // await deselectAll();
      // await selectAll(chosen);
    }

    chosen = [...u1];
    authors = _.cloneDeep(authorsBackup);

    i++;

    // if (i % 1000n == 0n) console.log(`Iteracja ${i}`);
  }

  return chosen;
};

async function getLimits(): Promise<EvalLimits> {
  const response = client.get(
    `https://bpp2020.agh.edu.pl/api/simulation/result/${projectId}/manual/limits`,
    {
      context,
    },
  );
  const data = await response.json<Limits>();

  return {
    limitTotal:
      typeof data.limits[0].limit === 'string'
        ? parseFloat(data.limits[0].limit)
        : data.limits[0].limit,
    limit1921mono:
      typeof data.limits[1].limit === 'string'
        ? parseFloat(data.limits[1].limit)
        : data.limits[1].limit,
    limitLevel2:
      typeof data.limits[2].limit === 'string'
        ? parseFloat(data.limits[2].limit)
        : data.limits[2].limit,
  };
}

async function update(): Promise<void> {
  const response = client.get(
    `https://bpp2020.agh.edu.pl/api/ewaluacja/reports/projects/${projectId}/update`,
    {
      context,
    },
  );
  await response.json<Limits>();
}

const selectFromOptimization = async (data: Evaluation) => {
  const best = fs.readFileSync('best.txt', 'utf8');
  const arr = best.split(',').map((v) => parseInt(v));

  const selectedPubs = data.publications.filter((value, i) => arr[i] === 1);

  const groupedPubs = groupByPaper(selectedPubs);

  const total = groupedPubs.length;
  let index = 0;
  for (const [pubId, pub] of groupedPubs) {
    console.log(
      `Dodaje do ewaluacji: ${pubId} [${pub
        .map((p) => p.id_autor)
        .join(', ')}] (${index + 1}/${total})`,
    );
    await select(pubId, pub);
    index++;
  }
};

const app = async () => {
  await login();
  // await update();
  const data = await fetch();
  saveJson(data, 'eval2020.json');

  const limits = await getLimits();
  saveJson(limits, 'limits.json');

  // const best = loadJson<Array<[number, Publication[]]>>('best.json');
  await deselectAll();
  await selectFromOptimization(data);

  // await selectAll(best);
  // const data = loadJson<Evaluation>('eval2020.json');

  // const chosen = await optimize(data, limits);

  //
  // await selectAll(chosen);

  const d = 3;
};

void app();
