import traceback

from badap_stats.badap import get_authors_papers
from badap_stats.io import (
    write_json_to_file,
    read_punktoza_db,
    read_json_from_file,
    save_df_to_excel,
)
from badap_stats.stats import create_statistics


def handle_progress(author):
    print(f"Processing author: {author['surname_names']}")


if __name__ == "__main__":
    year = 2023
    faculty = "WIMiIP"

    try:
        authors, publications = get_authors_papers(year, faculty, handle_progress)
        write_json_to_file(authors, "authors.json")
        write_json_to_file(publications, "publications.json")

        authors = read_json_from_file("authors.json")
        publications = read_json_from_file("publications.json")
        stats = create_statistics(publications, authors, faculty)
        save_df_to_excel(stats, "stats.xlsx")
    except Exception as e:
        print(f"Error: {e}")
        print(traceback.format_exc())
