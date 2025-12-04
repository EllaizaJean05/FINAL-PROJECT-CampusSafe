/* ====================
  CONFIG - add your key
   ==================== */
const OPENWEATHER_API_KEY = "9d9f6f36546d0442f55deeb57e8b9553";

/* ====================
  OOP: Classes & Inheritance
  - ReportBase (abstract-like)
  - Report extends ReportBase (adds serialization)
  - ReportManager handles report collection (encapsulation)
  - User class manages user data
  ==================== */

class ReportBase {
  constructor(type, desc, lat = null, lon = null, createdBy = 'guest') {
    this._id = Date.now() + Math.floor(Math.random()*999);
    this._type = type;
    this._desc = desc;
    this._lat = lat;
    this._lon = lon;
    this._createdAt = new Date().toISOString();
    this._createdBy = createdBy;
  }
  // encapsulated getters
  get id(){ return this._id; }
  get type(){ return this._type; }
  get desc(){ return this._desc; }
  get lat(){ return this._lat; }
  get lon(){ return this._lon; }
  get createdAt(){ return this._createdAt; }
  get createdBy(){ return this._createdBy; }

  set type(v){ this._type = v; }
  set desc(v){ this._desc = v; }
  set lat(v){ this._lat = v; }
  set lon(v){ this._lon = v; }

  toJSON(){
    return {
      id: this._id, type: this._type, desc: this._desc,
      lat: this._lat, lon: this._lon, createdAt: this._createdAt, createdBy: this._createdBy
    };
  }
}

// Inheritance example: a SpecialReport extends ReportBase and adds severity
class SpecialReport extends ReportBase {
  constructor(type, desc, severity = 'Low', lat=null, lon=null, createdBy='guest'){
    super(type, desc, lat, lon, createdBy);
    this._severity = severity; // additional property
  }
  get severity(){ return this._severity; }
  set severity(s){ this._severity = s; }
  toJSON(){ return {...super.toJSON(), severity: this._severity}; }
}

/* ReportManager encapsulates report operations (CRUD) */
class ReportManager {
  constructor(storageKey = 'campus_reports_v1'){
    this.storageKey = storageKey;
    this.reports = JSON.parse(localStorage.getItem(this.storageKey) || '[]').map(r => r);
  }

  all(){ return this.reports.slice(); } // return copy

  add(report){
    // Report or plain object acceptable
    const rObj = report instanceof ReportBase ? report.toJSON() : report;
    this.reports.unshift(rObj);
    this._persist();
    return rObj;
  }

  update(id, patch){
    const idx = this.reports.findIndex(r => r.id === id);
    if(idx === -1) return null;
    this.reports[idx] = {...this.reports[idx], ...patch};
    this._persist();
    return this.reports[idx];
  }

  delete(id){
    const prevLen = this.reports.length;
    this.reports = this.reports.filter(r => r.id !== id);
    this._persist();
    return this.reports.length < prevLen;
  }

  find(id){ return this.reports.find(r => r.id === id) || null; }

  _persist(){ localStorage.setItem(this.storageKey, JSON.stringify(this.reports)); }
  clear(){ this.reports = []; this._persist(); }
}

/* Simple User class (encapsulation) */
class User {
  constructor(username, password){
    this._username = username;
    this._password = password;
    this._createdAt = new Date().toISOString();
  }
  get username(){ return this._username; }
  validatePassword(p){ return this._password === p; }
  toJSON(){ return {user: this._username, pass: this._password, createdAt: this._createdAt}; }
}

/* ====================
  App State & Initialization
  ==================== */
const reportManager = new ReportManager();
let currentUser = JSON.parse(localStorage.getItem('campus_current_user') || 'null');

function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  const topbar = document.getElementById('topbar');
  if(id === 'loginPage' || id === 'registerPage'){
    topbar.classList.add('hidden');
  } else {
    topbar.classList.remove('hidden');
  }

  if(id === 'dashboardPage') renderDashboard();
  if(id === 'reportsPage') renderReportsTable();
}

/* ====================
  AUTH (localStorage)
  - register before login enforced
  ==================== */
