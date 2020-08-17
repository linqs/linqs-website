'use strict';

window.linqs = window.linqs || {};
window.linqs.datasets = window.linqs.datasets || {};
window.linqs.utils = window.linqs.utils || {};

window.linqs.datasets.references = window.linqs.datasets.references || {};
window.linqs.datasets.metadata = window.linqs.datasets.metadata || {};

window.linqs.datasets.listAuthors = function(pub) {
    let authors = '';

    for (let i = 0; i < pub['authors'].length; i++) {
        let text = pub['authors'][i];

        authors += window.linqs.utils.listAuthor(text, i, pub['authors'], false)
    }

    return authors;
};

window.linqs.datasets.bibtex = function(pub, id) {
    let authors = window.linqs.datasets.listAuthors(pub);
    return window.linqs.utils.bibtex(pub, authors, id);
};

window.linqs.datasets.size = function(size) {
    let sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

    let i = 0;
    while (i < sizes.length && size >= 1024) {
        size = size / 1024.0;
        i++;
    }

    return size.toFixed(2).toString() + " " +sizes[i];
};

window.linqs.datasets.makeDownloadInfo = function(downloads) {
    let downloadInfosHTML = '';

    downloads.forEach(function(download, i) {
        let link = download['href'];
        let text = download["text"];
        let statsHTML = "";

        let sizeRaw = download['size'];
        let md5 = download['md5'];

        if (sizeRaw != null && md5 != null) {
            let size = window.linqs.datasets.size(sizeRaw);

            statsHTML = `
                <div class='size'>
                    (${size})
                </div>
                <div class='hash'>
                    md5: ${md5}
                </div>
            `;
        }

        let downloadInfoHTML = `
            <div class='link-info'>
                <a class='download-link' href='${link}'>${text}</a>
                ${statsHTML}
            </div>
        `;

        downloadInfosHTML += downloadInfoHTML;
    });

    return downloadInfosHTML;
};

window.linqs.datasets.makeReference = function(referenceKey) {
    let reference = window.linqs.datasets.references[referenceKey];
    let authors = window.linqs.datasets.listAuthors(reference);
    let referenceHTML = `
        <a href='${window.linqs.utils.makePubLink(referenceKey)}'>
            <span class='authors'>${authors}.</span>
            <span class='title-link'>${reference['title']}.</span>
            <span class='filter-link venue-link'>${reference['venue']}.</span>
            <span class='filter-link year-link'>${reference['year']}.</span>
        </a>
    `;

    return referenceHTML;
};

window.linqs.datasets.makeReferences = function(references) {
    let referencesList = '';

    references.forEach(function(reference, i) {
        referencesList += window.linqs.datasets.makeReference(reference);
    });

    let referencesHTML = `
        <div class='pubs-list'>
            ${referencesList}
        </div>
    `;

    return referencesHTML;
};

window.linqs.datasets.makeStubDatasets = function() {
    let stubs = `
        <p>
            This page contains datasets used by the LINQS Lab and all exhibit relational structure.
            If you use them, please cite them accordingly.
        </p>
    `;

    Object.keys(window.linqs.datasets.metadata).sort().forEach(function(key) {
        let dataset = window.linqs.datasets.metadata[key];

        let title = dataset['title'];
        let description = dataset['description'];
        let link = '#' + key;
        let infos = dataset['link'];
        let infosHTML = window.linqs.datasets.makeDownloadInfo(infos);

        stubs += `
            <hr />
            <div class='dataset-stub'>
                <div class='title'>
                    <h1><a href='${link}'>${title}</a></h1>
                </div>
                <div class='short-description'>
                    <p>${description}</p>
                </div>
                <div class='info-list'>
                    ${infosHTML}
                </div>
            </div>
        `;
    });

    document.querySelector('.datasets').innerHTML = stubs;
};

window.linqs.datasets.makeFullDataset = function(dataset) {
    let title = dataset['title'];

    let infos = dataset['link'];
    let infosHTML = window.linqs.datasets.makeDownloadInfo(infos);

    let description = dataset['description'];

    let citationKey = dataset['citation'];
    let pub = window.linqs.datasets.references[citationKey];
    let citation = window.linqs.datasets.bibtex(pub, citationKey);

    let references = dataset['references'];
    let referencesHTML = window.linqs.datasets.makeReferences(references)

    let templateString = `
        <div class='dataset-full'>
            <div class='top'>
                <div class='title'>
                    <h1>${title}</h1>
                </div>
                <div class='info-list'>
                    ${infosHTML}
                </div>
            </div>
            <div class='description'>
                <p>${description}</p>
            </div>
            <div class='citation'>
                <p>If you use this dataset, please use the following citation:</p>
                <pre>${citation}</pre>
            </div>
            <div class='references'>
                <div class='related'>
                    <h2>Related Publications</h2>
                </div>
                ${referencesHTML}
            </div>
        </div>
    `;

    document.querySelector('.datasets').innerHTML = templateString;
};

window.linqs.datasets.display = function() {
    let datasetID = location.hash.trim().replace(/^#/, '');

    if (window.linqs.datasets.metadata.hasOwnProperty(datasetID)) {
        window.linqs.datasets.makeFullDataset(window.linqs.datasets.metadata[datasetID]);
    } else {
        window.linqs.datasets.makeStubDatasets();
    }
};
