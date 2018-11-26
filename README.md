# agh-bpp-stats
Simple script to create publication statistics for AGH employees

Uses selenium and chromedriver in headless mode for some strange reason.
It can be easly replaced by BeautifulSoup and request if you want :)

Requires Python 3 and Windows (for Linux you need to replace chromedriver)

## Install

1. Install Python 3
2. Install pipenv: `pip install pipenv` 
3. Install requirements locally: `set PIPENV_VENV_IN_PROJECT=true && pipenv install` 
4. Start shell: `pipenv shell`
5. Run script: `python main.py`

## Config
You can adjust the range of years and department.
Faculty is given by ID (check 'wydz' parameter in BPP index)  
