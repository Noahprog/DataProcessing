#!/usr/bin/env python
# Name: Noah van Grinsven
# Student number: 10501916
"""
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
"""

import csv
import re
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    """
    Extract a list of highest rated TV series from DOM (of IMDB page).
    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RATED TV-SERIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.

    # initiate array for tvseries
    tvseries = []

    # iterate over movies on IMDB URL
    seriesblocks = dom.find_all("div", class_="lister-item mode-advanced")
    for seriesblock in seriesblocks:

        # initiate list per tvseries
        series = []

        # get titles
        title = seriesblock.find("h3", class_="lister-item-header").a.string

        # get rating
        ratingblock = seriesblock.find("div", class_="inline-block ratings-imdb-rating")
        rating = ratingblock['data-value']

        # get genre
        genreblock = seriesblock.find("span", class_="genre")
        genre = genreblock.string.strip()

        # get actors/actresses
        actorsblock = seriesblock.find("div", class_="lister-item-content")
        actors = []
        actorsblock2 = actorsblock.find_all("p")[2].find_all("a")
        for actorsblock in actorsblock2:
            actors.append(actorsblock.string)

        # get runtime
        runtime = seriesblock.find("span", class_="runtime").string
        runtimeint = re.findall('\d+', runtime)[0]

        # create comma-separated string for series and add to tvseries array
        # series.append(",".join([title, rating, genre, ",".join(actors), runtimeint]))
        series = [title, rating, genre, ",".join(actors), runtimeint]
        tvseries.append(series)

    return tvseries   # REPLACE THIS LINE AS WELL AS APPROPRIATE


def save_csv(outfile, tvseries):
    """
    Output a CSV file containing highest rated TV-series.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE TV-SERIES TO DISK
    writer.writerows(tvseries)


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, tvseries)