import json
import os

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


# Function to retrieve and validate cookies from environment variables
def get_cookies():
    cookies = {
        "cookiesession1": os.getenv("COOKIESESSION1"),
        "refresh_token": os.getenv("REFRESH_TOKEN"),
        "role": os.getenv("ROLE"),
        "token": os.getenv("TOKEN"),
        "roleResourceId": os.getenv("roleResourceId"),
    }

    # Check if any cookie is missing
    for key, value in cookies.items():
        if value is None:
            raise ValueError(f"Missing environment variable for {key}")

    return cookies


def get_badap_api_response(url):
    cookies = get_cookies()
    response = requests.get(url, cookies=cookies)

    if response.status_code != 200:
        raise Exception(
            f"Failed to retrieve BADAP data {url}. Status code: {response.status_code}"
        )

    return response.json()


def get_next_data(url):
    cookies = get_cookies()
    response = requests.get(url, cookies=cookies)

    if response.status_code != 200:
        raise Exception(
            f"Failed to retrieve the page. Status code: {response.status_code}"
        )

    soup = BeautifulSoup(response.content, "html.parser")

    script_tag = soup.find("script", id="__NEXT_DATA__")

    if script_tag is None:
        raise Exception("No __NEXT_DATA__ script tag found on the page")

    json_data = script_tag.string
    data = json.loads(json_data)

    # There is also additional API status check in props.pageProps.error
    error = data.get("props", {}).get("pageProps", {}).get("error")
    if error:
        raise Exception(f"Error in the API response {url}: {error}")

    return data


def get_issn_from_crossref(doi):
    if doi is None:
        return None

    url = f"http://api.crossref.org/works/{doi}/transform/application/json"
    response = requests.get(url)

    if response.status_code != 200:
        return None

    data = response.json()
    # check if issn is present in the response
    if "ISSN" not in data:
        return None

    # check if array
    if not isinstance(data.get("ISSN"), list):
        print("ISSN is not a list: ", data.get("ISSN"))
        return None

    issn = data.get("ISSN")[0]
    return issn
