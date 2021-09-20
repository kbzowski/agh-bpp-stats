import * as fs from 'fs';

export const saveJson = (object: any, filename: string) => {
  const data = JSON.stringify(object);
  fs.writeFileSync(filename, data, 'utf8');
}

export const loadJson = <TargetType extends Record<string, any>>(filename: string): TargetType => {
  const data = fs.readFileSync(filename, 'utf8');
  const raw = JSON.parse(data);
  return raw as TargetType;
}
