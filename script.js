
      const apiKey = "7d5e74e7b112e34001dc87b79a2fc7c3";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const weatherSection = document.querySelector(".weather");
const errorSection = document.querySelector(".error");
const forecastContainer = document.querySelector(".forecast-container");
const forecastSection = document.querySelector(".forecast");

// Weather icons mapping
const weatherIcons = {
  "Clear": "img/clear.png",
  "Clouds": "img/clouds.png",
  "Rain": "img/rain.png",
  "Drizzle": "img/drizzle.png",
  "Mist": "img/mist.png",
  "Snow": "img/snow.png",
  "Thunderstorm": "img/storm.png"
};

// Format date to Day, Month Date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Get weather icon based on weather condition
function getWeatherIcon(condition) {
  return weatherIcons[condition] || "img/clouds.png";
}

// Get current weather for the city
async function checkWeather(city) {
  try {
    const response = await fetch(weatherApiUrl + city + `&appid=${apiKey}`);
    
    if (!response.ok) {
      showError();
      return null;
    }
    
    const data = await response.json();
    updateCurrentWeather(data);
    return data;
  } catch (error) {
    console.error("Error fetching current weather:", error);
    showError();
    return null;
  }
}

// Get 5-day forecast for the city
async function getForecast(city) {
  try {
    const response = await fetch(forecastApiUrl + city + `&appid=${apiKey}`);
    
    if (!response.ok) {
      return;
    }
    
    const data = await response.json();
    updateForecast(data);
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}

// Update current weather UI
function updateCurrentWeather(data) {
  document.querySelector(".city").innerHTML = data.name;
  document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
  document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
  document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
  
  const weatherCondition = data.weather[0].main;
  weatherIcon.src = getWeatherIcon(weatherCondition);
  
  weatherSection.style.display = "block";
  forecastContainer.style.display = "block";
  errorSection.style.display = "none";
}

// Update forecast UI
function updateForecast(data) {
  forecastSection.innerHTML = "";
  
  // Group forecast by day (taking noon forecast for each day)
  const dailyForecasts = {};
  
  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    const hour = item.dt_txt.split(' ')[1].split(':')[0];
    
    // Store the forecast for 12:00 (noon) for each day
    if (hour === "12") {
      dailyForecasts[date] = item;
    }
  });
  
  // Take only 5 days of forecast
  const forecastDays = Object.values(dailyForecasts).slice(0, 5);
  
  // Create forecast cards
  forecastDays.forEach(day => {
    const weatherCondition = day.weather[0].main;
    const forecastCard = document.createElement("div");
    forecastCard.classList.add("forecast-day");
    
    forecastCard.innerHTML = `
      <h4>${formatDate(day.dt_txt)}</h4>
      <img src="${getWeatherIcon(weatherCondition)}" alt="${weatherCondition}">
      <p>${Math.round(day.main.temp)}°C</p>
      <p class="min-max">${Math.round(day.main.temp_min)}° / ${Math.round(day.main.temp_max)}°</p>
      <p class="condition">${day.weather[0].description}</p>
    `;
    
    forecastSection.appendChild(forecastCard);
  });
}

// Show error message
function showError() {
  weatherSection.style.display = "none";
  forecastContainer.style.display = "none";
  errorSection.style.display = "block";
}

// Event listeners
searchBtn.addEventListener("click", () => {
  const city = searchBox.value.trim();
  if (city) {
    checkWeather(city).then(data => {
      if (data) getForecast(city);
    });
  }
});

searchBox.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const city = searchBox.value.trim();
    if (city) {
      checkWeather(city).then(data => {
        if (data) getForecast(city);
      });
    }
  }
});

// Load default city on page load (uncomment and set default city if needed)
// window.addEventListener("load", () => {
//   checkWeather("London").then(data => {
//     if (data) getForecast("London");
//   });
// });
