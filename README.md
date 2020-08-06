[![Build Status](https://travis-ci.com/linqs/linqs-website.svg?branch=master)](https://travis-ci.com/linqs/linqs-website)

# LINQS Website

This repository is the canonical reference for publications and datasets of the [LINQS machine learning lab](https://linqs.soe.ucsc.edu/) headed by Dr. Lise Getoor.

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
