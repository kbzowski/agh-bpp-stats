import pandas as pd


def create_statistics(publications, authors, faculty):
    # Create a dictionary to quickly lookup authors by id
    author_dict = {author["id"]: author for author in authors}

    # Create unique publications list by publication id
    unique_publications = {}
    for pub_list in publications.values():
        for pub in pub_list:
            unique_publications[pub["id"]] = pub

    # Collect all unique author ids from the provided authors list
    all_author_ids = list(author_dict.keys())

    # Create the MultiIndex for the columns
    author_names = [author_dict[aid]["surname_names"] for aid in all_author_ids]
    author_units = [author_dict[aid]["unit"] for aid in all_author_ids]
    columns = pd.MultiIndex.from_arrays(
        [author_names, author_units], names=["Author", "Unit"]
    )

    # Prepare publication keys
    publication_keys = [
        f"{pub['title']} ({pub['id']})" for pub in unique_publications.values()
    ]

    # Initialize the DataFrame with float type
    df = pd.DataFrame(0.0, index=publication_keys, columns=columns)

    # Populate the DataFrame
    for pub in unique_publications.values():
        pub_id = pub["id"]
        pub_title = pub["title"]
        pub_details = pub["details"]
        pc_value = pub_details["pc_value"]
        author_ids = pub_details["author_ids"]

        # Count the number of faculty authors
        faculty_author_count = sum(
            1
            for aid in author_ids
            if aid in author_dict and author_dict[aid]["faculty"] == faculty
        )

        # If there are no authors from the faculty, skip this publication
        if faculty_author_count == 0:
            continue

        # Divide the pc_value by the number of faculty authors
        divided_pc_value = pc_value / faculty_author_count

        # Create the publication key for the DataFrame
        publication_key = f"{pub_title} ({pub_id})"

        # Distribute the divided_pc_value to the corresponding authors
        for aid in author_ids:
            if aid in author_dict and author_dict[aid]["faculty"] == faculty:
                author_key = author_dict[aid]["surname_names"]
                unit_key = author_dict[aid]["unit"]
                df.at[publication_key, (author_key, unit_key)] = divided_pc_value

    return df
