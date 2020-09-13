#!/usr/bin/env python3

"""
Validate all the publication entries.
"""

import os
import sys
import traceback

import utils

THIS_DIR = os.path.abspath(os.path.dirname(os.path.realpath(__file__)))
ROOT_DIR = os.path.abspath(os.path.join(THIS_DIR, '..'))
PUBS_DIR = os.path.abspath(os.path.join(ROOT_DIR, '_data', 'pubs'))

def main():
    errors = []

    try:
        errors += utils.checkPubs(PUBS_DIR)
        
    except Exception as ex:
        errors.append("Caught exception while checking for pub errors: " + str(ex))
        print(traceback.format_exc())

    if (len(errors) > 0):
        print("Errors found while parsing pubs:")
        for error in errors:
            print("   " + error)
        sys.exit(1)
    else:
        print("No errors found while parsing pubs.")

if (__name__ == '__main__'):
    main()
