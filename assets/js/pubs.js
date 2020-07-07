'use strict';

window.linqs = window.linqs || {};
window.linqs.pubs = window.linqs.pubs || {};

window.linqs.pubs.SORT_KEYS = ['!year', 'title', '_sortAuthor', 'venue'];
window.linqs.pubs.ICON_REL_PATH = '/assets/style/vendor/remixicon.symbol.svg';
window.linqs.pubs.ICON_BIBTEX = 'double-quotes-r';
window.linqs.pubs.ICON_DEFAULT = 'link';
window.linqs.pubs.ICON_MAP = {
    'paper': 'file-text-line',
    'poster': 'image-line',
    'slides': 'slideshow-line',
    'code': 'code-line',
    'link': 'link',
};

window.linqs.pubs.BIBTEX_SORTED_KEYS = [
    // Core.
    'title', 'author', 'booktitle', 'journal', 'year', 'publisher',

    // Type-dependent.
    'pages', 'volume', 'number', 'edition', 'editor', 'address',

    // Extra.
    'chapter', 'organization', 'doi', 'note',

    // Variable size.
    'keywords', 'abstract',
];

window.linqs.pubs.BIBTEX_OPTIONAL_KEYS = [
    'publisher', 'pages', 'volume', 'number', 'edition', 'editor', 'address', 'chapter', 'organization', 'doi', 'note'
];

window.linqs.pubs.indexed = false;
window.linqs.pubs.authors = {};

// Keep track of the title of the page before rendering, so we can switch back to it.
// This will be set at index time.
window.linqs.pubs.baseTitle = null;

window.linqs.pubs.capatilize = function(text) {
    if (!text) {
        return text;
    }

    return text[0].toUpperCase() + text.substring(1);
};

// A general and safe clean for a string.
window.linqs.pubs.cleanText = function(text) {
    return text.replace(/\s+/g, ' ').trim();
};

// Clean a string to make it an id.
window.linqs.pubs.cleanId = function(text) {
    return window.linqs.pubs.cleanText(text).toLowerCase().replace(/ /g, '-').replace(/[^\w\-]/g, '');
};

window.linqs.pubs.index = function() {
    if (window.linqs.pubs.indexed) {
        return;
    }

    let authors = {};
    window.linqs.pubs.baseTitle = document.title;

    for (let id in window.linqs.pubs.pubs) {
        let pub = window.linqs.pubs.pubs[id];

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

        // Cleanup keywords.

        if (!('keywords' in pub)) {
            pub['keywords'] = [];
        } else if (typeof(pub.keywords) == 'string') {
            pub.keywords = pub.keywords.split(',').map(window.linqs.pubs.cleanText);
        }

        pub['_keywords'] = pub.keywords.map(window.linqs.pubs.cleanId);

        // Cleanup links.

        if (!('links' in pub)) {
            pub['links'] = [];
        }

        pub.links.forEach(function(linkEntry) {
            if (!linkEntry.label) {
                linkEntry.label = 'link';
            }

            linkEntry.displayLabel = window.linqs.pubs.capatilize(linkEntry.label);
            linkEntry.href = window.linqs.pubs.makeLink(linkEntry.href);
            linkEntry.icon = window.linqs.pubs.resolveIcon(linkEntry.icon, linkEntry.label);
        });
    }

    window.linqs.pubs.authors = authors;

    window.linqs.pubs.indexed = true;
}

window.linqs.pubs.resolveIcon = function(icon, label) {
    if (!icon && label in window.linqs.pubs.ICON_MAP) {
        icon = window.linqs.pubs.ICON_MAP[label];
    } else {
        icon = window.linqs.pubs.ICON_DEFAULT;
    }

    return window.linqs.pubs.makeLink(`${window.linqs.pubs.ICON_REL_PATH}#${icon}`);
};

window.linqs.pubs.sort = function(pubs) {
    let keys = Object.keys(pubs);

    keys = keys.sort(function(a, b) {
        for (let i = 0; i < window.linqs.pubs.SORT_KEYS.length; i++) {
            let sortKey = window.linqs.pubs.SORT_KEYS[i];

            let order = 1;
            if (sortKey.startsWith('!')) {
                order = -1;
                sortKey = sortKey.substring(1);
            }

            if (pubs[a][sortKey] < pubs[b][sortKey]) {
                return -1 * order;
            } else if (pubs[a][sortKey] > pubs[b][sortKey]) {
                return 1 * order;
            }
        }

        return 0;
    });

    return keys;
};

window.linqs.pubs.makeLink = function(path) {
    if (path.startsWith('/')) {
        return window.linqs.pubs.baseURL.replace(/\/$/, '') + path;
    }

    return path;
};

