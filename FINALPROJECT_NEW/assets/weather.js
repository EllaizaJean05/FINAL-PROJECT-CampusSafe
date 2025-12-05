/* reports.js — manage create/read/update/delete of reports in localStorage with a mini Leaflet map */

(function () {
    // only run on reports page
    if (!document.getElementById('reportForm')) return;

    // dom
    const form = document.getElementById('reportForm');
    const rtitle = document.getElementById('rtitle');
    const rdesc = document.getElementById('rdesc');
    const rtype = document.getElementById('rtype');
    const rlat = document.getElementById('rlat');
    const rlng = document.getElementById('rlng');
    const reportId = document.getElementById('reportId');
    const reportsList = document.getElementById('reportsList');
    const clearBtn = document.getElementById('clearBtn');

    const MINI_COORDS = [8.360191, 124.868320];

    // init mini map
    const mini = L.map('miniMap').setView(MINI_COORDS, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mini);
    const clickMarker = L.marker(MINI_COORDS, { draggable: false }).addTo(mini);

    mini.on('click', (e) => {
        const { lat, lng } = e.latlng;
        rlat.value = lat.toFixed(6);
        rlng.value = lng.toFixed(6);
        clickMarker.setLatLng(e.latlng);
    });

    function loadReports() {
        return (Storage.loadReports() || []).map(r => new Report(r));
    }

    function saveReports(list) {
        Storage.saveReports(list);
        window.dispatchEvent(new Event('storage'));
    }

    function renderReports() {
        const list = loadReports();
        if (!list.length) {
            reportsList.innerHTML = '<li class="muted">No reports yet.</li>';
            return;
        }
        reportsList.innerHTML = list.map(r => {
            return `<li>         <div>           <strong>${r.title}</strong><div class="muted small">${new Date(r.createdAt).toLocaleString()}</div>           <div class="muted small">${r.description || ''}</div>         </div>         <div>           <button class="btn ghost small" data-edit="${r.id}">Edit</button>           <button class="btn" data-delete="${r.id}">Delete</button>         </div>       </li>`;
        }).join('');
        // attach listeners
        reportsList.querySelectorAll('[data-delete]').forEach(b => {
            b.addEventListener('click', (e) => {
                const id = e.target.dataset.delete;
                const remaining = loadReports().filter(r => r.id !== id);
                saveReports(remaining);
                renderReports(); // re-render
            });
        });
        reportsList.querySelectorAll('[data-edit]').forEach(b => {
            b.addEventListener('click', (e) => {
                const id = e.target.dataset.edit;
                const r = loadReports().find(rr => rr.id === id);
                if (!r) return;
                reportId.value = r.id;
                rtitle.value = r.title;
                rdesc.value = r.description;
                rtype.value = r.type;
                rlat.value = r.lat || '';
                rlng.value = r.lng || '';
                if (r.lat && r.lng) clickMarker.setLatLng([r.lat, r.lng]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            id: reportId.value || null,
            title: rtitle.value.trim(),
            description: rdesc.value.trim(),
            type: rtype.value,
            lat: rlat.value || null,
            lng: rlng.value || null,
            author: (Storage.loadUser()?.username) || 'anonymous'
        };
        if (!data.title) { alert('Title required'); return; }


        const existing = loadReports();
        if (data.id) {
            // update
            const idx = existing.findIndex(x => x.id === data.id);
            if (idx >= 0) {
                existing[idx] = new Report(data);
            }
        } else {
            // create
            existing.push(new Report(data));
        }
        saveReports(existing);
        form.reset();
        reportId.value = '';
        renderReports();
        alert('Report saved. It will appear on the map.');


    });

    clearBtn.addEventListener('click', () => { form.reset(); reportId.value = ''; });

    // initial render
    renderReports();

})();
