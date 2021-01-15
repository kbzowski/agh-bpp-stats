# -*- encoding: utf-8 -*-
import json
import pprint
import re
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.select import Select
import colorama
import statistics
import requests
import csv
from collections import OrderedDict
import pandas as pd

from disciplines import Discipline
from faculties import Faculty

# user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36'
from faculties_names import FacultyName

options = Options()
options.headless = False
options.add_argument('start-maximized')
options.add_argument('disable-infobars')
driver_path_chrome = '{0}\\bin\\chromedriver.exe'.format(os.path.dirname(os.path.abspath(__file__)))
driver_path_phantom = '{0}\\bin\\phantomjs.exe'.format(os.path.dirname(os.path.abspath(__file__)))
browser = webdriver.Chrome(executable_path=driver_path_chrome, options=options)
# browser = webdriver.PhantomJS(executable_path=driver_path_phantom)

colorama.init(autoreset=True)


def get_publication_evaluation(author_id, pub_id):
    resp = requests.get('https://sloty-proxy.bpp.agh.edu.pl/autor/{0}/publikacja/{1}'.format(author_id, pub_id))
    data = resp.json()
    if len(data) > 0:
        data = data[0]       # dla ewaluacji 2021
        return {
            "disc": data.get('nazwa_dyscypliny'),
            'rok_wydania': data.get('rok_wydania'),
            "slot": data.get('sloty_u_'),
            "points": data.get('sloty_p_u_'),
            "summ_points": data.get('wzor_p_c'),
            'wzor_k_': data.get('wzor_k_'),
            'wzor_m': data.get('wzor_m'),
            'wzor_p': data.get('wzor_p')
        }
    else:
        return None



def get_authors_ids():
    authors_links = []
    letters = "ABCČĆDEFGHIJKLŁMNOPRSŚTUVWZŹŻ"
    for char in letters:
        browser.get("https://www.bpp.agh.edu.pl/indeks/?poz={0}".format(char.upper()))

        table = browser.find_element_by_id('laut')
        authors = table.find_elements_by_tag_name("tr")

        for author in authors:
            data = author.find_elements_by_tag_name("td")
            if len(data) == 3:
                author_url = data[0].find_element_by_tag_name("a").get_attribute("href")
                author_id = re.search('([0-9]+)', author_url).groups(1)[0]
                authors_links.append(author_id)

    final_list = list(set(authors_links))
    final_list.sort()
    return final_list


def extract_papers_data_from_current_page():
    papers = browser.find_elements_by_xpath("//*[@class='tp1' or @class='tp2' or @class='tp3']")
    papers_data = []
    for paper in papers:
        paper_id = paper.get_attribute("id").split(':')[1]
        paper_info = paper.text.split('/ ')         # <-- Musi byc tak bo jak w tytule jest wzorek to sie split chrzani
        try:
            papers_data.append({
                'id': paper_id,
                'title': paper_info[0].strip().replace('\n', ''),
                'authors': [x.replace(' /', '').strip() for x in re.split(r"[,&]+", paper_info[1])]
            })
        except:
            print('Error during parsing paper: "{}"'.format(paper.text))
    return papers_data


def get_pages_navs_buttons():
    pages = browser.find_elements_by_tag_name("input")
    return [p for p in pages if 'pozycje' in p.get_attribute("title")]


def evaluate_author(author, errors):
    evaluation_data = {}

    for paper in author['papers']:
        eval = paper['eval']
        if eval is not None:
            discipline = eval['disc']
            if eval.get('points') is None or eval.get('slot') is None:
                errors.append({
                    'authorName': author['imie'] + ' ' + author['nazwisko'],
                    'paperTitle': paper['title'],
                    'paperId': paper['id'],
                    'summPoints': eval.get('summ_points')
                })
                continue

            if discipline in evaluation_data:
                evaluation_data[discipline]['points'] += eval['points']
                evaluation_data[discipline]['slot'] += eval['slot']
            else:
                evaluation_data[discipline] = {}
                evaluation_data[discipline]['points'] = eval['points']
                evaluation_data[discipline]['slot'] = eval['slot']

    return evaluation_data


def evaluate_authors(authors_with_papers):
    errors = []
    for i, author in enumerate(authors_with_papers):
        evaluation_data = evaluate_author(author, errors)
        authors_with_papers[i]['evaluation'] = evaluation_data

    return authors_with_papers, errors

