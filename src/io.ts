import * as fs from 'fs';
import { parse } from 'json2csv';
import { EOL } from 'os';

const replacer = (key, value) => {
  if (value instanceof Set) return [...value];
  return value;
};

export const saveJson = (object: any, filename: string) => {
  const data = JSON.stringify(object, replacer, 2);
  fs.writeFileSync(filename, data, 'utf8');
};

export const loadJson = <TargetType extends Record<string, any>>(
  filename: string,
): TargetType => {
  const data = fs.readFileSync(filename, 'utf8');
  const raw = JSON.parse(data);
  return raw as TargetType;
};

export const saveArrayCsv = (data: any[], filename: string) => {
  const csv = parse(data);
  fs.writeFileSync(filename, csv, 'utf8');
};

export const saveMatrixCsv = (
  data: any[][],
  filename: string,
  headers?: string[][],
  indexes?: any[],
) => {
  const stream = fs.createWriteStream(filename);
  stream.write('\ufeff'); // Poatrzebne dla UTF8-BOM - inaczej Excell wysiwetla krzaczki

  // Header
  if (headers) {
    for (const header of headers) {
      stream.write('-;');
      stream.write(header.join(';'));
      stream.write(EOL);
    }
  }

  // Data
  for (let i = 0; i < data.length; ++i) {
    if (indexes) {
      stream.write(`${indexes[i]};`);
    }

    stream.write(data[i].join(';'));
    stream.write(EOL);
  }
};
