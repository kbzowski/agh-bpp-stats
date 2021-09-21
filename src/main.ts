import log from 'loglevel';

import { distinctPublications } from './algorithms';
import {
  getAllAuthors,
  getAuthorDetails,
  getAuthorPublicationsIds,
  getAuthorsDetails,
  getAuthorsPublications, getPoints, getPublicationDetails,
} from './bpp';
import { findDepartmentByName } from './departments';
import { filterBySkos } from './helpers';
import { loadJson, saveJson } from './io';
import { AuthorDetails, AuthorsPublications } from './types';


export async function main() {
  log.setLevel('debug')

  // Pobierz wszystkich pracowników wydziału
  // const dep = findDepartmentByName("Wydział Inżynierii Metali i Informatyki Przemysłowej");
  // const authors = await getAllAuthors({wydzial: dep, rok_od: 2019})
  // saveJson(authors, 'authors_wimiip_2019.json');

  // Pobierz dane szczegolowe pracownikow
  // const authorsDetails = await getAuthorsDetails(authors)
  // saveJson(authorsDetails, 'authors_wimiip_details_2019.json');

  // Pobierz publikacje pracownikow
  // let authorsDetails = loadJson<AuthorDetails[]>('authors_wimiip_details_2019.json')
  // authorsDetails = filterBySkos(authorsDetails);
  // const pubsByAuthors: AuthorsPublications[] = await getAuthorsPublications(authorsDetails, {from: 2018});
  // saveJson(pubsByAuthors, 'authors_wimiip_pubs_2018.json');

  // Zapisz publikacje
  const pubsByAuthors = loadJson<AuthorsPublications[]>("authors_wimiip_pubs_2018.json")
  const pubs = distinctPublications(pubsByAuthors);
  saveJson(pubs, 'pubs_2018.json');

  // console.log(authors)

  // const pubs = await getAuthorPublications(5063, {iflf: 1, from: 2019});
  // console.log(pubs)

  // let authorsDetails = loadJson<AuthorDetails[]>('authorsDetails.json')
  // authorsDetails = filterBySkos(authorsDetails);
  // const pubsByAuthors = await getAuthorsPublications(authorsDetails)

  // const pub = await getPublicationDetails(124780);
  // const points = await getPoints(7213, 124780)
  //
  // const x = authorsDetails[0].disciplines[0].label;
  // console.log(x);
}

void main();