const USERS_KEY = 'campus_users_v1';
function loadUsers(){ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
function saveUsers(users){ localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

function registerUser(){
  const user = document.getElementById('regUser').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  if(!user || !pass) return alert('Please fill both fields.');

  const users = loadUsers();
  if(users.find(u => u.user === user)) return alert('User already exists. Please login.');

  const u = new User(user, pass);
  users.push(u.toJSON());
  saveUsers(users);
  alert('Account created. Please login.');
  document.getElementById('regUser').value = '';
  document.getElementById('regPass').value = '';
  showSection('loginPage');
}

function login(){
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  if(!user || !pass) return alert('Fill both fields.');

  const users = loadUsers();
  if(users.length === 0) return alert('No accounts exist. You must register first.');

  const found = users.find(u => u.user === user);
  if(!found) return alert('User not found. Please register first.');

  if(found.pass !== pass) return alert('Incorrect password.');

  currentUser = { user: found.user, loginAt: new Date().toISOString(), since: found.createdAt };
  localStorage.setItem('campus_current_user', JSON.stringify(currentUser));
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  showSection('dashboardPage');
}

function logout(){
  currentUser = null;
  localStorage.removeItem('campus_current_user');
  showSection('loginPage');
}

/* If the app boots and user is logged in, open dashboard */
(function boot(){
  if(currentUser){
    showSection('dashboardPage');
  } else {
    showSection('loginPage');
  }
})();

/* Hook auth buttons */
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('regBtn').addEventListener('click', registerUser);
  document.getElementById('loginBtn').addEventListener('click', login);

  document.getElementById('addReportBtn').addEventListener('click', onAddReport);
  document.getElementById('searchWeatherBtn').addEventListener('click', onSearchWeather);

  // dark mode
  const darkToggle = document.getElementById('darkToggle');
  const saved = localStorage.getItem('campus_dark') || 'light';
  if(saved === 'dark') document.body.classList.add('dark');
  darkToggle.addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('campus_dark', mode);
  });

  // init map
  initMap();

  // initial render if logged in
  if(currentUser){
    renderDashboard();
  }
});

/* ====================
  Reports CRUD & UI
  ==================== */
function onAddReport(){
  if(!currentUser) return alert('Please login to add reports.');
  const t = document.getElementById('reportType').value.trim();
  const d = document.getElementById('reportDesc').value.trim();
  if(!t || !d) return alert('Please fill type & description.');

  // create ReportBase instance (example of polymorphism: sometimes SpecialReport)
  const useSpecial = t.toLowerCase().includes('urgent') || t.toLowerCase().includes('fire');
  const r = useSpecial ? new SpecialReport(t, d, 'High', null, null, currentUser.user)
                       : new ReportBase(t, d, null, null, currentUser.user);
  reportManager.add(r);
  document.getElementById('reportType').value = '';
  document.getElementById('reportDesc').value = '';
  renderReportsTable();
  renderDashboard();
  refreshMapMarkers();
}

function renderReportsTable(){
  const table = document.getElementById('reportsTable');
  const reps = reportManager.all();
  if(reps.length === 0){
    table.innerHTML = `<tr><td>No reports yet.</td></tr>`;
    return;
  }
  let html = `<tr><th>Type</th><th>Description</th><th>By</th><th>When</th><th>Actions</th></tr>`;
  reps.forEach(r=>{
    html += `<tr>
      <td>${escapeHtml(r.type || r._type)}</td>
      <td>${escapeHtml(r.desc || r._desc)}</td>
      <td>${escapeHtml(r.createdBy || r._createdBy)}</td>
      <td>${new Date(r.createdAt||r._createdAt).toLocaleString()}</td>
      <td>
        <button onclick="editReport('${r.id||r._id}')">Edit</button>
        <button onclick="deleteReport('${r.id||r._id}')">Delete</button>
        <button onclick="zoomToReport('${r.id||r._id}')">Zoom</button>
      </td>
    </tr>`;
  });
  table.innerHTML = html;
}

