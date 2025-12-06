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

    // NEW: Get the Save and Clear buttons by their new IDs/structure
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');

    const MINI_COORDS = [8.360191, 124.868320];

    // init mini map
    if (typeof L === 'undefined') {
        console.error("Leaflet library not loaded. Map functionality disabled.");
        return;
    }

    const mini = L.map('miniMap').setView(MINI_COORDS, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mini);
    const clickMarker = L.marker(MINI_COORDS, { draggable: false }).addTo(mini);

    mini.on('click', (e) => {
        const { lat, lng } = e.latlng;
        rlat.value = lat.toFixed(6);
        rlng.value = lng.toFixed(6);
        clickMarker.setLatLng(e.latlng);
    });
    
    // **FIX 1: Listeners to update marker when user manually types coordinates**
    rlat.addEventListener('input', updateMarkerFromInput);
    rlng.addEventListener('input', updateMarkerFromInput);

    function updateMarkerFromInput() {
        const lat = parseFloat(rlat.value);
        const lng = parseFloat(rlng.value);

        // Only update if both are valid numbers
        if (!isNaN(lat) && !isNaN(lng)) {
            clickMarker.setLatLng([lat, lng]);
        }
    }


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
            const statusText = r.status === 'Done' ? 'Status: Done' : 'Status: Pending';
            const doneBtnClass = r.status === 'Done' ? 'btn ghost small' : 'btn primary small';

            return `
             <li>
               <div>
                 <strong>${r.title}</strong>
                 <div class="muted small">${statusText} — ${new Date(r.createdAt).toLocaleString()}</div>
                 <div class="muted small">${r.description || ''}</div>
               </div>
               <div>
                 <button class="btn ghost small" data-edit="${r.id}">Edit</button>
                 <button class="${doneBtnClass}" data-status="${r.id}">DONE</button>
                 <button class="btn" data-delete="${r.id}">Delete</button>
               </div>
             </li>
            `;
        }).join('');

        // attach listeners for delete, edit, and status
        reportsList.querySelectorAll('[data-delete]').forEach(b => {
            b.addEventListener('click', (e) => {
                const id = e.target.dataset.delete;
                const remaining = loadReports().filter(r => r.id !== id);
                saveReports(remaining);
                renderReports();
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

        reportsList.querySelectorAll('[data-status]').forEach(b => {
            b.addEventListener('click', (e) => {
                const id = e.target.dataset.status;
                const reports = loadReports();
                const report = reports.find(rr => rr.id === id);
                if (report && report.status !== 'Done') {
                    report.status = 'Done';
                    const idx = reports.findIndex(x => x.id === id);
                    reports[idx] = new Report(report);
                    saveReports(reports);
                    renderReports();
                }
            });
        });
    }

    // --- MANUAL CLICK LISTENER FOR SAVE BUTTON ---
    saveBtn.addEventListener('click', () => {
        // Manually check validity (since we're not using native form submit)
        if (!rtitle.value.trim()) {
            alert('Title required');
            rtitle.focus();
            return;
        }

        const data = {
            id: reportId.value || null,
            title: rtitle.value.trim(),
            description: rdesc.value.trim(),
            type: rtype.value,
            lat: rlat.value || null,
            lng: rlng.value || null,
            // This now works because Storage.loadUser() is fixed in classes.js
            author: (Storage.loadUser()?.username) || 'anonymous' 
        };

        const existing = loadReports();
        if (data.id) {
            // update
            const idx = existing.findIndex(x => x.id === data.id);
            if (idx >= 0) {
                // Preserve status and createdAt on update
                data.status = existing[idx].status;
                data.createdAt = existing[idx].createdAt; 
                existing[idx] = new Report(data);
            }
        } else {
            // create
            existing.push(new Report(data));
        }
        saveReports(existing);
        form.reset();
        reportId.value = '';
        clickMarker.setLatLng(MINI_COORDS); // Reset marker position
        renderReports();
        alert('Report saved. It will appear on the map.');
    });


    // --- CLEAR BUTTON LISTENER ---
    clearBtn.addEventListener('click', () => {
        form.reset();
        reportId.value = '';
        clickMarker.setLatLng(MINI_COORDS); // Reset marker position
    });

    // initial render
    renderReports();

})();