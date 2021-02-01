from bpp import load_data, filter_authors_by_discipline, filter_authors_by_alive, get_papers_for, \
    create_associative_matrix, save_data, \
    save_global_evaluation_to_csv, evaluate_authors, finish, filter_authors_by_faculty_name
from disciplines import Discipline
from faculties_names import FacultyName


def only_authors_from_wimiip(author):
    return author['faculty'] == FacultyName.WIMiIP.value


def no_author_filter(author):
    return True


def points_paper_filter(paper):
    return not (paper['eval'] is None) and paper['eval']['summ_points'] > 80


if __name__ == "__main__":
    # -------------------------------------
    # Make initial cache
    # all_authors = make_cache()
    # save_data(all_authors, "agh_authors.json")
    # disc = Discipline.INZYNIERIA_MATERIALOWA
    # disc = Discipline.INFORMATYKA_TECHNICZNA_I_TELEKOMUNIKACJA
    # disc = Discipline.INFORMATYKA
    # disc = Discipline.INZYNIERIA_MECHANICZNA
    # disc = Discipline.INZYNIERIA_SRODOWISKA_GORNICTWO_I_ENERGETYKA
    disc = Discipline.INZYNIERIA_BIOMEDYCZNA
    
    from_year = 2019
    to_year = 2020
    
    # -------------------------------------
    # Get authors with papers
    all_authors = load_data("agh_authors.json")
    # all_authors = load_data("imat_authors.json")
    all_authors = filter_authors_by_alive(all_authors)
    all_authors = filter_authors_by_discipline(all_authors, disc, True)
    # all_authors = filter_authors_by_faculty_name(all_authors, FacultyName.WIMiIP)
    save_data(all_authors, "ibio_first_authors.json");
    
    authors_with_papers = get_papers_for(all_authors, from_year, to_year)
    save_data(authors_with_papers, "ibio_first_authors_papers_{0}_{1}.json".format(from_year, to_year))
    
    
    # -------------------------------------
    # Evaluate authors
    # authors_with_papers = load_data("imat_authors_papers_{0}_{1}.json".format(from_year, to_year))
    # evaluated_authors, evaluations_errors = evaluate_authors(authors_with_papers)
    # save_data(evaluations_errors, "imat_errors_{0}_{1}.json".format(from_year, to_year))    
    # save_global_evaluation_to_csv(evaluated_authors, "imat_{0}_{1}.csv".format(from_year, to_year))


    # -------------------------------------
    # Create associative matrix
    # authors_with_papers = load_data("wimip_imat_authors_papers_{0}_{1}.json".format(from_year, to_year))
    matrix_type = 'm'  # 'alive' or 'm'
    # authors_with_papers = load_data("itit_authors_papers_2019_2020.json")
    create_associative_matrix(authors_with_papers, matrix_type, "ibio_first_papers_{0}_{1}.csv".format(from_year, to_year), no_author_filter, points_paper_filter)

    finish()
