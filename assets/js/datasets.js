'use strict';

window.linqs = window.linqs || {};
window.linqs.datasets = window.linqs.datasets || {};
window.linqs.datasets.datasets = window.linqs.datasets.datasets || {};

window.linqs.datasets.renderPage = function() {

    console.log(3)


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
}

window.linqs.datasets.makeFullDataset = function(dataset) {
    let image = dataset['img'];
    let title = dataset['title'];
    let size = dataset['size'];
    let download = dataset['downloadLink'];
    let hash = dataset['md5'];

    let citation = dataset['citation'];
    let description = dataset['description'];

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
                    <h2>${title}</h2>
                </div>
                <div class='image'>
                    <img src='${image}'/>
                </div>
                <div class='stats'>
                    <div class='size'>
                        <label>Size</label>
                        <span>${size}</span>
                    </div>
                    <div class='download'>
                        <p><a href=${download}>Download</a></p>
                    </div>
                    <div class='hash'>
                        <label>md5</label>
                        <code>${hash}</code>
                    </div>
                </div>
            </div>
            <div class='citation'>
                <pre>
                    ${citation}
                </pre>
            </div>
            <div class='description'>
                ${description}
            </div>
            <div class='references'>
                ${referencesHTML}
            </div>
        </div>
    `;

    document.querySelector('.datasets-list').innerHTML = templateString;
}

window.linqs.datasets.makeStubDatasets = function() {
    let stubs = '';

    Object.keys(window.linqs.datasets.datasets).forEach(function(key) {

        let dataset = window.linqs.datasets.datasets[key];

        let image = dataset['img'];
        let title = dataset['title'];
        let size = dataset['size'];
        let download = dataset['downloadLink'];
        let hash = dataset['md5'];
        let link = '#' + key;

        stubs += `
            <div class='dataset-stub'>
                <div class='top'>
                    <div class='title'>
                        <h2><a href='${link}'>${title}</a></h2>
                    </div>
                    <div class='image'>
                        <img src='${image}'/>
                    </div>
                    <div class='stats'>
                        <div class='size'>
                            <label>Size</label>
                            <span>${size}</span>
                        </div>
                        <div class='download'>
                            <p><a href=${download}>Download</a></p>
                        </div>
                        <div class='hash'>
                            <label>md5</label>
                            <code>${hash}</code>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    document.querySelector('.datasets-list').innerHTML = stubs;
}

window.linqs.datasets.display = function() {
    console.log(1)
    window.linqs.datasets.renderPage()
    console.log(2)
};