# Noah van Grinsven
# 10501916
# week 3

# convert csv to json format
import csv
import json

# specific values
def csv2json(filename):
    csvfilename = filename
    jsonfilename = csvfilename.split('.')[0] + '.json'
    delimiter = ";"

    # open and read csv file
    with open(filename, 'r') as csvfile:
        reader = csv.DictReader(csvfile, delimiter = delimiter)
        data = list(reader)

    # open and write to json
    with open(jsonfilename, 'w') as jsonfile:
        json.dump(data, jsonfile, indent = 2)

# convert csv file
csv2json('hpi-data-2016-use.csv')
