async function getWeather() {
  let city = document.getElementById("city").value;
  let apiKey = "YOUR_API_KEY"; // OpenWeather API Key
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  let response = await fetch(url);
  let data = await response.json();

  document.getElementById("temp").innerText = data.main.temp + "°C";
  document.getElementById("condition").innerText = data.weather[0].description;
  document.getElementById("humidity").innerText = "Humidity: " + data.main.humidity + "%";
  document.getElementById("wind").innerText = "Wind: " + data.wind.speed + " km/h";
}
