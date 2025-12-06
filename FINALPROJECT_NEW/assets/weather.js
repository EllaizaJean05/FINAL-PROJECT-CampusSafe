const OWM_API_KEY = '5b1022446d333e036348ab6af523a92c'; 
const NBSC_COORDS = { lat: 8.360191, lon: 124.868320 };

(function () {
    if (!document.getElementById('cityForm')) return;

    const cityForm = document.getElementById('cityForm');
    const cityInput = document.getElementById('cityInput');
    const useNBSC = document.getElementById('useNBSC');

    // DOM elements for rendering
    const cityLabel = document.getElementById('wcity');
    const temp = document.getElementById('wtemp');
    const desc = document.getElementById('wdesc');
    const hum = document.getElementById('whumidity');
    const wind = document.getElementById('wwind');

    cityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (!city) {
             renderError('Enter a city name or click Use NBSC.');
             return;
        }
        await fetchByCity(city);
    });

    useNBSC.addEventListener('click', async () => {
        await fetchByCoords(NBSC_COORDS.lat, NBSC_COORDS.lon);
    });

    function renderError(message) {
        cityLabel.textContent = 'Error fetching weather';
        temp.textContent = '--°C';
        desc.textContent = message;
        hum.textContent = '--';
        wind.textContent = '--';
    }
    async function fetchByCity(city) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OWM_API_KEY}&units=metric`;
            const res = await fetch(url);
            if (!res.ok) {
                 // Throw a specific error based on status if needed
                 if (res.status === 404) throw new Error('City not found. Try a different city.');
                 throw new Error('API error. Check key or connection.');
            }
            const data = await res.json();
            renderWeather(data);
        } catch (err) {
            console.error('Weather API error:', err.message);
            renderError(err.message);
        }
    }

    async function fetchByCoords(lat, lon) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('API error. Check key or connection.');
            const data = await res.json();
            renderWeather(data);
        } catch (err) {
            console.error('Weather API error:', err.message);
            renderError(err.message);
        }
    }

    function renderWeather(data) {
        // Assume Weather class exists in classes.js
        cityLabel.textContent = `${data.name}, ${data.sys?.country || ''}`;
        temp.textContent = `${Math.round(data.main.temp)}°C`;
        desc.textContent = data.weather?.[0]?.description || '';
        hum.textContent = data.main.humidity;
        wind.textContent = data.wind.speed;
        
        const w = new Weather({
            city: data.name,
            temp: data.main.temp,
            description: data.weather?.[0]?.description || '',
            humidity: data.main.humidity,
            wind: data.wind.speed
        });
        localStorage.setItem('campussafe_lastweather', JSON.stringify(w));
    }
    fetchByCoords(NBSC_COORDS.lat, NBSC_COORDS.lon);

})();