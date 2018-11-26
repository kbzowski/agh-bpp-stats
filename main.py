# -*- encoding: utf-8 -*-
import re
import os
from selenium import webdriver
from string import ascii_uppercase
from selenium.webdriver.chrome.options import Options

options = Options()
options.headless = True
options.add_argument('start-maximized')
options.add_argument('disable-infobars')
driver_path = '{0}\\bin\\chromedriver.exe'.format(os.path.dirname(os.path.abspath(__file__)))
browser = webdriver.Chrome(executable_path=driver_path, options=options)


def get_authors_ids(faculty_id, by_department=None):
    authors_links = []
    letters = ascii_uppercase + "ĆŚŹŻŁ"
    for char in letters:
        browser.get("https://www.bpp.agh.edu.pl/indeks/?wydz={0}&odR=0&doR=0&poz={1}".format(faculty_id, char.upper()))

        table = browser.find_element_by_id('laut')
        authors = table.find_elements_by_tag_name("tr")

        for author in authors:
            data = author.find_elements_by_tag_name("td")
            if len(data) == 3:
                name_field = data[0].find_element_by_tag_name("a")
                department_field = data[1].text
                if by_department is not None and department_field != by_department:
                    continue
                href = name_field.get_attribute("href")
                if href not in authors_links:
                    ids = re.search('([0-9]+)', href)
                    id = ids.groups(1)[0]
                    authors_links.append(id)

    return list(set(authors_links))


def extract_papers_ids(papers_ids):
    papers = browser.find_elements_by_xpath("//*[@class='tp1' or @class='tp2' or @class='tp3']")
    for paper in papers:
        paper_id = paper.get_attribute("id").split(':')[1]
        papers_ids.append(paper_id)


def get_pages_navs_buttons():
    pages = browser.find_elements_by_tag_name("input")
    return [p for p in pages if 'pozycje' in p.get_attribute("title")]


def run(authorsIds, fromYear, toYear):
    file = open('result.txt', 'w', encoding='utf8')
    for authorId in authorsIds:
        sum_points = 0
        pubs_list_filtered_url = 'https://bpp.agh.edu.pl/autor/?idA={0}&idform=1&afi=1&f1Search=1&fodR={1}&fdoR={2}&fagTP=0&fagPM=on'.format(
            authorId, fromYear, toYear)
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
                    paperId, authorId))
            points_string = browser.find_element_by_class_name('ocena-pktm').text.split(':')[1]
            points = float(points_string)
            sum_points += points

        log = '{0:60s}: {1}'.format(author_name, sum_points)
        print(log)
        log = '{0}\t{1}'.format(author_name, sum_points)
        file.write(log + "\n")
    browser.quit()
    file.close()


if __name__ == "__main__":
    ################### PARAMS ####################
    fromYear = 2017
    toYear = 2018
    faculty = 2     # WIMiIP
    department = 'WIMiIP-kism'
    ###############################################

    print('Fetching faculty staff... ')
    authorsIds = get_authors_ids(faculty, department)
    # authorsIds = ['05854']
    run(authorsIds, fromYear, toYear)
