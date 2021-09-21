import * as fs from 'fs';

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
