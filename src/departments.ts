import { Department } from './types';

export const departments: Department[] = [
  {
    department_name: 'Wydział Inżynierii Lądowej i Gospodarki Zasobami',
    id_department: 1,
  },
  {
    department_name: 'Wydział Inżynierii Metali i Informatyki Przemysłowej',
    id_department: 2,
  },
  {
    department_name:
      'Wydział Elektrotechniki, Automatyki, Informatyki i Inżynierii Biomedycznej',
    id_department: 31,
  },
  {
    department_name: 'Wydział Informatyki, Elektroniki i Telekomunikacji',
    id_department: 32,
  },
  {
    department_name: 'Wydział Inżynierii Mechanicznej i Robotyki',
    id_department: 4,
  },
  {
    department_name: 'Wydział Geologii, Geofizyki i Ochrony Środowiska',
    id_department: 5,
  },
  {
    department_name: 'Wydział Geodezji Górniczej i Inżynierii Środowiska',
    id_department: 6,
  },
  {
    department_name: 'Wydział Inżynierii Materiałowej i Ceramiki',
    id_department: 7,
  },
  {
    department_name: 'Wydział Odlewnictwa',
    id_department: 8,
  },
  {
    department_name: 'Wydział Metali Nieżelaznych',
    id_department: 9,
  },
  {
    department_name: 'Wydział Wiertnictwa, Nafty i Gazu',
    id_department: 10,
  },
  {
    department_name: 'Wydział Zarządzania',
    id_department: 11,
  },
  {
    department_name: 'Wydział Energetyki i Paliw',
    id_department: 12,
  },
  {
    department_name: 'Wydział Fizyki i Informatyki Stosowanej',
    id_department: 13,
  },
  {
    department_name: 'Wydział Matematyki Stosowanej',
    id_department: 14,
  },
  { department_name: 'Wydział Humanistyczny', id_department: 15 },
  {
    department_name: 'Studium Języków Obcych',
    id_department: 16,
  },
  {
    department_name: 'Studium Wychowania Fizycznego i Sportu',
    id_department: 17,
  },
  {
    department_name: 'Biblioteka Główna',
    id_department: 18,
  },
  {
    department_name: 'Uczelniane Centrum Informatyki',
    id_department: 19,
  },
  {
    department_name: 'Ośrodek Historii Techniki z Muzeum i Archiwum',
    id_department: 20,
  },
  {
    department_name: 'Międzynarodowa Szkoła Inżynierska',
    id_department: 21,
  },
  {
    department_name: 'Centrum e-Learningu AGH',
    id_department: 22,
  },
  {
    department_name:
      'Szkoła Ochrony i Inżynierii Środowiska im. Walerego Goetla',
    id_department: 23,
  },
  {
    department_name: "Akademickie Centrum Komputerowe ,,Cyfronet'' AGH",
    id_department: 24,
  },
  { department_name: 'Pion Biura Rektora', id_department: 26 },
  {
    department_name: 'Pion Kanclerza',
    id_department: 27,
  },
  {
    department_name: 'Pion Kwestury',
    id_department: 28,
  },
  {
    department_name: 'Akademickie Centrum Materiałów i Nanotechnologii',
    id_department: 113,
  },
  { department_name: 'Centrum Energetyki', id_department: 115 },
  {
    department_name: 'Pion Współpracy',
    id_department: 116,
  },
  { department_name: 'Pion Kształcenia', id_department: 117 },
  {
    department_name: 'Pion Nauki',
    id_department: 118,
  },
  { department_name: 'Centrum Transferu Technologii AGH', id_department: 119 },
];

export const findDepartmentByName = (name: string) => {
  return departments.find((d) => d.department_name == name);
};
