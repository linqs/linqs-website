'use strict';

window.linqs = window.linqs || {};
window.linqs.people = window.linqs.people || {};

window.linqs.people.TYPES = [
    {'name': 'advisor', 'display': 'Advisor'},
    {'name': 'postdoc', 'display': 'Post Docs'},
    {'name': 'phd', 'display': 'Ph.D. Students'},
    {'name': 'ms', 'display': 'Master\'s Students'},
    {'name': 'undergrad', 'display': 'Undergraduate Students'},
    {'name': 'alum', 'display': 'Alumni'},
    {'name': 'visitor', 'display': 'Visiting Students'},
];

// Go over all the people and prep them for render.
window.linqs.people.index = function() {
    for (let id in window.linqs.people.data) {
        window.linqs.people.data[id].sortkey = window.linqs.people.createSortKey(window.linqs.people.data[id].name);
    }
}

window.linqs.people.renderPerson = function(person) {
    let html = `
        <div class='person person-type-${person.type}'>
            <div class='person-image'>
                <img src="${window.linqs.utils.makeLink(window.linqs.utils.baseURL, person.image)}" alt="${person.name}" />
            </div>
            <div class='person-info'>
                <div class='person-name'>
                    ${person.name}
                </div>
    `;

    if (person.degree) {
        html += `
                <div class='person-degree'>
                    ${person.degree}
                </div>
        `;
    }

    html += `
                <div class='person-email'>
                    <a href='mailto:${person.email}'>${person.email}</a>
                </div>
    `;

    if (['advisor', 'postdoc', 'phd', 'masters'].includes(person.type)) {
        html += `
                <div class='person-room'>
                    ${person.room}
                </div>
                <div class='person-homepage'>
                    <a href='${person.homepage}'>${person.homepage}</a>
                </div>
                <div class='person-research'>
                    <p>
                        <strong>Research Interests:</strong> ${person.research}
                    </p>
                </div>
        `;
    }

    if (person.affiliations) {
        let affiliations = person.affiliations.join('; ');
        let plurality = person.affiliations.length == 1 ? 'Affiliation' : 'Affiliations';
        html += `
                <div class='person-affiliations'>
                    <strong>Current ${plurality}:</strong> ${affiliations}
                </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}

// Take in a name and get a sort key (lexicographicly sortable string) back.
window.linqs.people.createSortKey = function(name) {
    // General cleanup.
    name = name.toLowerCase().trim();
    name = name.replaceAll(/\s+/g, ' ');

    // Get the tokens and reverse the order.
    let parts = name.split(' ');
    return parts.reverse().join(' ');
}

// Get a sorted list of people to render of the given type.
window.linqs.people.getSortedPeople = function(type) {
    let people = [];

    for (let id in window.linqs.people.data) {
        let person = window.linqs.people.data[id];
        if (person.type == type.name) {
            people.push(person);
        }
    }

    people.sort(function(a, b) {
        return a.sortkey.localeCompare(b.sortkey);
    });

    return people;
}

window.linqs.people.renderList = function() {
    window.linqs.people.index();

    let html= '';

    window.linqs.people.TYPES.forEach(function(type) {
        let people = window.linqs.people.getSortedPeople(type);
        if (people.length == 0) {
            return;
        }

        html += `<h2 class='role-label'>${type.display}</h2>`

        people.forEach(function(person) {
            html += window.linqs.people.renderPerson(person);
        });
    });

    $('.people-list').append(html);
};

// The main() for publications.
window.linqs.people.display = function() {
    $('.people-list').empty();

    window.linqs.people.renderList();

    $(window).scrollTop(0);
};