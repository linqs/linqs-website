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
DATASETS_DIR = os.path.abspath(os.path.join(ROOT_DIR, '_data', 'datasets'))

REQUIRED_KEY_TYPES = {
	'title': [str],
	'description': [str],
	'citation-key': [str],
}

REQUIRED_NESTED_KEY_TYPES = {
	'download-info': { 'text': [str], 'download-link': [str] },
	'references': { 'link': [str], 'text': [str] }
}

# If one exists, both must exists.
OPTIONAL_NESTED_KEY_TYPES = {
	'download-info': { 'md5': [str], 'size': [int] }
}

def validateOptionalNestedKeys(filename, data):
	errors = []

	for (key, value) in OPTIONAL_NESTED_KEY_TYPES.items():
		if (key not in data):
			continue
		else:
			if (len(data[key]) == 0):
				continue
			else:
				for nested_data in data[key]:
					has_keys = []
					hasnt_keys = []
					num_keys = len(OPTIONAL_NESTED_KEY_TYPES[key].items())

					for (nested_key, nested_value) in OPTIONAL_NESTED_KEY_TYPES[key].items():
						if (nested_key in nested_data):
							has_keys.append(nested_key)
							if (type(nested_data[nested_key]) not in OPTIONAL_NESTED_KEY_TYPES[key][nested_key]):
								errors.append("Incorrect type ('%s') found in %s." % (nested_key, filename))
								continue
						else:
							hasnt_keys.append(nested_key)

					if (len(has_keys) != 0 and len(has_keys) != num_keys):
						errors.append("Optional keys must either be all included or all excluded. Found %s but not %s in %s." % (", ".join(has_keys), ",".join(hasnt_keys), filename))

	return errors

def validateRequiredNestedKeys(filename, data):
	errors = []

	for (key, value) in REQUIRED_NESTED_KEY_TYPES.items():
		if (key not in data):
			errors.append("Required key ('%s') not found in %s." % (key, filename))
			continue
		else:
			if (len(data[key]) == 0):
				errors.append("At least one '%s' is required in %s." % (key, filename))
				continue
			else:
				for nested_data in data[key]:
					for (nested_key, nested_value) in REQUIRED_NESTED_KEY_TYPES[key].items():
						if (nested_key not in nested_data):
							errors.append("Required key ('%s') not found in %s." % (nested_key, filename))
							continue
						else:
							if (type(nested_data[nested_key]) not in REQUIRED_NESTED_KEY_TYPES[key][nested_key]):
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
