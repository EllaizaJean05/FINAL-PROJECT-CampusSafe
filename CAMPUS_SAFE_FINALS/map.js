// // let map = L.map("map").setView([8.157, 125.127], 13);

// // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// // // Click to create a report
// // map.on("click", (e) => {
// //   const type = prompt("Report Type:");
// //   const desc = prompt("Description:");

// //   if (!type || !desc) return;

// //   addReport(type, desc, e.latlng.lat, e.latlng.lng);
// // });
//  const map = L.map('map').setView([8.1545, 125.1322], 15);

//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             attribution: '&copy; OpenStreetMap contributors'
//         }).addTo(map);

//         fetch('data.json')
//             .then(response => response.json())
//             .then(spots => {
//                 spots.forEach(spot => {
//                     const marker = L.marker([spot.lat, spot.lng]).addTo(map);
//                     marker.bindPopup(`
//                         <div class="popup-wrapper">
//                             <img src="${spot.image}" class="popup-image">
//                             <h3>${spot.name}</h3>
//                             <p>${spot.desc}</p>
//                         </div>
//                     `);
//                 });
//             })
//             .catch(error => console.error('Error loading data.json:', error));

// js/map.js
document.addEventListener('DOMContentLoaded', () => {
  Auth.protectPage();

  // initialize map
  const map = L.map('map-full').setView([14.5995,120.9842], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);

  // sample marker data (could be replaced by JSON file or localStorage)
  const MARKERS_KEY = 'ecowatch_markers';
  let markersData = JSON.parse(localStorage.getItem(MARKERS_KEY) || 'null');
  if(!markersData) {
    markersData = [
      {id:1,type:'waste',title:'Illegal Dumping',lat:14.610,lon:120.99,desc:'Illegal dumping near market'},
      {id:2,type:'trees',title:'Tree Planting',lat:14.605,lon:120.97,desc:'New saplings planted'},
      {id:3,type:'cleanup',title:'Cleanup Site',lat:14.595,lon:120.98,desc:'Beach cleanup event'}
    ];
    localStorage.setItem(MARKERS_KEY, JSON.stringify(markersData));
  }

  const leafletMarkers = [];

  function drawMarkers(filter='all'){
    // clear previous
    leafletMarkers.forEach(m=>map.removeLayer(m));
    leafletMarkers.length = 0;

    markersData.forEach(m=>{
      if(filter!=='all' && m.type!==filter) return;
      const color = (m.type==='waste')?'red':(m.type==='trees')?'green':'blue';
      const marker = L.circleMarker([m.lat,m.lon],{radius:8,color}).addTo(map);
      marker.bindPopup(`<b>${m.title}</b><br>${m.desc}`);
      leafletMarkers.push(marker);
    });
  }
  drawMarkers('all');

  // filter buttons
  document.querySelectorAll('[data-filter]').forEach(btn=>{
    btn.addEventListener('click', () => {
      const f = btn.getAttribute('data-filter');
      drawMarkers(f);
    });
  });

  // center to location
  document.getElementById('center-my-location').addEventListener('click', () => {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos=>{
        map.setView([pos.coords.latitude,pos.coords.longitude],13);
      }, ()=>alert('Unable to get location'));
    } else alert('Geolocation not supported');
  });

  // click on map to add temporary marker and ask to save as report
  map.on('click', e=>{
    const lat = e.latlng.lat, lon = e.latlng.lng;
    const title = prompt('Add marker title (e.g., Illegal Dumping):');
    if(!title) return;
    const type = prompt('Type (waste/trees/cleanup):','waste');
    const desc = prompt('Short description:','');
    const id = Date.now();
    const obj = {id,type, title, lat, lon, desc};
    markersData.push(obj);
    localStorage.setItem(MARKERS_KEY, JSON.stringify(markersData));
    drawMarkers('all');
    alert('Marker saved. It will appear on the map and in localStorage.');
  });

});