function editReport(id){
  const r = reportManager.find(Number(id)) || reportManager.find(id);
  if(!r) return alert('Report not found.');
  const newType = prompt('Edit report type:', r.type || r._type);
  if(newType === null) return;
  const newDesc = prompt('Edit description:', r.desc || r._desc);
  if(newDesc === null) return;
  reportManager.update(r.id || r._id, { type: newType.trim(), desc: newDesc.trim() });
  renderReportsTable();
  renderDashboard();
  refreshMapMarkers();
}

function deleteReport(id){
  if(!confirm('Delete this report?')) return;
  const ok = reportManager.delete(Number(id)) || reportManager.delete(id);
  if(ok) { renderReportsTable(); renderDashboard(); refreshMapMarkers(); }
}

/* ====================
  Dashboard Charts (Chart.js)
  - Reports by type (bar or pie)
  - Timeline (line)
  ==================== */
let reportsChart = null, timelineChart = null;
function renderDashboard(){
  // show profile info
  if(currentUser){
    document.getElementById('profileUser').textContent = currentUser.user;
    document.getElementById('profileSince').textContent = new Date(currentUser.since).toLocaleString();
  }

  // recent list
  const recent = reportManager.all().slice(0,8);
  const ul = document.getElementById('recentReports');
  ul.innerHTML = '';
  if(recent.length === 0) {
    ul.innerHTML = '<li class="muted">No reports</li>';
  } else {
    recent.forEach(r=>{
      const li = document.createElement('li');
      li.textContent = `${r.type || r._type} — ${r.desc || r._desc} (${new Date(r.createdAt||r._createdAt).toLocaleTimeString()})`;
      ul.appendChild(li);
    });
  }

  // Chart: Reports by type
  const all = reportManager.all();
  const counts = {};
  all.forEach(r => {
    const t = (r.type || r._type || 'Unknown');
    counts[t] = (counts[t] || 0) + 1;
  });
  const labels = Object.keys(counts);
  const data = Object.values(counts);

  const ctx = document.getElementById('reportsChart').getContext('2d');
  if(reportsChart) reportsChart.destroy();
  reportsChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Reports count', data }]},
    options: { responsive:true, plugins:{legend:{display:false}}}
  });

  // Timeline chart
  const last10 = all.slice(0,10).reverse();
  const tlabels = last10.map(r => new Date(r.createdAt||r._createdAt).toLocaleTimeString());
  const tdata = last10.map((_,i)=> i+1);
  const ctx2 = document.getElementById('timelineChart').getContext('2d');
  if(timelineChart) timelineChart.destroy();
  timelineChart = new Chart(ctx2, {
    type: 'line',
    data: { labels: tlabels, datasets: [{ label: 'Recent reports', data: tdata, fill:false, tension:0.3}]},
    options:{responsive:true, plugins:{legend:{display:false}}}
  });

  // mini weather
  const lastCity = localStorage.getItem('campus_lastcity');
  const mini = document.getElementById('miniWeather');
  mini.textContent = lastCity ? `Last searched: ${lastCity}` : 'Search the Weather page for details.';
}

/* ====================
  Weather (OpenWeather API)
  ==================== */
async function onSearchWeather(){
  const city = document.getElementById('cityInput').value.trim();
  if(!city) return alert('Enter a city.');
  if(!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY.includes('PASTE_YOUR')) return alert('Insert API key in script.js');

  try{
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();
    if(data.cod && data.cod !== 200) return alert(data.message || 'City not found.');

    document.getElementById('weatherBox').innerHTML = `
      <div><strong>${data.name}, ${data.sys.country}</strong></div>
      <div>Temp: ${data.main.temp} °C (feels ${data.main.feels_like})</div>
      <div>Condition: ${data.weather[0].description}</div>
      <div>Humidity: ${data.main.humidity}%</div>
      <div>Wind: ${data.wind.speed} m/s</div>
      <div>Last updated: ${new Date().toLocaleTimeString()}</div>
    `;
    localStorage.setItem('campus_lastcity', city);
    document.getElementById('cityInput').value = '';
    renderDashboard();
  }catch(err){
    console.error(err);
    alert('Failed to fetch weather.');
  }
}

