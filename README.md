# agh-bpp-stats
Simple script to create publication statistics for AGH UST employees.

Uses selenium and chromedriver in headless mode for some strange reason.
It can be easly replaced by BeautifulSoup and request if you want :)

Requires Python 3 and Windows (for Linux you need to replace chromedriver for appropriate version)

## Installation

1. Install Python 3 (if you don't have it already)
2. Install pipenv (if you don't have it already): `pip install pipenv` 
3. Install dependencies: `set PIPENV_VENV_IN_PROJECT=true && pipenv install` 
4. Start shell: `pipenv shell`
5. Run script: `python main.py`

## Config
Some configuration is possible through the parameter section at the bottom of the script.
You can filter by faculty and range of years.
Department is a string - correct value can be get on BPP authors list next to employee name.

## License
You can use this script free of charge.
Please mention this repository if you publish the results or base your work on this project.