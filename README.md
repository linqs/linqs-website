[![Build Status](https://travis-ci.com/linqs/linqs-website.svg?branch=master)](https://travis-ci.com/linqs/linqs-website)

# LINQS Website

This repository is the canonical reference for publications and datasets of the [LINQS machine learning lab](https://linqs.soe.ucsc.edu/) headed by Dr. Lise Getoor.

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

## Adding a Dataset

Adding a dataset is similar in process to adding a publication, and in many cases before you add your dataset you should add the publication that your dataset is published in first.

There are four steps to adding your dataset:
1) Add the datasets resources.
2) Add the JSON file describing the datasets publication (note: this is different than for publications!) 
3) Add the JSON file describing the dataset.
4) Validate your dataset.

Ensure that all files you add are named appropriately. Datasets follow the `<name>.json` convention, while publications follow the convention spelled out above.

### Adding the Datasets Resources

Dataset files are hosted at [https://linqs-data.soe.ucsc.edu/public/datasets/](https://linqs-data.soe.ucsc.edu/public/datasets/). 
To add your files simply ssh into a server then navigate to `/projects/linqs/www/public/datasets/`, create a directory called `<name-of-dataset>`, and add a *compressed* version of your dataset with the same name as the directory you just created. 

### Adding the Publication JSON

#### Your Dataset is Published in a LINQS Publication

If your dataset is published in a LINQS publication, then at this point in the process you should follow the directions for adding a LINQS publication.
Once that is completed, you should have a validated publication JSON file in `_data/pubs/`. Now navigate to the `_data/datasets/pubs/` directory and from the command line create a soft link to the publication JSON in `_data/pubs/`. This can be done using the following bash command `ln -s ../../<name-of-pub>.json <name-of-pub>.json`. 

#### Your Dataset is *NOT* Published in a LINQS Publication

If your dataset is *not* published in a LINQS publication, then create a valid publication JSON, but rather than putting it in `_data/pubs/` put it in `_data/datasets/pubs/`. This will need to pass the same validation test as regular publications, so be sure to follow the same formatting.

### Adding the Dataset JSON

Now we can add the information about the dataset itself. First create a file called `<name-of-dataset>.json` in `_data/datasets/metadata/`.
The easiest way to create the content of this file, is by copying one of the existing dataset metadata files.

The following fields are required:
* `title`
* `description`
* `citation`
* `link-info`: `text`, `href`
* `references`: `text`, `href`

The following fields are optional, but should be included unless there is good reason for why you can't:
* `link-info`: `md5`, `size`

#### `title`

This is the title of your dataset. It will be displayed as is.

#### `description`

This description should give a user information about what the dataset is used for, as well as what it contains, and how it was collected.

#### `citation`

The citation is a key into `_data/datasets/pubs/`. It should be the same as the name of the publication file you want rendered as bibtex.

#### `link-info`

This should be a JSON list. It is required to have at least one element in the list. Each element is itelf a JSON object including `text` which will be displayed on the website, 
`href` which should point to the link the dataset can be obtained at (usually `https://linqs-data.soe.ucsc.edu/public/datasets/<name-of-dataset>/<name-of-dataset>.tar.gz`), 
`md5` which is the MD5 hash of the file at `href`, and `size` which is the size of the file at `href`.
    
If your dataset is hosted on a server that LINQS does not have access to, it is not required to have the md5 and the size. Otherwise refer to the following sections, which give instructions for the MD5 and the size.

##### Computing the MD5

The MD5 is used for confirming the correctness of the dataset that a potential user has downloaded. It is a function of the data, so if the data changes so will the MD5 and a wary user will be able to catch the error.

To calculate it navigate to the location of the compressed dataset and enter `md5sum <name-of-compressed-dataset-file>` into a terminal. Copy the hex string and paste it into the `md5` field.

##### Computing the size

The size should be the size in bytes of the compressed dataset. To calculate it navigate to the location of the compressed dataset and enter `ls -l <name-of-compressed-dataset-file>` into a terminal. The size is the number before the date.

#### `references`

This should be a JSON list. It is required to have at least one element in the list. Each element is itelf a JSON object including `href` which is the link to the paper (note: if it is a LINQS publication it should be `/assets/*`.) and `text` which is the text displayed. Look at other examples of `text` to get the formatting right.

### Validating Your Dataset

To validate your dataset's entry before you commit it, you can run the [/_scripts/validateDatasets.py](_scripts/validateDatasets.py) script.
This script will also be run as part of the continuous integration (CI) for this repository.
If this script reports an error during CI you (and Eriq!) should get an email.

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
