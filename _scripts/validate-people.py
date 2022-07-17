#!/usr/bin/env python3

"""
Validate all the people entries.
"""

import json
import os
import sys
import traceback

import utils

PEOPLE_DIR = os.path.abspath(os.path.join(utils.ROOT_DIR, '_data', 'people'))

KEY_TYPE = 'type'
ALLOWED_TYPES = ['advisor', 'postdoc', 'phd', 'ms', 'undergrad', 'alum', 'visitor']

KEY_ALL = 'all'
REQUIRED_KEYS = {
    KEY_ALL: [
        KEY_TYPE,
        'name',
        'image',
        'email',
    ],
    'advisor': [
        'room',
        'homepage',
        'research',
    ]
}
REQUIRED_KEYS['postdoc'] = REQUIRED_KEYS['advisor']
REQUIRED_KEYS['phd'] = REQUIRED_KEYS['advisor']
REQUIRED_KEYS['ms'] = REQUIRED_KEYS['advisor']

def validateRequiredKeys(filename, data):
    errors = []

    if (KEY_TYPE not in data):
        return ["Required key ('%s') not found in %s." % (KEY_TYPE, filename)]

    if (data[KEY_TYPE] not in ALLOWED_TYPES):
        return ["Unknown type ('%s') found in %s." % (data[KEY_TYPE], filename)]

    requiredKeys = list(REQUIRED_KEYS[KEY_ALL])
    if (data[KEY_TYPE] in REQUIRED_KEYS):
        requiredKeys += REQUIRED_KEYS[data[KEY_TYPE]]

    for key in requiredKeys:
        if (key not in data):
            errors.append("Required key ('%s') not found in %s." % (key, filename))
            continue

    return errors

def checkPeople():
    errors = []

    for entry in sorted(os.listdir(PEOPLE_DIR)):
        path = os.path.join(PEOPLE_DIR, entry)

        if (not os.path.isfile(path) or not path.endswith('.json')):
            errors.append("All items in the people directory (%s) should be .json files, found '%s'." % (PEOPLE_DIR, entry))
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
        errors += checkPeople()
    except Exception as ex:
        errors.append("Caught exception while checking for people errors: " + str(ex))
        print(traceback.format_exc())

    if (len(errors) > 0):
        print("Errors found while parsing people:")
        for error in errors:
            print("   " + error)
        sys.exit(1)
    else:
        print("No errors found while parsing people.")

if (__name__ == '__main__'):
    main()
