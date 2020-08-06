'use strict';

window.linqs.utils.BIBTEX_SORTED_KEYS = [
    // Core.
    'title', 'author', 'booktitle', 'journal', 'year', 'publisher',

    // Type-dependent.
    'pages', 'volume', 'number', 'edition', 'editor', 'address',

    // Extra.
    'chapter', 'organization', 'doi', 'note',

    // Variable size.
    'keywords', 'abstract',
];

window.linqs.utils.BIBTEX_OPTIONAL_KEYS = [
    'publisher', 'pages', 'volume', 'number', 'edition', 'editor', 'address', 'chapter', 'organization', 'doi', 'note'
];

window.linqs.utils.bibtex = function(pub, authors, id) {
    let fields = [
        ['author', authors],
        ['title', pub.title],
        ['year', pub.year],
    ];

    if (['inproceedings', 'conference', 'inbook', 'misc'].includes(pub.type)) {
        fields.push(['booktitle', pub.venue]);
    } else if (pub.type == 'journal') {
        fields.push(['journal', pub.venue]);
    }

    window.linqs.utils.BIBTEX_OPTIONAL_KEYS.forEach(function(key) {
        if (pub[key]) {
            fields.push([key, pub[key]]);
        }
    });

    fields.sort(function(a, b) {
        let aIndex = window.linqs.utils.BIBTEX_SORTED_KEYS.indexOf(a[0]);
        let bIndex = window.linqs.utils.BIBTEX_SORTED_KEYS.indexOf(b[0]);

        if (aIndex == -1 || bIndex == -1) {
            return 0;
        }

        return aIndex - bIndex;
    });

    let text = `@${pub.type}{${id.replace('-', ':')},`
    fields.forEach(function(field) {
        text += `\n    ${field[0]} = {${field[1]}},`
    });

    text += '\n}';

    return text;
};
