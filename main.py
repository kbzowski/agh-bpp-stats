# -*- encoding: utf-8 -*-
import pprint
import re
import os
from selenium import webdriver
from string import ascii_uppercase
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.select import Select
import colorama
import statistics
import requests
import csv
from collections import OrderedDict

from faculties import Faculty

options = Options()
options.headless = True
options.add_argument('start-maximized')
options.add_argument('disable-infobars')
driver_path = '{0}\\bin\\chromedriver.exe'.format(os.path.dirname(os.path.abspath(__file__)))
browser = webdriver.Chrome(executable_path=driver_path, options=options)

colorama.init(autoreset=True)


def get_publication_evaluation(author_id, pub_id):
    resp = requests.get('https://sloty-proxy.bpp.agh.edu.pl/autor/{0}/publikacja/{1}'.format(author_id, pub_id))
    return resp.json()


def is_author_alive(author):
    author_id = author[0]
    browser.get("https://bpp.agh.edu.pl/autor/{}".format(author_id))
    author_name = browser.find_element_by_css_selector('h2').text.split(',')[0]
    try:
        browser.find_element_by_partial_link_text('System Informacyjny AGH')
    except:
        print('{0:10} {1:60s}'.format(author_id, author_name))
        return False

    print('{0:10} {1:60s} PRACOWNIK'.format(author_id, author_name))
    return True

def get_authors_id_by_faculty(faculty, filter_by_department=None):
    faculty_id = faculty.value
    browser.get('https://www.bpp.agh.edu.pl/?wydz={0}'.format(faculty_id))
    faculty_name = Select(browser.find_element_by_id('wydz')).first_selected_option.text
    print(colorama.Style.BRIGHT + 'Fetching staff from: {0}\n'.format(faculty_name))


    authors_links = []
    letters = ascii_uppercase + "ĆŚŹŻŁ"
    for char in letters:
        browser.get("https://www.bpp.agh.edu.pl/indeks/?wydz={0}&odR=0&doR=0&poz={1}".format(faculty_id, char.upper()))

        table = browser.find_element_by_id('laut')
        authors = table.find_elements_by_tag_name("tr")

        for author in authors:
            data = author.find_elements_by_tag_name("td")
            if len(data) == 3:
                author_url = data[0].find_element_by_tag_name("a").get_attribute("href")
                author_department = data[1].text
                if filter_by_department is not None and author_department != filter_by_department:
                    continue

                author_id = re.search('([0-9]+)', author_url).groups(1)[0]
                authors_links.append((author_id, author_department))

    return list(set(authors_links))


def extract_papers_ids(papers_ids):
    papers = browser.find_elements_by_xpath("//*[@class='tp1' or @class='tp2' or @class='tp3']")
    for paper in papers:
        paper_id = paper.get_attribute("id").split(':')[1]
        papers_ids.append(paper_id)


def get_pages_navs_buttons():
    pages = browser.find_elements_by_tag_name("input")
    return [p for p in pages if 'pozycje' in p.get_attribute("title")]

def add_to_evaluation(evaluation_data, new_item):
    discipline = new_item['nazwa_dyscypliny']
    if new_item['sloty_p_u_'] is None or new_item['sloty_u_'] is None:
        print(colorama.Fore.RED, "Wrong eval data [None] - Autor: {}, Publikacja: {}".format(new_item['id_autor'], new_item['id_publ']))
        return

    if discipline in evaluation_data:
        evaluation_data[discipline]['points'] += new_item['sloty_p_u_']
        evaluation_data[discipline]['slot'] += new_item['sloty_u_']
    else:
        evaluation_data[discipline] = {}
        evaluation_data[discipline]['points'] = new_item['sloty_p_u_']
        evaluation_data[discipline]['slot'] = new_item['sloty_u_']


def save_global_evaluation_to_csv(global_evaluation):
    headers = OrderedDict()
    for person in global_evaluation:
        for discipline in person['summary'].keys():
            headers['{}_p'.format(discipline)] = 0
            headers['{}_s'.format(discipline)] = 0



    with open('evaluation.csv', mode='w', newline='') as csv_file:
        filelds = ['name'] + list(headers)
        writer = csv.DictWriter(csv_file, fieldnames=filelds)
        writer.writeheader()

        for person in global_evaluation:
            data_to_write = {
                "name": person["name"]
            }
            for discipline in person['summary'].keys():
                data_to_write['{}_p'.format(discipline)] = person['summary'][discipline]['points']
                data_to_write['{}_s'.format(discipline)] = person['summary'][discipline]['slot']
            writer.writerow(data_to_write)