def save_global_evaluation_to_csv(authors, filename):
    headers = OrderedDict()
    for author in authors:
        if author.get('evaluation') is not None:
            for discipline in author['evaluation'].keys():
                headers['{}_p'.format(discipline)] = 0
                headers['{}_s'.format(discipline)] = 0

    with open(filename, mode='w', newline='', encoding='utf-8', buffering=1) as csv_file:
        filelds = ['imie', 'nazwisko', 'department', 'faculty', "disc1", "disc1_percent", "disc2",
                   "disc2_percent"] + list(headers)
        writer = csv.DictWriter(csv_file, fieldnames=filelds, extrasaction='ignore')
        writer.writeheader()

        for author in authors:
            data_to_write = {
                "imie": author["imie"],
                "nazwisko": author["nazwisko"],
                "department": author["department"],
                "faculty": author["faculty"],
                "disc1": author["disc1"],
                "disc1_percent": author["disc1_percent"],
                "disc2": author["disc2"],
                "disc2_percent": author["disc2_percent"],
            }
            if author.get('evaluation') is not None:
                for discipline in author['evaluation'].keys():
                    data_to_write['{}_p'.format(discipline)] = author['evaluation'][discipline]['points']
                    data_to_write['{}_s'.format(discipline)] = author['evaluation'][discipline]['slot']
            writer.writerow(data_to_write)


def save_errors_to_csv(errors):
    with open('errors.csv', mode='w', newline='', encoding='utf-8') as csv_file:
        fields = ['authorName', 'paperName', 'paperId', 'summPoints']
        writer = csv.DictWriter(csv_file, fieldnames=fields)
        writer.writeheader()

        for error in errors:
            writer.writerow(error)


def get_author_info(author_id):
    browser.get("https://bpp.agh.edu.pl/autor/{}".format(author_id))
    author_name_with_title = browser.find_element_by_css_selector('h2').text.split(',')
    author_name = author_name_with_title[0]

    info = {
        "imie": ' '.join(author_name.split(' ')[0:-1]),
        "nazwisko": author_name.split(" ")[-1],
        "degree": author_name_with_title[1].strip() if len(author_name_with_title) > 1 else None,
    }

    try:
        skos_link = browser.find_element_by_partial_link_text('System Informacyjny AGH')
        info['alive'] = True
        info['skos'] = skos_link.get_attribute('href')
    except:
        info['alive'] = False

    inf_author_element = browser.find_elements_by_xpath("//*[@id='infAutor']")[0].text

    splitted_info = inf_author_element.split('\n')
    if splitted_info[1].startswith('poprzednio'):
        faculty = splitted_info[2] if len(inf_author_element) > 1 else None
        department = splitted_info[3] if len(inf_author_element) > 2 else None
    else:
        faculty = splitted_info[1] if len(inf_author_element) > 1 else None
        department = splitted_info[2] if len(inf_author_element) > 2 else None

    disc1 = re.search('\[dyscyplina wiodąca](.*)', inf_author_element)
    disc2 = re.search('\[dyscyplina dodatkowa](.*)', inf_author_element)
    disc1_percent = 0
    disc2_percent = 0

    disc1_text_only = ''
    disc2_text_only = ''

    if disc1:
        disc1_text_only = disc1.groups(1)[0].split(' / ')[1].strip() if disc1 is not None else ''
        disc1_percent = 1

    if disc2:
        disc2_text_only = re.sub(r'\([0-9][0-9]%\)', '', disc2.groups(1)[0].strip()).split(' / ')[1].strip()
        disc2_percent = float(re.search('([0-9][0-9])', disc2.groups(1)[0].strip()).groups(1)[0]) / 100
        disc1_percent = 1 - disc2_percent

    info['id'] = author_id
    info['disc1'] = disc1_text_only
    info['disc2'] = disc2_text_only
    info['disc1_percent'] = disc1_percent
    info['disc2_percent'] = disc2_percent
    info['faculty'] = faculty
    info['department'] = department
    return info


def make_cache():
    authors_links = get_authors_ids()
    cache = []

    for author_id in authors_links:
        info = get_author_info(author_id)
        cache.append(info)

    return cache


def load_data(filename):
    with open(filename, mode='r', encoding='utf-8') as authors_file:
        authors = json.load(authors_file)
    return authors


def save_data(data, filename):
    json_dump = json.dumps(data, ensure_ascii=False, indent=4)
    file = open(filename, 'w', encoding='utf8')
    file.write(json_dump)
    file.close()


def filter_authors_by_discipline(authors, discipline, min_percent=0):
    filtered_list = []

    for author in authors:
        if author['alive']:
            if author['disc1'] == discipline.value and author['disc1_percent'] > min_percent:
                filtered_list.append(author)
            if author['disc2'] == discipline.value and author['disc2_percent'] > min_percent:
                filtered_list.append(author)

    return filtered_list


