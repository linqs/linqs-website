#!/usr/bin/env python3

"""
Validate all the publication entries.
"""

import json
import os
import re
import sys
import traceback

THIS_DIR = os.path.abspath(os.path.dirname(os.path.realpath(__file__)))
ROOT_DIR = os.path.abspath(os.path.join(THIS_DIR, '..'))
RESOURCES_DIR = os.path.abspath(os.path.join(ROOT_DIR, 'assets', 'resources'))
PUBS_DIR = os.path.abspath(os.path.join(ROOT_DIR, '_data', 'pubs'))
VENUES_PATH = os.path.abspath(os.path.join(ROOT_DIR, '_data', 'config', 'venues.json'))

ALLOWED_TYPES = {'article', 'book', 'conference', 'inbook', 'phdthesis', 'techreport', 'tutorial', 'unpublished'}

ALLOWED_ICONS = {
    'article-line', 'book-line', 'braces-line', 'close-circle-fill',
    'close-circle-line', 'close-fill', 'close-line', 'code-line',
    'double-quotes-r', 'file-line', 'file-text-line', 'git-repository-line',
    'image-line', 'link', 'mail-line', 'profile-line',
    'slideshow-line', 'video-line', 'video',
}

REQUIRED_KEYS = [
    'type',
    'authors',
    'title',
    'year',
    'venue',
    'publisher',
]

# Keys (outside of REQUIRED_KEYS) that are required for specific types.
TYPE_FIELDS = {
    'article': {'number', 'pages', 'volume'},
    'book': {'edition'},
    'conference': {'address'},
    'inbook': {'edition', 'editor', 'pages'},
    'phdthesis': {'address'},
    'techreport': set(),
    'tutorial': {'address'},
    'unpublished': set(),
}

# Also doubles as the allowed keys.
KEY_TYPES = {
    'abstract': [str],
    'address': [str],
    'authors': [list],
    'chapter': [int, str],
    'doi': [str],
    'edition': [int, str],
    'editor': [str],
    'links': [list],
    'keywords': [list],
    'note': [str],
    'number': [int, str],
    'organization': [str],
    'pages': [int, str],
    'publisher': [str],
    'title': [str],
    'type': [str],
    'venue': [str],
    'volume': [int, str],
    'year': [int, str],
}

# Special Venue IDs that depend on the pub's type instead of the pub's venue.
TYPE_VENUE_IDS = {
    'book': 'book',
    'phdthesis': 'phd',
    'techreport': 'techreport',
}

def validateResources(seenResources):
    errors = []

    for dirent in os.listdir(RESOURCES_DIR):
        path = os.path.join(RESOURCES_DIR, dirent)

        if (path not in seenResources):
            errors.append("Found a resource not referenced by any 'link': '%s'." % (path))

    return errors

def validateKeys(data, filename):
    errors = []

    for requiredKey in TYPE_FIELDS[data['type']]:
        if (requiredKey not in data):
            errors.append("File (%s) of type ('%s') does not contain the required field: '%s'." % (filename, data['type'], requiredKey))

    for (key, value) in data.items():
        if (key not in KEY_TYPES):
            errors.append("Unknown key ('%s') found in %s." % (key, filename))
            continue

        typeMatch = False
        for allowedType in KEY_TYPES[key]:
            if (isinstance(value, allowedType)):
                typeMatch = True
                break

        if (not typeMatch):
            errors.append("Incorrect type (%s) for key ('%s') in %s. Allowed types are: %s." % (type(value), key, filename, str(KEY_TYPES[key])))

    return errors

def validateLinks(data, filename, fileBasename, seenResources):
    errors = []

    if ('links' not in data):
        return errors

    for linkData in data['links']:
        if ('icon' in linkData and linkData['icon'] not in ALLOWED_ICONS):
            errors.append("Unkown icon ('%s') in %s." % (linkData['icon'], filename))

        if ('href' not in linkData):
            errors.append("Link does not have a 'href' field in %s." % (filename))
            continue

        href = linkData['href']
        if (href.startswith('/')):
            path = os.path.join(ROOT_DIR, re.sub(r'^/', '', href))

            if (os.path.isfile(path)):
                seenResources.add(path)

                if (fileBasename is not None and not os.path.basename(path).startswith(fileBasename)):
                    errors.append("Resource filename ('%s') has the incorrect basename (found in file %s). Expecting the resource to start with '%s'." % (path, filename, fileBasename))
            else:
                errors.append("Link with an absolute href ('%s') does not point to an existing file in this repo. Found in file '%s'." % (href, filename))
        elif (not href.startswith('http')):
            errors.append("Bad pattern for link 'href', it should be either an absolute path (rooted in this repo's root) or a link starting with 'http'. Got: '%s'." % (href))

    return errors

def getFileBasename(data, venueID):
    firstAuthor = data['authors'][0]
    lastName = firstAuthor.split(' ')[-1]
    filenameLastName = re.sub(r'\*$', '', lastName.lower())

    return "%s-%s%s" % (filenameLastName, venueID, str(data['year'])[-2:])

def validateEntry(filename, data, venues, seenResources):
    errors = []

    for requiredKey in REQUIRED_KEYS:
        if (requiredKey not in data):
            errors.append("Could not find requried key ('%s') in %s." % (requiredKey, filename))

    if ('type' in data and data['type'] not in ALLOWED_TYPES):
        errors.append("Unknown 'type' ('%s') in %s." % (data['type'], filename))

    # Bail early if we do not have all the required keys or don't have a correct type.
    if (len(errors) > 0):
        return errors

    errors += validateKeys(data, filename)

    fileBasename = None

    if (data['type'] in TYPE_VENUE_IDS):
        fileBasename = getFileBasename(data, TYPE_VENUE_IDS[data['type']])
    elif (data['venue'] in venues):
        fileBasename = getFileBasename(data, venues[data['venue']]['id'])

    if (fileBasename is None):
        errors.append("Unknown venue: '%s'. Make sure the spelling is correct or the venues file (%s) is updated." % (data['venue'], VENUES_PATH))
    elif (not re.match(r'%s[a-z]?\.json' % (fileBasename), filename)):
        errors.append("Incorrect file naming ('%s'), expected: '%s[a-z]?.json'." % (filename, fileBasename))

    errors += validateLinks(data, filename, fileBasename, seenResources)

    return errors

def loadVenues():
    venues = {}

    with open(VENUES_PATH, 'r') as file:
        venues = json.load(file)

    for venueName in venues:
        if ('id' not in venues[venueName]):
            raise ValueError("No 'id' key for venue: '%s'." % (venueName))

    return venues

def checkPubs():
    seenResources = set()
    errors = []

    venues = loadVenues()

    for dirent in sorted(os.listdir(PUBS_DIR)):
        path = os.path.join(PUBS_DIR, dirent)

        if (not os.path.isfile(path) or not path.endswith('.json')):
            errors.append("All items in the pubs directory (%s) should be .json files, found '%s'." % (PUBS_DIR, dirent))
            continue

        with open(path, 'r') as file:
            data = json.load(file)

        errors += validateEntry(dirent, data, venues, seenResources)

    errors += validateResources(seenResources)

    return errors

def main():
    errors = []

    try:
        errors += checkPubs()
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
