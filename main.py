from bpp import load_data, filter_authors_by_discipline, filter_authors_by_alive, get_papers_for, create_associative_matrix, save_data, \
    save_global_evaluation_to_csv, evaluate_authors
from disciplines import Discipline

if __name__ == "__main__":
    # Make initial cache
    # all_authors = make_cache()
    # save_data(all_authors, "agh_authors.json")

    # get evaluation for WIMIIP
    all_authors = load_data("agh_authors.json")

    all_authors = filter_authors_by_alive(all_authors)
    all_authors = filter_authors_by_discipline(all_authors, Discipline.INZYNIERIA_MATERIALOWA)
    # all_authors = filter_authors_by_faculty_name(all_authors, FacultyName.WIMiIP)
    # #
    authors_with_papers = get_papers_for(all_authors, 2019, 2020)
    evaluated_authors, evaluations_errors = evaluate_authors(authors_with_papers)
    save_data(evaluations_errors, "imat_errors_2019_2020.json")
    save_data(authors_with_papers, "imat_authors_papers_2019_2020.json")
    save_global_evaluation_to_csv(evaluated_authors, 'imat_2019_2020.csv')

    # create associative matrix
    # authors_with_papers = load_data("authors_wimiip_2020.json")

    matrix_type = 'm' # 'alive' or 'm'
    create_associative_matrix(authors_with_papers, matrix_type, "imat_papers_2020.csv")

