from badap_stats.io import write_json_to_file, find_points_in_punktoza_by_issn
from badap_stats.network import (
    get_badap_api_response,
    get_next_data,
    get_issn_from_crossref,
)


def get_authors_list(year, faculty):
    url = f"https://badap.agh.edu.pl/a/authors?years_facets={year}&institution_facets={faculty}&limit=2000"
    api_response = get_badap_api_response(url)

    authors = []
    for hit in api_response.get("hits", {}).get("hits", []):
        author = {
            "id": hit.get("_id"),
            "unit": hit.get("_source", {})
            .get("institution_faculty_unit", {})
            .get("institution_unit_abbrev", ""),
            "surname_names": hit.get("_source", {}).get("surname_names", ""),
            "faculty": hit.get("_source", {})
            .get("institution_faculty_unit", {})
            .get("institution_faculty_abbrev", ""),
        }
        authors.append(author)
    return authors


def get_author_papers(author_id, year):
    url = f"https://badap.agh.edu.pl/a/author_solo/{author_id}?limit=500&years_facets={year}"
    api_response = get_badap_api_response(url)

    publications = []
    for hit in api_response.get("publ", {}).get("hits", {}).get("hits", []):
        # Extract the title from the second element of the sort array
        sort_array = hit.get("sort", [])
        title = sort_array[1] if len(sort_array) > 1 else ""

        id = hit.get("_id")
        details = get_paper_details(id)
        publication = {"id": hit.get("_id"), "title": title, "details": details}

        publications.append(publication)

    return publications


def get_authors_papers(year, faculty, on_progress=None):
    authors = get_authors_list(year, faculty)

    authors_papers = {}
    for author in authors:
        author_id = author.get("id")
        if on_progress:
            on_progress(author)

        author_papers = get_author_papers(author_id, year)
        authors_papers[author_id] = author_papers

    return authors, authors_papers


def get_paper_details(paper_id):
    url = f"https://badap.agh.edu.pl/publikacja/{paper_id}"
    data = get_next_data(url)

    scoring = (
        data.get("props", {}).get("pageProps", {}).get("data", {}).get("scoring", {})
    )
    publ_pc = scoring.get("publ_pc", [])

    pc_value = publ_pc[0].get("_pc") if publ_pc and len(publ_pc) > 0 else 0

    authors = (
        data.get("props", {}).get("pageProps", {}).get("data", {}).get("authors", [])
    )
    author_ids = [author.get("url_author_slug") for author in authors]

    doi = data.get("props", {}).get("pageProps", {}).get("data", {}).get("doi")

    issn = get_issn_from_crossref(doi)
    punktoza = find_points_in_punktoza_by_issn(issn)

    return {
        "pc_value": pc_value,
        "author_ids": author_ids,
        "doi": doi,
        "punktoza": punktoza,
    }
