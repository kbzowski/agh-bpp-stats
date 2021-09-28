import got from 'got';
const map = new Map();

export const client = got.extend({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0',
  },
  cache: map,
});
