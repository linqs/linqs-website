---
permalink: /api/publications.js
---

window.linqs = window.linqs || {};
window.linqs.pubs = window.linqs.pubs || {};
window.linqs.pubs.venues = {{ site.data.config.venues | jsonify }};
window.linqs.pubs.pubs = {{ site.data.pubs | jsonify }};