/* ====================
  Leaflet Map
  - markers for NBSC buildings (approximate)
  - clicking map opens add-report dialog that stores lat/lon
  ==================== */
let map, markersLayer;
function initMap(){
  const center = [8.2533, 124.8233]; // approximate NBSC center
  map = L.map('map').setView(center, 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(map);

  // marker layer
  markersLayer = L.layerGroup().addTo(map);

  // default NBSC markers
  const nbscMarkers = [
    {name:'Admin Building', coords:[8.2540,124.8230]},
    {name:'Guard Post A', coords:[8.2537,124.8240]},
    {name:'Clinic', coords:[8.2532,124.8228]},
    {name:'Canteen', coords:[8.2539,124.8225]},
    {name:'IT Building', coords:[8.2528,124.8239]},
    {name:'Library', coords:[8.2542,124.8241]},
    {name:'Evacuation Area', coords:[8.2525,124.8229]},
    {name:'Main Gate', coords:[8.2545,124.8219]},
  ];
  nbscMarkers.forEach(m => {
    L.marker(m.coords).addTo(markersLayer).bindPopup(m.name);
  });

  // add existing report markers
  refreshMapMarkers();

  // click to add a report location
  map.on('click', (e)=>{
    if(!currentUser) return alert('Please login to create geotagged reports.');
    const lat = e.latlng.lat.toFixed(6), lon = e.latlng.lng.toFixed(6);
    const type = prompt('Report type (e.g., Flood, Fire, Theft):');
    if(!type) return;
    const desc = prompt('Short description:');
    if(!desc) return;
    // create a report with lat/lon
    const rpt = new ReportBase(type, desc, Number(lat), Number(lon), currentUser.user);
    reportManager.add(rpt);
    refreshMapMarkers();
    renderReportsTable();
    renderDashboard();
    alert('Report saved with location.');
  });
}

// place report markers
function refreshMapMarkers(){
  markersLayer.clearLayers();
  // re-add NBSC base markers
  const nbscMarkers = [
    {name:'Admin Building', coords:[8.2540,124.8230]},
    {name:'Guard Post A', coords:[8.2537,124.8240]},
    {name:'Clinic', coords:[8.2532,124.8228]},
    {name:'Canteen', coords:[8.2539,124.8225]},
    {name:'IT Building', coords:[8.2528,124.8239]},
    {name:'Library', coords:[8.2542,124.8241]},
    {name:'Evacuation Area', coords:[8.2525,124.8229]},
    {name:'Main Gate', coords:[8.2545,124.8219]},
  ];
  nbscMarkers.forEach(m => L.marker(m.coords).addTo(markersLayer).bindPopup(m.name));

  // report markers
  reportManager.all().forEach(r => {
    if(r.lat && r.lon){
      L.circleMarker([r.lat, r.lon], {radius:6}).addTo(markersLayer)
        .bindPopup(`<b>${escapeHtml(r.type)}</b><div>${escapeHtml(r.desc)}</div><small>By: ${escapeHtml(r.createdBy)}</small>`);
    }
  });
}

function zoomToReport(id){
  const r = reportManager.find(Number(id)) || reportManager.find(id);
  if(!r || !r.lat || !r.lon) return alert('This report has no coordinates.');
  map.setView([r.lat, r.lon], 18);
}

/* ====================
  Utilities (export/import, sample data)
  ==================== */
function escapeHtml(unsafe){
  return String(unsafe).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function exportReports(){
  const data = reportManager.all();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'reports-export.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importSample(){
  if(!confirm('Load sample reports (will append)?')) return;
  const sample = [
    new ReportBase('Flood','Small flooding near pathway', 8.2536,124.8237,'espada').toJSON(),
    new SpecialReport('Fire','Kitchen fire (extinguished)', 'High', 8.2531,124.8240,'balatero').toJSON(),
    new ReportBase('Theft','Bicycle stolen near gate', 8.2543,124.8223,'simana').toJSON()
  ];
  sample.forEach(s => reportManager.add(s));
  renderReportsTable();
  renderDashboard();
  refreshMapMarkers();
  alert('Sample data loaded.');
}