def filter_authors_by_faculty_name(authors, faculty_name):
    filtered_list = [a for a in authors if a['faculty'] == faculty_name.value]
    return filtered_list


def filter_authors_by_alive(authors):
    return [a for a in authors if a['alive']]


def remove_authors_papers(authors):
    for i, author in enumerate(authors):
        authors[i].pop('papers', None)
        authors[i].pop('evaluation', None)


def get_paper_authors_from_faculty(authors_with_papers, paper_id, faculty_name):
    authors_ids = []
    for author in authors_with_papers:
        if author['faculty'] == faculty_name:
            for paper in author['papers']:
                if paper['id'] == paper_id:
                    authors_ids.append(author['id'])

    return authors_ids

def create_associative_matrix(authors_with_papers, file_name):
    papers_set = {}
    authors_ids = []
    authors_names = []
    authors_deps = []
    papers_names = {}

    for author in authors_with_papers:
        authors_ids.append(author['id'])
        authors_names.append(author['nazwisko'] + ' ' + author['imie'])
        authors_deps.append(author['department'].split(',')[0])

    for author in authors_with_papers:
        for paper in author['papers']:
            cooauthors = get_paper_authors_from_faculty(authors_with_papers, paper['id'], FacultyName.WIMiIP.value)
            pid = paper['id']
            if pid not in papers_set:
                papers_set[pid] = [0] * len(authors_ids)

            for ca in cooauthors:
                author_index = authors_ids.index(ca)
                if paper['eval'] is not None and paper['eval']['summ_points'] > 0:
                    papers_set[pid][author_index] = paper['eval']['summ_points'] / len(cooauthors)

                papers_names[pid] = paper['title']

    df = pd.DataFrame(papers_set)
    df.index = authors_names
    df = df.rename(columns=papers_names)
    df.insert(loc=0, column='department', value=authors_deps)
    df.transpose().to_csv(file_name)


def get_papers_for(authors, from_year, to_year):
    for ai, author in enumerate(authors):
        author_id = author['id']  # id

        pubs_list_filtered_url = 'https://bpp.agh.edu.pl/autor/?idA={0}&idform=1&afi=1&f1Search=1&fodR={1}&fdoR={2}&fagTP=0&fagPM=on'.format(
            author_id, from_year, to_year)
        browser.get(pubs_list_filtered_url)

        # get all pages
        pages = get_pages_navs_buttons()
        number_of_pages = 1
        for page in pages:
            try:
                val = int(page.get_attribute("value"))
                if val > number_of_pages:
                    number_of_pages = val
            except:
                pass

        # get papers ids
        papers_data = []
        if number_of_pages == 1:
            papers_data += extract_papers_data_from_current_page()
        else:
            for pnum in range(0, number_of_pages + 1):
                pages = get_pages_navs_buttons()
                for page in pages:
                    if 'page' in page.get_attribute("name"):
                        try:
                            page_value = int(page.get_attribute("value"))
                            if page_value > pnum:
                                page.click()
                                papers_data += extract_papers_data_from_current_page()
                                break
                        except:
                            pass

        for pi, paper in enumerate(papers_data):
            paper_id = paper['id']
            papers_data[pi]['eval'] = get_publication_evaluation(author_id, paper_id)

        authors[ai]['papers'] = papers_data

    return authors




if __name__ == "__main__":
    # Make initial cache
    # all_authors = make_cache()
    # save_data(all_authors, "agh_authors.json")

    # get evaluation for WIMIIP
    # all_authors = load_data("agh_authors.json")
    # all_authors = filter_authors_by_alive(all_authors)
    # # all_authors = filter_authors_by_discipline(all_authors, Discipline.INFORMATYKA_TECHNICZNA_I_TELEKOMUNIKACJA)
    # all_authors = filter_authors_by_faculty_name(all_authors, FacultyName.WIMiIP)
    # #
    # authors_with_papers = get_papers_for(all_authors, 2020, 2020)
    # evaluated_authors, evaluations_errors = evaluate_authors(authors_with_papers)
    # save_data(evaluations_errors, "WIMIIP_2017-2020.json")
    # save_data(authors_with_papers, "authors_wimiip_2020.json")
    # save_global_evaluation_to_csv(evaluated_authors, 'WIMIIP_2017-2020.csv')

    # create associative matrix
    authors_with_papers = load_data("authors_wimiip_2020.json")
    create_associative_matrix(authors_with_papers, "WIMIIP_papers_2020.csv")



    browser.quit()
