[![Build Status](https://travis-ci.com/linqs/linqs-website.svg?branch=master)](https://travis-ci.com/linqs/linqs-website)

# Publications

This repository is the canonical reference for publications of the [LINQS machine learning lab](https://linqs.soe.ucsc.edu/) headed by Dr. Lise Getoor.

## Adding a Publication

There are three steps when adding a new publication to this repository:
1) Add the publication's resources.
2) Add the JSON file describing the publication.
3) Validate you new entry.

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
Refer to [/_scripts/validate-pubs.py](_scripts/validate-pubs.py) for a full list of all the supported fields.

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

### Validating Your Entry

To validate you entry before you commit it, you can run the [/_scripts/validate-pubs.py](_scripts/validate-pubs.py) script.
This script will also be run as part of the continuous integration (CI) for this repository.
If this script reports and error during CI you (and Eriq!) should get an email.

## Using Custom Link Icons

For our link icons, we use icons from [RemixIcons](https://remixicon.com/).
Instead of grabbing the full set of icons, we only grab specific ones.
You can see all the icons we use in the [validation script](_scripts/validate-pubs.py).
New icons can be added to the [/assets/style/vendor/remixicon.symbol.svg](assets/style/vendor/remixicon.symbol.svg) file.

By default, we use preset icons for links that have the types:
- paper
- poster
- slides
- code
- link

To use a custom icon, just supply the `icon` field to your link object and use one of the supported icon labels.
For example:
```json
{
    "label": "book",
    "href": "/assets/resources/sammy-book20.pdf",
    "icon": "book-line"
}
```

## Building the Site Locally

To build our site, we use the [Jekyll framework](https://jekyllrb.com/).
Jekyll should be pretty simple to setup.
There are many resources on the internet to get you started, most notably the [Jekyll website itself](https://jekyllrb.com/docs/step-by-step/01-setup/).

Here are my quick install steps (I only run Linux, so you may have to consult a more through guide for your OS):
1) First, you need to have `ruby` installed. Along with ruby comes its package manager `gem`.
2) Install `bundler` (which handles building the project) and `jekyll` using gem: `gem install bundler jekyll`.
3) Build the site in the repository's root: `bundle exec jekyll serve`. This will build the site and launch a local webserver, so you can open it in a browser.
4) Open a web browser and go to the site: http://localhost:4000 . The website will automatically update/rebuild with any changes you make.
