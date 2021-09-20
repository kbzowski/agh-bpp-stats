import { getAllAuthors, getAuthorDetails, getAuthorPublications } from './bpp';
import { findDepartmentByName } from './departments';


export async function main() {
  // const dep = findDepartmentByName("Wydział Inżynierii Metali i Informatyki Przemysłowej");
  // const authors = await getAllAuthors({wydzial: dep})
  // console.log(authors)

  const pubs = await getAuthorPublications(5063, {iflf: 1, from: 2019});
  console.log(pubs)

}

void main();
