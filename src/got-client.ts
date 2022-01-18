import got from 'got-cjs';
const map = new Map();

export const client = got.extend({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0',
  },
  cache: map,
});
