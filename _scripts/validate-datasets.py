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
}

REQUIRED_NESTED_KEY_TYPES = {
    'link': { 'href': [str], 'text': [str] },
    'references': { 'href': [str], 'text': [str] }
}

# If one exists, both must exists.
OPTIONAL_NESTED_KEY_TYPES = {
    'link': { 'md5': [str], 'size': [int] }
}

def validateOptionalNestedKeys(filename, data):
    errors = []

    for (optional_key, optional_value) in OPTIONAL_NESTED_KEY_TYPES.items():
        if (optional_key not in data):
            continue

        else:
            for nested_data in data[optional_key]:
                keys_present = set()

                for (nested_key, nested_value) in optional_value.items():
                    if (nested_key in nested_data):
                        keys_present.add(nested_key)
                        if (type(nested_data[nested_key]) not in optional_value[nested_key]):
                            errors.append("Incorrect type ('%s') found in %s." % (nested_key, filename))
                            continue

                num_keys = len(optional_value.items())
                keys_absent = set(optional_value.keys()).difference(keys_present)

                if (len(keys_present) != 0 and len(keys_present) != num_keys):
                    errors.append("Optional keys must either be all included or all excluded. Found %s but not %s in %s." % (", ".join(keys_present), ",".join(keys_absent), filename))

    return errors

def validateRequiredNestedKeys(filename, data):
    errors = []

    for (required_key, required_value) in REQUIRED_NESTED_KEY_TYPES.items():
        if (not required_key in data):
            errors.append("Required key ('%s') not found in %s." % (required_key, filename))
            continue

        elif (len(data[required_key]) == 0):
            errors.append("At least one '%s' is required in %s." % (required_key, filename))
            continue

        else:
            for nested_data in data[required_key]:
                for (nested_key, nested_value) in required_value.items():
                    if (nested_key not in nested_data):
                        errors.append("Required key ('%s') not found in %s." % (nested_key, filename))
                        continue

                    elif (type(nested_data[nested_key]) not in required_value[nested_key]):
                        errors.append("Incorrect type ('%s') found in %s." % (nested_key, filename))
                        continue

    return errors

def validateRequiredKeys(filename, data):
    errors = []

    for (key, types) in REQUIRED_KEY_TYPES.items():
        if (key not in data):
            errors.append("Required key ('%s') not found in %s." % (key, filename))
            continue

        else:
            if (type(data[key]) not in REQUIRED_KEY_TYPES[key]):
                errors.append("Incorrect type ('%s') found in %s." % (key, filename))
                continue

    citation_path = os.path.join(PUBS_DIR, data['citation'] + '.json')

    if (not os.path.isfile(citation_path)):
        errors.append("Citation ('%s') not found in %s." % (citation_path, filename))

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
        errors += validateRequiredNestedKeys(entry, data)
        errors += validateOptionalNestedKeys(entry, data)

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
            print(error)
            print("   " + error)
        sys.exit(1)
    else:
        print("No errors found while parsing datasets.")

if (__name__ == '__main__'):
    main()