window.linqs.pubs.authorLink = function(authorIndex, pub) {
    let name = pub.authors[authorIndex];
    let link = `#author:${pub['_authorIDs'][authorIndex]}`;

    return `<a class='filter-link author-link' href='${link}'>${name}</a>`
};

window.linqs.pubs.listAuthors = function(pub, bibtexStyle) {
    let authors = '';

    for (let i = 0; i < pub['_authorIDs'].length; i++) {
        let text = '';

        if (bibtexStyle) {
            text += window.linqs.pubs.authors[pub['_authorIDs'][i]].displayName;
        } else {
            text += window.linqs.pubs.authorLink(i, pub);
        }

        if (i == 0) {
            // First author.
            // This case muct also work for solo anthors.
            authors += text;
        } else if (i == pub['_authorIDs'].length - 1) {
            // Last author.
            if (bibtexStyle) {
                authors += ' and ' + text;
            } else if (i == 1) {
                // Only two authors.
                authors += ' and ' + text;
            } else {
                authors += ', and ' + text;
            }
        } else {
            // Middle author.
            if (bibtexStyle) {
                authors += ' and ' + text;
            } else {
                authors += ', ' + text;
            }
        }
    }

    return authors;
};

window.linqs.pubs.listKeywords = function(pub) {
    let html = '';

    pub.keywords.forEach(function(keyword) {
        html += `<a class='filter-link keyword-link' href='#keyword:${window.linqs.pubs.cleanId(keyword)}'>${keyword}</a>`
    });

    return html;
};

window.linqs.pubs.resourceLink = function(linkEntry) {
    return `
        <a class='pub-link pub-link-${linkEntry.label}' href='${linkEntry.href}'>
            ${linkEntry.displayLabel}
            <svg class='svg-icon'>
                <use xlink:href='${linkEntry.icon}' />
            </svg></a>
    `;
};

window.linqs.pubs.renderList = function(keys) {
    let previousYear = null;

    keys.forEach(function(key) {
        let pub = window.linqs.pubs.pubs[key];

        let authors = `<span class='authors'>${window.linqs.pubs.listAuthors(pub, false)}.</span>`;

        let additionalLinks = '';
        pub.links.forEach(function(linkEntry) {
            additionalLinks += window.linqs.pubs.resourceLink(linkEntry);
        });

        let bibtexIconURL = window.linqs.pubs.makeLink(window.linqs.pubs.ICON_REL_PATH + '#' + window.linqs.pubs.ICON_BIBTEX);
        let links = `
            <div class='pub-links'>
                <a class='pub-link pub-link-bibtex' onClick="window.linqs.pubs.openBibtexTab('${key}');">
                    Bibtex
                    <svg class='svg-icon'>
                        <use xlink:href='${bibtexIconURL}' />
                    </svg></a>
                ${additionalLinks}
            </div>
        `;

        let entry = "<div class='pub-entry'>";
        entry += authors;
        entry += `<span> <a class='title-link' href='#id:${pub._id}'>${pub.title}</a>.</span>`;
        entry += `<span> <a class='filter-link venue-link' href='#venue:${pub._venue}'>${pub.venue}</a>.</span>`;
        entry += `<span> <a class='filter-link year-link' href='#year:${pub.year}'>${pub.year}</a>.</span>`;

        entry += links;
        entry += "</div>";

        // Track year transitions.
        if (previousYear != pub.year) {
            $('.pubs-list').append(`<div class='year-marker'>${pub.year}</div>`);
            previousYear = pub.year;
        }

        $('.pubs-list').append(entry);
    });

    document.title = window.linqs.pubs.baseTitle || "Publications";
};

// Render a single paper with all the additional info.
window.linqs.pubs.renderPaper = function(pub) {
    let entry = `
        <div class='pub-entry-full'>
            <table>
                <tr>
                    <td>Title</td>
                    <td>${pub.title}</td>
                </tr>
                <tr>
                    <td>Authors</td>
                    <td><span class='authors'>${window.linqs.pubs.listAuthors(pub, false)}</span></td>
                </tr>
                <tr>
                    <td>Year</td>
                    <td><a class='filter-link year-link' href='#year:${pub.year}'>${pub.year}</a></td>
                </tr>
                <tr>
                    <td>Venue</td>
                    <td><a class='filter-link venue-link' href='#_venue:${pub._venue}'>${pub.venue}</a></td>
                </tr>
    `;

    if (pub.keywords.length > 0) {
        entry += `
                <tr>
                    <td>Keywords</td>
                    <td>${window.linqs.pubs.listKeywords(pub)}</td>
                </tr>
        `;
    }

    if (pub.abstract) {
        entry += `
                <tr>
                    <td>Abstract</td>
                    <td><p class='abstract'>${pub.abstract}</p></td>
                </tr>
        `;
    }

    entry += `
                <tr>
                    <td>Bibtex</td>
                    <td><pre><code class='bibtex'>${window.linqs.pubs.bibtex(pub)}</code></pre></td>
                </tr>
    `;

    if (pub.links.length > 0) {
        let links = '';
        pub.links.forEach(function(linkEntry) {
            links += window.linqs.pubs.resourceLink(linkEntry);
        });

        entry += `
                <tr>
                    <td>Resources</td>
                    <td>${links}</td>
                </tr>
        `;
    }

    entry += `
            </table>
        </div>
    `;

    $('.pubs-list').append(entry);
    document.title = pub.title;
};

