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

from faculties import Faculty

options = Options()
options.headless = True
options.add_argument('start-maximized')
options.add_argument('disable-infobars')
driver_path = '{0}\\bin\\chromedriver.exe'.format(os.path.dirname(os.path.abspath(__file__)))
browser = webdriver.Chrome(executable_path=driver_path, options=options)

colorama.init(autoreset=True)


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


def run(authors, from_year, to_year):
    file = open('result.txt', 'w', encoding='utf8')
    department_points = []

    for author in authors:
        author_id = author[0]           # id
        department_name = author[1]     # department
        sum_points = 0
        pubs_list_filtered_url = 'https://bpp.agh.edu.pl/autor/?idA={0}&idform=1&afi=1&f1Search=1&fodR={1}&fdoR={2}&fagTP=0&fagPM=on'.format(
            author_id, from_year, to_year)
        browser.get(pubs_list_filtered_url)
        author_name = browser.find_element_by_css_selector('h2').text

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
            points_string = browser.find_element_by_class_name('ocena-pktm').text.split(':')[1]
            points = float(points_string)
            sum_points += points

        log = '{0:60s}: {1}'.format(author_name, sum_points)
        print(log)
        log = '{0}\t{1}\t{2}'.format(author_name, department_name, sum_points)
        file.write(log + "\n")
        department_points.append(sum_points)
    browser.quit()
    file.close()
    median = statistics.median(department_points)
    mean = statistics.mean(department_points)
    print('\n\nMedian for specific criteria: {0}\nAverage points: {1}'.format(median, mean))


if __name__ == "__main__":
    ################### PARAMS ####################
    FROM_YEAR = 2017
    TO_YEAR = 2018
    FACULTY = Faculty.WEAIiIB
    DEPARTMENT = None
    # DEPARTMENT = 'WIMiIP-kism'
    ###############################################

    authors_ids = get_authors_id_by_faculty(FACULTY, DEPARTMENT)
    # authors_ids = ['05854']       // For specific author
    run(authors_ids, FROM_YEAR, TO_YEAR)
