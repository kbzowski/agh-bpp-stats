import json

punktoza = []


def write_json_to_file(data, filename):
    with open(filename, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4)


def read_json_from_file(filename, encoding="utf-8"):
    with open(filename, "r", encoding=encoding) as file:
        return json.load(file)


def read_punktoza_db(filename):
    global punktoza
    punktoza = read_json_from_file(filename, "latin-1")


def find_points_in_punktoza_by_issn(issn):
    if issn is None:
        return 0

    if len(punktoza) == 0:
        read_punktoza_db("punktoza.json")

    for journal in punktoza:
        if journal["4"] == issn:
            return journal["3"]
    return None


def save_df_to_excel(df, filename):
    df.to_excel(filename)
