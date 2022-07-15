#!/usr/bin/env python3

"""
Validate general site information.
"""

import datetime
import os
import re
import sys

THIS_DIR = os.path.abspath(os.path.dirname(os.path.realpath(__file__)))
BASE_DIR = os.path.join(THIS_DIR, '..')

FOOTER_PATH = os.path.join(BASE_DIR, '_includes', 'footer.html')

def checkFooter():
    errors = []
    with open(FOOTER_PATH, 'r') as file:
        for line in file:
            match = re.search(r'(20\d\d) LINQS Research Group', line)
            if (match is not None):
                year = int(match.group(1))
                currentYear = datetime.date.today().year

                if (year != currentYear):
                    errors.append("Invalid year in footer. Expected: %d, found: %d." % (currentYear, year))

    return errors

def main():
    errors = []

    errors += checkFooter()

    if (len(errors) > 0):
        print("Errors found while checking site:")
        for error in errors:
            print("   " + error)
        sys.exit(1)
    else:
        print("No errors found while checking site.")

if (__name__ == '__main__'):
    main()
