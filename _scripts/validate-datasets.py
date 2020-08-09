#!/usr/bin/env python3

"""
Validate all the publication entries.
"""

import json
import os
import re
import sys
import traceback

import utils

THIS_DIR = os.path.abspath(os.path.dirname(os.path.realpath(__file__)))
ROOT_DIR = os.path.abspath(os.path.join(THIS_DIR, '..'))
DATASETS_DIR = os.path.abspath(os.path.join(ROOT_DIR, '_data', 'datasets', 'metadata'))
PUBS_DIR = os.path.abspath(os.path.join(ROOT_DIR, '_data', 'datasets', 'pubs'))

LINQS_DATA_SERVER = 'https://linqs-data.soe.ucsc.edu/public/'

REQUIRED_KEY_TYPES = {
    'title': [str],
    'description': [str],
    'citation': [str],
    'link': [list],
    'references': [list]
}

def validateSoftLinks(softlinks, filename):
    errors = []

    for softlink in softlinks:
        softlink_path = os.path.join(PUBS_DIR, softlink + '.json')

        if (not os.path.isfile(softlink_path)):
            errors.append("Soft link ('%s') not found in %s." % (softlink_path, filename))

    return errors

def validateLinks(links, filename):
    errors = []

    for link in links:
        keys = link.keys()

        if ('text' not in keys):
            errors.append("Required key ('text') not found in %s." % (filename))

        if ('href' not in keys):
            errors.append("Required key ('href') not found in %s." % (filename))
            continue

        elif (link['href'].startswith(LINQS_DATA_SERVER)):
            if ('md5' not in keys):
                errors.append("Key ('md5') required in LINQS hosted datasets, not found in %s." % (filename))

            if ('size' not in keys):
                errors.append("Key ('size') required in LINQS hosted datasets, not found in %s." % (filename))

    return errors

def validateRequiredKeys(filename, data):
    errors = []

    for (key, types) in REQUIRED_KEY_TYPES.items():
        if (key not in data):
            errors.append("Required key ('%s') not found in %s." % (key, filename))
            continue

        elif (type(data[key]) not in REQUIRED_KEY_TYPES[key]):
            errors.append("Incorrect type ('%s') found in %s." % (key, filename))
            continue

        elif (key == 'citation'):
            errors += validateSoftLinks([data['citation']], filename)

        elif (key == 'link'):
            errors += validateLinks(data['link'], filename)

        elif (key == 'references'):
            errors += validateSoftLinks(data['references'], filename)

    return errors

def checkDatasets():
    errors = []

    for entry in sorted(os.listdir(DATASETS_DIR)):
        path = os.path.join(DATASETS_DIR, entry)

        if (not os.path.isfile(path) or not path.endswith('.json')):
            errors.append("All items in the datasets directory (%s) should be .json files, found '%s'." % (DATASETS_DIR, entry))
            continue

        try:
            with open(path, 'r') as file:
                data = json.load(file)
        except:
            errors.append("Bad json in (%s)" % entry)
            continue

        errors += validateRequiredKeys(entry, data)
        
    return errors

def main():
    errors = []

    try:
        errors += checkDatasets()
        errors += utils.checkPubs(PUBS_DIR)

    except Exception as ex:
        errors.append("Caught exception while checking for dataset errors: " + str(ex))
        print(traceback.format_exc())

    if (len(errors) > 0):
        print("Errors found while parsing datasets:")
        for error in errors:
            print("   " + error)
        sys.exit(1)

    else:
        print("No errors found while parsing datasets.")

if (__name__ == '__main__'):
    main()
