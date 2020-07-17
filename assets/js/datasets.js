'use strict';

window.linqs = window.linqs || {};
window.linqs.pubs = window.linqs.pubs || {};
window.linqs.datasets = window.linqs.datasets || {};
window.linqs.datapubs = window.linqs.datapubs || {};

// Modified from pubs.js
window.linqs.datasets.index = function(pub, id) {
    let authors = {};

    pub['_id'] = id;

    // Cleanup the venue.

    if (!pub.venue) {
        pub.venue = 'Unknown Venue';
    }

    // Check if this is a known venue.
    if (pub.venue in window.linqs.pubs.venues) {
        let knownVenue = window.linqs.pubs.venues[pub.venue];

        // Set a special id, and add the shortname to the display name.
        pub['_venue'] = knownVenue.id;

        if (knownVenue.shortname) {
            pub['_venue_shortname'] = knownVenue.shortname;
            pub.venue += ` (${knownVenue.shortname})`;
        } else {
            pub['_venue_shortname'] = pub.venue;
        }
    } else {
        // Just use the clean venue as the venue id.
        pub['_venue'] = window.linqs.pubs.cleanId(pub.venue);
        pub['_venue_shortname'] = pub.venue;
    }

    // Cleanup the type

    // Translate types from our general types, to bibtex.
    if (pub.type == 'conference') {
        pub.type = 'inproceedings';
    } else if (pub.type == 'tutorial') {
        pub.type = 'misc';

        // Put a note in the bibtex for tutorials.
        if (!pub.note) {
            pub.note = '';
        }
        pub.note = (pub.note.trim() + ' Tutorial').trim();
    }

    // Cleanup the year.

    if (!pub.year) {
        pub.year = 0;
    }
    pub.year = parseInt(pub.year, 10);

    // Cleanup and index the authors.

    pub['_authorIDs'] = [];
    pub.authors.forEach(function(authorName) {
        authorName = window.linqs.pubs.cleanText(authorName);

        let nameParts = authorName.split(' ');
        let authorId = window.linqs.pubs.cleanId(authorName);

        pub['_authorIDs'].push(authorId);

        if (authorId in authors) {
            return;
        }

        authors[authorId] = {
            'displayName': authorName,
            'firstName': nameParts[0],
            'lastName': nameParts[nameParts.length - 1],
            'sortName': `${nameParts[nameParts.length - 1]}-${nameParts[0]}-${authorId}`.toLowerCase(),
        }
    });

    pub['_sortAuthor'] = authors[pub['_authorIDs'][0]]['sortName']

    window.linqs.pubs.authors = authors;
}

window.linqs.datasets.bibtex = function(pub, id) {
    window.linqs.datasets.index(pub, id);
    return window.linqs.pubs.bibtex(pub);
};

window.linqs.datasets.size = function (size) {
    let sizes = ["B", "K", "M", "G", "T"];

    let i = 0;
    while (i < sizes.length && size >= 1000) {
        size = size / 1000.0;
        i++;
    }

    return '(' + size.toFixed(1).toString().replace('.0', '') + sizes[i] + ')';
}

window.linqs.datasets.makeFullDataset = function(dataset) {
    let title = dataset['title'];

    let citationKey = dataset['citation-key'];

    let pub = window.linqs.datapubs.pubs[citationKey];
    let citation = window.linqs.datasets.bibtex(pub, citationKey);

    let description = dataset['description'];

    let downloadInfo = dataset['download-info'];
    let downloadInfoHTML = '';

    downloadInfo.forEach(function(download, i) {
        let text = download["text"];
        let link = download['download-link'];
        let md5 = download['md5'];
        let size = window.linqs.datasets.size(download['size']);

        let downloadTemplate = `
            <div class='download-full'>
                <div class='download-link'>
                    <a href='${link}'>${text} ${size}</a>
                </div>
                <div class='hash'>
                    <p>${md5}</p>
                </div>
            </div>
        `;

        downloadInfoHTML += downloadTemplate;

    });

    let references = dataset['references'];
    let referencesHTML = '';

    references.forEach(function(reference, i) {
        let refLink = reference['link'];
        let refText = reference['text'];
        let referenceTemplate = `
            <p><a href='${refLink}'>${refText}</a></p>
        `;

        referencesHTML += referenceTemplate;
    });

    let templateString = `
        <div class='dataset-full'>
            <div class='top'>
                <div class='title'>
                    <h1>${title}</h1>
                </div>
                <div class='downloads-full'
                    ${downloadInfoHTML}
                </div>
            </div>
            <div class='description'>
                ${description}
            </div>
            <div class='citation'>
                <p>If you use this dataset, please use this citation.</p>
                <pre>${citation}</pre>
            </div>
            <div class='references'>
                <div class='related'>
                    <h2>Related Papers</h2>
                </div>
                ${referencesHTML}
            </div>
        </div>
    `;

    document.querySelector('.datasets').innerHTML = templateString;
};

window.linqs.datasets.makeStubDatasets = function() {
    let stubs = '<p>These datasets are made available and are often used by the LINQS Lab in our publications. We use them to test new, interesting methods to solve collective prediction problems, and we hope you will find them useful too!</p>';

    Object.keys(window.linqs.datasets.datasets).sort().forEach(function(key) {

        let dataset = window.linqs.datasets.datasets[key];

        let title = dataset['title'];
        let shortDescription = dataset['description'];
        let link = '#' + key;

        let downloadInfo = dataset['download-info'];
        let downloadInfoHTML = '';

        downloadInfo.forEach(function(download, i) {
            let text = download["text"];
            let link = download['download-link'];
            let size = window.linqs.datasets.size(download['size']);

            let md5 = download['md5'];
            console.log(md5)

            let downloadTemplate = `
                <div class='download-short'>
                    <div class='download-link'>
                        <a href='${link}'>${text} ${size}</a>
                    </div>
                    <div class='hash'>
                        <p>${md5}</p>
                    </div>
                </div>
            `;

            downloadInfoHTML += downloadTemplate;

        });

        stubs += `
            <div class='dataset-stub'>
                <div class='title'>
                    <h1><a href='${link}'>${title}</a></h1>
                </div>
                <div class='short-description'>
                    ${shortDescription}
                </div>
                <div class='downloads-short'
                    ${downloadInfoHTML}
                </div>
            </div>
        `;
    });

    document.querySelector('.datasets').innerHTML = stubs;
};

window.linqs.datasets.display = function() {

    let datasetID = location.hash.trim().replace(/^#/, '');

    if (datasetID === '')
        window.linqs.datasets.makeStubDatasets();
    else {
        if (window.linqs.datasets.datasets.hasOwnProperty(datasetID)) {
            window.linqs.datasets.makeFullDataset(window.linqs.datasets.datasets[datasetID]);
        }
        else {
            window.linqs.datasets.makeStubDatasets();
        }
    }
};