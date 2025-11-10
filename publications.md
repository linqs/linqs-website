## Adding a Publication

There are three steps when adding a new publication to this repository:
1) Add the publication's resources.
2) Add the JSON file describing the publication.
3) Validate your new entry.

Ensure that all files you add are named appropriately: `<first author last name>-<venue id><last two digits of year>`.
If there are multiple entries that have the same name, suffix a letter (a, b, c, ...) indicating the ordering of the entries.
A venue's ID can be found in the [/_data/config/venues.json](_data/config/venues.json) file.

One thing to remember is that we build and maintain this tool ourselves, so we can change **anything** about it.
If you are unhappy with something, then look at the code and talk to the Pubs Tsar.

### Adding the Resources

Resources refer to any artifacts that accompany a publication.
The most common resource is the actual paper for the publication, but can also include things like slides or posters.
Datasets and experiment code are not to be hosted in this repository.
Strongly prefer a PDF format for all resources (especially slides).

All resources should go in the [/assets/resources](assets/resources) directory.
The paper should be named: `<first author last name>-<venue id><last two digits of year>.pdf`.
Additional materials should be named the same, but suffixed with the type of additional resource.

For example, if Sammy the Slug published a paper at AAAI in 2020 and also made a poster, then they would add two resources:
```
/assets/resources/sammy-aaai20.pdf
/assets/resources/sammy-aaai20-poster.pdf
```

### Adding the JSON

The JSON file describes all the information we need to both display the publication and generate the BibTeX.
There are several core fields that we will cover below.
Refer to [/_scripts/validatePubs.py](_scripts/validatPubs.py) for a full list of all the supported fields.

The easiest way to get started is to copy the JSON from and existing publication that is similar to yours.
But, make sure that you change all the relevant fields.

#### `type`

`type` determines how we treat the entry and what BibTeX entry type is chosen:
- `article` -- A journal article.
- `book` -- A full book.
- `conference` -- A conference/workshop paper.
- `inbook` -- A section/chapter in a book.
- `phdthesis` -- A PhD Thesis.
- `techreport` -- A technical report.
- `tutorial` -- A tutorial at a conference.
- `unpublished` -- Something like an arXiv paper.

#### `title`

The title of the work as you want it displayed.
We will not mess with the capitalization or formatting of your title.

#### `authors`

All authors of the publication in order.
Enter in author names as you want them displayed.
Use natural ordering (FML) for all names, do not use commas.

It is important that you use consistent naming across publications,
so we can link all your papers together.
In the case of shared authorship, you can suffix the author name with a star to denote the shared authors.

#### `venue`

This is a single field that represents where an item was published.
This translates to different BibTeX fields for different types.
For example, it will be the `journal` field for `article` entries and the `booktitle` field for conference/inproceding entries.

Use consistent names for venues.
All conference/workshop/journal venues must be in the [/_data/config/venues.json](_data/config/venues.json) file.
If your the validation reports an unknown venue, then you may have to enter it into this file (or you mistyped it).
If the venue in this file has a `shortname` field, then the pubs system will include that shortname for the venue in the listing and BibTeX.

#### `year`

The year the publication was published.

#### `publisher`

The organization that published (made available) this publication.
If you are unsure about who publishes a conference,
check for previous years of that conference or where the proceedings for that conference are available.

#### `abstract`

You can optionally include an abstract.
By default, we do not include the abstract in the BibTeX, but it is displayed alongside the paper.

#### `links`

This field contains all the links to different resources associated with this publication.
All the resources you added in the first step will be listed here.
In addition, you can include general web links (to the experiment code, for example).

Links have three fields: `label`, `href`, and `icon`.
Default icons are used for the known label types (`paper`, `poster`, `slides`, `code`, and `link`).
Custom icons can also be used (see [the section below](#using-custom-link-icons)).

### Validating Your Publication's Entry

To validate your publication's entry before you commit it, you can run the [/_scripts/validatePubs.py](_scripts/validatePubs.py) script.
This script will also be run as part of the continuous integration (CI) for this repository.
If this script reports and error during CI you (and Eriq!) should get an email.
