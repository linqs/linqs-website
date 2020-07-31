'use strict';

window.linqs = window.linqs || {};
window.linqs.utils = window.linqs.utils || {};
window.linqs.datasets = window.linqs.datasets || {};
window.linqs.datasets.metadata = window.linqs.datasets.metadata || {};
window.linqs.datasets.pubs = window.linqs.datasets.pubs || {};

window.linqs.datasets.makeLink = function(path) {
	if (path.startsWith('/')) {
		return window.linqs.datasets.baseURL.replace(/\/$/, '') + path;
	}

	return path;
};

window.linqs.datasets.listAuthors = function(pub) {
	let authors = '';

	for (let i = 0; i < pub['authors'].length; i++) {
		let text = pub['authors'][i];

		if (i == 0) {
			authors += text;
		} else {
			authors += ' and ' + text;
		}
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

	return size.toFixed(2).toString().replace(/0+$/, '') + " " +sizes[i];
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

window.linqs.datasets.makeReferences = function(references) {
	let referencesHTML = '';

	references.forEach(function(reference, i) {
		let refLink = window.linqs.datasets.makeLink(reference['href']);
		let refText = reference['text'];
		let referenceTemplate = `
			<p><a href='${refLink}'>${refText}</a></p>
		`;

		referencesHTML += referenceTemplate;
	});

	return referencesHTML;
};

window.linqs.datasets.makeStubDatasets = function() {
	let stubs = '<p>This page contains datasets used by the LINQS Lab and all exhibit relational structure. If you use them, please cite them accordingly.</p>';

	Object.keys(window.linqs.datasets.metadata).sort().forEach(function(key) {
		let dataset = window.linqs.datasets.metadata[key];

		let title = dataset['title'];
		let description = dataset['description'];
		let link = '#' + key;
		let infos = dataset['link-info'];
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

	let infos = dataset['link-info'];
	let infosHTML = window.linqs.datasets.makeDownloadInfo(infos);

	let description = dataset['description'];

	let citationKey = dataset['citation'];
	let pub = window.linqs.datasets.pubs[citationKey];
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
					<h2>Related Papers</h2>
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
