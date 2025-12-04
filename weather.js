document.getElementById("searchWeatherBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Enter a city name");

  const apiKey = "9d9f6f36546d0442f55deeb57e8b9553"; // replace

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) return alert("City not found");

      const box = document.getElementById("weatherBox");
      box.innerHTML = `
        <h3>${data.name}</h3>
        <p>Temp: ${data.main.temp}°C</p>
        <p>Weather: ${data.weather[0].description}</p>
      `;

      // Save for dashboard mini weather
      localStorage.setItem("lastWeather", `${data.name}: ${data.main.temp}°C`);
      loadDashboard();
    });
});