def run(authors, from_year, to_year):
    file = open('result.txt', 'w', encoding='utf8')
    department_points = []
    global_evaluation = []

    for author in authors:
        author_id = author[0]  # id
        if isinstance(author_id, int):
            author_id = str(author_id)

        department_name = author[1]  # department
        author_evaluation = {}
        sum_points = 0
        pubs_list_filtered_url = 'https://bpp.agh.edu.pl/autor/?idA={0}&idform=1&afi=1&f1Search=1&fodR={1}&fdoR={2}&fagTP=0&fagPM=on'.format(
            author_id, from_year, to_year)
        browser.get(pubs_list_filtered_url)
        author_name = browser.find_element_by_css_selector('h2').text.split(',')[0]

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
        papers_ids = []
        if number_of_pages == 1:
            extract_papers_ids(papers_ids)
        else:
            for pnum in range(0, number_of_pages + 1):
                pages = get_pages_navs_buttons()
                for page in pages:
                    if 'page' in page.get_attribute("name"):
                        try:
                            page_value = int(page.get_attribute("value"))
                            if page_value > pnum:
                                page.click()
                                extract_papers_ids(papers_ids)
                                break
                        except:
                            pass

        for paperId in papers_ids:
            browser.get(
                'https://bpp.agh.edu.pl/htmle.php?file=publikacja-pktm-iflf.html&id_publ={0}&id_autor={1}'.format(
                    paperId, author_id))
            points_string = browser.find_element_by_class_name('ocena-pktm').text
            points_string_list = points_string.split('\n')
            last_evaluation_points = points_string_list[0]
            extracted_points = re.search('.*?: (([0-9]*[.])?[0-9]+)', last_evaluation_points).groups(1)[0]
            points = float(extracted_points)
            sum_points += points

            #evaluation
            paper_eval = get_publication_evaluation(author_id, paperId)
            if len(paper_eval) > 0:
                add_to_evaluation(author_evaluation, paper_eval[0])         # 0 if for evaluation 2021... probably

        global_evaluation.append({
            "name": author_name,
            "summary": author_evaluation
        })

        log = '{0:10s} {1:60s}: {2}'.format(author_id, author_name, sum_points)
        print(log)
        log = '{0:10s} {1}\t{2}\t{3}'.format(author_id, author_name, department_name, sum_points)
        file.write(log + "\n")
        department_points.append(sum_points)

    save_global_evaluation_to_csv(global_evaluation)
    browser.quit()
    file.close()
    median = statistics.median(department_points)
    mean = statistics.mean(department_points)
    print('\n\nMedian for specific criteria: {0}\nAverage points: {1}'.format(median, mean))


if __name__ == "__main__":
    ################### PARAMS ####################
    FROM_YEAR = 2016
    TO_YEAR = 2020
    FACULTY = Faculty.WIMiIP
    DEPARTMENT = 'WIMiIP-kism'
    ###############################################


    authors_ids = get_authors_id_by_faculty(FACULTY, DEPARTMENT)
    authors_ids = [a for a in authors_ids if is_author_alive(a)]
    #pracownicy_aktualni = [(4838, ''), (2776, ''), (2773, ''), (6330, ''), (2775, ''), (2770, ''), (5138, ''), (21023, ''), (7173, ''), (26298, ''), (3942, ''), (6353, ''), (5929, ''), (4650, ''), (4667, ''), (3655, ''), (3556, ''), (4651, ''), (7225, ''), (5861, ''), (5063, ''), (6991, ''), (5973, ''), (7213, ''), (17069, ''), (31825, ''), (5828, ''), (18663, ''), (4844, ''), (33863, ''), (35207, ''), (5010, ''), (17548, ''), (5854, ''), (6357, ''), (5008, ''), (4174, ''), (5601, ''), (4843, ''), (7100, ''), (6468, ''), (2767, ''), (6152, ''), (12206, ''), (6855, ''), (20770, ''), (4360, ''), (5783, ''), (9040, '')]
    #authors_ids = [('05063', 'WIMiIP-kism')]       # For specific author
    run(authors_ids, FROM_YEAR, TO_YEAR)
