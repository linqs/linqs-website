import json
import os
import re

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
        if (required_key in data):
            if (len(data[required_key]) != 0):
                for nested_data in data[required_key]:
                    for (nested_key, nested_value) in required_value.items():
                        if (nested_key not in nested_data):
                            errors.append("Required key ('%s') not found in %s." % (nested_key, filename))
                            continue

                        elif (type(nested_data[nested_key]) not in required_value[nested_key]):
                            errors.append("Incorrect type ('%s') found in %s." % (nested_key, filename))
                            continue

            else:
                errors.append("At least one '%s' is required in %s." % (required_key, filename))
                continue

        else:
            errors.append("Required key ('%s') not found in %s." % (required_key, filename))
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

def checkPubs(pubs_dir):
    seenResources = set()
    errors = []

    venues = loadVenues()

    for dirent in sorted(os.listdir(pubs_dir)):
        path = os.path.join(pubs_dir, dirent)

        if (not os.path.isfile(path) or not path.endswith('.json')):
            errors.append("All items in the pubs directory (%s) should be .json files, found '%s'." % (pubs_dir, dirent))
            continue

        with open(path, 'r') as file:
            data = json.load(file)

        errors += validateEntry(dirent, data, venues, seenResources)

    if (pubs_dir == PUBS_DIR):
        errors += validateResources(seenResources)

    return errors
