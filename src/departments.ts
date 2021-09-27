import { Department } from './types';

export enum DepartmentAbbreviation {
  WILiGZ = 'WILiGZ',
  WIMiIP = 'WIMiIP',
  WEAIiIB = 'WEAIiIB',
  WIEiT = 'WIEiT',
  WIMiR = 'WIMiR',
  WGGiOS = 'WGGiOŚ',
  WGGiIS = 'WGGiIŚ',
  WIMiC = 'WIMiC',
  WO = 'WO',
  WMN = 'WMN',
  WWNiG = 'WWNiG',
  WZ = 'WZ',
  WEiP = 'WEiP',
  CTT = 'CTT',
  WFiIS = 'WFiIS',
  WMS = 'WMS',
  WH = 'WH',
  SJO = 'SJO',
  SWFiS = 'SWFiS',
  BG = 'BG',
  ACMiN = 'ACMiN',
  CE = 'CE',
}

export const departments: Department[] = [
  {
    department_name: 'Wydział Inżynierii Lądowej i Gospodarki Zasobami',
    id_department: 1,
    department_abbrev: DepartmentAbbreviation.WILiGZ,
  },
  {
    department_name: 'Wydział Inżynierii Metali i Informatyki Przemysłowej',
    id_department: 2,
    department_abbrev: DepartmentAbbreviation.WIMiIP,
  },
  {
    department_name:
      'Wydział Elektrotechniki, Automatyki, Informatyki i Inżynierii Biomedycznej',
    id_department: 31,
    department_abbrev: DepartmentAbbreviation.WEAIiIB,
  },
  {
    department_name: 'Wydział Informatyki, Elektroniki i Telekomunikacji',
    id_department: 32,
    department_abbrev: DepartmentAbbreviation.WIEiT,
  },
  {
    department_name: 'Wydział Inżynierii Mechanicznej i Robotyki',
    id_department: 4,
    department_abbrev: DepartmentAbbreviation.WIMiR,
  },
  {
    department_name: 'Wydział Geologii, Geofizyki i Ochrony Środowiska',
    id_department: 5,
    department_abbrev: DepartmentAbbreviation.WGGiOS,
  },
  {
    department_name: 'Wydział Geodezji Górniczej i Inżynierii Środowiska',
    id_department: 6,
    department_abbrev: DepartmentAbbreviation.WGGiIS,
  },
  {
    department_name: 'Wydział Inżynierii Materiałowej i Ceramiki',
    id_department: 7,
    department_abbrev: DepartmentAbbreviation.WIMiC,
  },
  {
    department_name: 'Wydział Odlewnictwa',
    id_department: 8,
    department_abbrev: DepartmentAbbreviation.WO,
  },
  {
    department_name: 'Wydział Metali Nieżelaznych',
    id_department: 9,
    department_abbrev: DepartmentAbbreviation.WMN,
  },
  {
    department_name: 'Wydział Wiertnictwa, Nafty i Gazu',
    id_department: 10,
    department_abbrev: DepartmentAbbreviation.WWNiG,
  },
  {
    department_name: 'Wydział Zarządzania',
    id_department: 11,
    department_abbrev: DepartmentAbbreviation.WZ,
  },
  {
    department_name: 'Wydział Energetyki i Paliw',
    id_department: 12,
    department_abbrev: DepartmentAbbreviation.WEiP,
  },
  {
    department_name: 'Wydział Fizyki i Informatyki Stosowanej',
    id_department: 13,
    department_abbrev: DepartmentAbbreviation.WFiIS,
  },
  {
    department_name: 'Wydział Matematyki Stosowanej',
    id_department: 14,
    department_abbrev: DepartmentAbbreviation.WMS,
  },
  {
    department_name: 'Wydział Humanistyczny',
    id_department: 15,
    department_abbrev: DepartmentAbbreviation.WH,
  },
  {
    department_name: 'Studium Języków Obcych',
    id_department: 16,
    department_abbrev: DepartmentAbbreviation.SJO,
  },
  {
    department_name: 'Studium Wychowania Fizycznego i Sportu',
    id_department: 17,
    department_abbrev: DepartmentAbbreviation.SWFiS,
  },
  {
    department_name: 'Biblioteka Główna',
    id_department: 18,
    department_abbrev: DepartmentAbbreviation.BG,
  },
  {
    department_name: 'Uczelniane Centrum Informatyki',
    id_department: 19,
    department_abbrev: '',
  },
  {
    department_name: 'Ośrodek Historii Techniki z Muzeum i Archiwum',
    id_department: 20,
    department_abbrev: '',
  },
  {
    department_name: 'Międzynarodowa Szkoła Inżynierska',
    id_department: 21,
    department_abbrev: '',
  },
  {
    department_name: 'Centrum e-Learningu AGH',
    id_department: 22,
    department_abbrev: '',
  },
  {
    department_name:
      'Szkoła Ochrony i Inżynierii Środowiska im. Walerego Goetla',
    id_department: 23,
    department_abbrev: '',
  },
  {
    department_name: "Akademickie Centrum Komputerowe ,,Cyfronet'' AGH",
    id_department: 24,
    department_abbrev: '',
  },
  {
    department_name: 'Pion Biura Rektora',
    id_department: 26,
    department_abbrev: '',
  },
  {
    department_name: 'Pion Kanclerza',
    id_department: 27,
    department_abbrev: '',
  },
  {
    department_name: 'Pion Kwestury',
    id_department: 28,
    department_abbrev: '',
  },
  {
    department_name: 'Akademickie Centrum Materiałów i Nanotechnologii',
    id_department: 113,
    department_abbrev: DepartmentAbbreviation.ACMiN,
  },
  {
    department_name: 'Centrum Energetyki',
    id_department: 115,
    department_abbrev: DepartmentAbbreviation.CE,
  },
  {
    department_name: 'Pion Współpracy',
    id_department: 116,
    department_abbrev: '',
  },
  {
    department_name: 'Pion Kształcenia',
    id_department: 117,
    department_abbrev: '',
  },
  {
    department_name: 'Pion Nauki',
    id_department: 118,
    department_abbrev: '',
  },
  {
    department_name: 'Centrum Transferu Technologii AGH',
    id_department: 119,
    department_abbrev: DepartmentAbbreviation.CTT,
  },
];

export const findDepartmentByName = (name: string) => {
  return departments.find((d) => d.department_name == name);
};

export const findDepartmentByAbbrev = (abbrev: string) => {
  return departments.find((d) => d.department_abbrev == abbrev);
};
