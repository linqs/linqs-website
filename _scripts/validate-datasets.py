#!/usr/bin/env python3

"""
Validate all the publication entries.
"""

import json
import os
import re
import sys
import traceback

import "validate-pubs.py" as vp

THIS_DIR = os.path.abspath(os.path.dirname(os.path.realpath(__file__)))
ROOT_DIR = os.path.abspath(os.path.join(THIS_DIR, '..'))
RESOURCES_DIR = os.path.abspath(os.path.join(ROOT_DIR, 'assets', 'resources'))
DATASETS_DIR = os.path.abspath(os.path.join(ROOT_DIR, '_data', 'datasets'))
DATAPUBS_PATH = os.path.abspath(os.path.join(ROOT_DIR, '_data', 'datapubs'))

def checkDatapubs():
    pass

def checkDatasets():
    pass

def main():
    errors = []

    try:
        errors += checkDatasets()
    except Exception as ex:
        errors.append("Caught exception while checking for dataset errors: " + str(ex))
        print(traceback.format_exc())

    if (len(errors) > 0):
        print("Errors found while parsing datasets:")
        for error in errors:
            print("   " + error)
        sys.exit(1)
    else:
        print("No errors found while parsing pubs.")

if (__name__ == '__main__'):
    main()