window.linqs.pubs.openBibtexTab = function(key) {
    let pub = window.linqs.pubs.pubs[key];

    let newTab = window.open('', '_blank');
    newTab.document.write(`
        <html>
            <head>
                <title>Bibtex - ${pub.title}</title>
            </head>
            <body>
                <pre><code class='bibtex'>${window.linqs.pubs.bibtex(pub)}</code></pre>
            </body>
        </html>
    `);
    newTab.document.close();
};

window.linqs.pubs.bibtex = function(pub) {
    let fields = [
        ['author', window.linqs.pubs.listAuthors(pub, true)],
        ['title', pub.title],
        ['year', pub.year],
    ];

    if (['inproceedings', 'conference', 'inbook', 'misc'].includes(pub.type)) {
        fields.push(['booktitle', pub.venue]);
    } else if (pub.type == 'journal') {
        fields.push(['journal', pub.venue]);
    }

    window.linqs.pubs.BIBTEX_OPTIONAL_KEYS.forEach(function(key) {
        if (pub[key]) {
            fields.push([key, pub[key]]);
        }
    });

    fields.sort(function(a, b) {
        let aIndex = window.linqs.pubs.BIBTEX_SORTED_KEYS.indexOf(a[0]);
        let bIndex = window.linqs.pubs.BIBTEX_SORTED_KEYS.indexOf(b[0]);

        if (aIndex == -1 || bIndex == -1) {
            return 0;
        }

        return aIndex - bIndex;
    });

    let text = `@${pub.type}{${pub._id.replace('-', ':')},`
    fields.forEach(function(field) {
        text += `\n    ${field[0]} = {${field[1]}},`
    });
    text += '\n}'

    return text;
};

// Look at the hash and figure out what entries we should be showing.
window.linqs.pubs.fetchEntries = function() {
    let parts = location.hash.trim().replace(/^#/, '').split(':');

    if (parts.length < 2) {
        return window.linqs.pubs.pubs;
    }

    let key = parts[0];
    let value = parts[1];

    let displayKey = window.linqs.pubs.capatilize(key);
    let displayValue = value;

    let pubs = {};

    for (let pubID in window.linqs.pubs.pubs) {
        let pub = window.linqs.pubs.pubs[pubID];

        // Redirect certain keys so the URL looks nice.
        if (key == 'id' && pub._id == value) {
            pubs[pub._id] = pub;
            // Don't display a filter for an id (we will render a full page for it).
            displayKey = null;
            displayValue = null;
        } else if (key == 'author' && pub._authorIDs.includes(value)) {
            pubs[pub._id] = pub;
            displayValue = pub.authors[pub._authorIDs.indexOf(value)];
        } else if (key == 'venue' && pub._venue == value) {
            pubs[pub._id] = pub;
            displayValue = pub._venue_shortname;
        } else if (key == 'keyword' && pub._keywords.includes(value)) {
            pubs[pub._id] = pub;
        } else if (pub[key] == value) {
            pubs[pub._id] = pub;
        }
    }

    if (displayKey) {
        let iconLink = window.linqs.pubs.makeLink(`${window.linqs.pubs.ICON_REL_PATH}#close-circle-line`);
        $('.pubs-list').append(`
            <div class=pubs-filter>
                <a href='#'>
                    <svg class='svg-icon'>
                        <use xlink:href='${iconLink}' />
                    </svg>
                    ${displayValue}
                </a>
            </div>
        `);
    }

    return pubs;
};

// The main() for publications.
window.linqs.pubs.display = function() {
    window.linqs.pubs.index();

    $('.pubs-list').empty();

    let pubs = window.linqs.pubs.fetchEntries();

    // If we are specifically looking for a single paper, render it differently.
    if (Object.keys(pubs).length == 1 && location.hash.trim().startsWith('#id:')) {
        window.linqs.pubs.renderPaper(Object.entries(pubs)[0][1]);
    } else {
        let sortedKeys = window.linqs.pubs.sort(pubs);
        window.linqs.pubs.renderList(sortedKeys);
    }

    $(window).scrollTop(0);
};
