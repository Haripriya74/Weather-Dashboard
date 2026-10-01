const themeBtn = document.getElementById("themeBtn");
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

const cityName = document.getElementById("cityName");
const dateElement = document.getElementById("date");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const weatherIcon = document.getElementById("weatherIcon");

const forecastContainer = document.getElementById("forecast");
const recentSearches = document.getElementById("recentSearches");
const errorMessage = document.getElementById("errorMessage");

themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeBtn.textContent = "☀️";
        localStorage.setItem("weatherTheme", "dark");
    } else {
        themeBtn.textContent = "🌙";
        localStorage.setItem("weatherTheme", "light");
    }

});


if (localStorage.getItem("weatherTheme") === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";

}

searchBtn.addEventListener("click", function () {

    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    getWeather(city);

});


cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        searchBtn.click();
    }

});
async function getWeather(city) {

    try {

        errorMessage.textContent = "";

        searchBtn.textContent = "Searching...";
        searchBtn.disabled = true;


        // Find city coordinates

        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );


        if (!locationResponse.ok) {
            throw new Error("Unable to find location.");
        }


        const locationData = await locationResponse.json();


        if (!locationData.results || locationData.results.length === 0) {
            throw new Error("City not found.");
        }


        const location = locationData.results[0];


        // Get weather using coordinates

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );


        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }


        const weatherData = await weatherResponse.json();


        displayWeather(location, weatherData);

        saveRecentSearch(location.name);

        displayRecentSearches();


    } catch (error) {

        showError(error.message);

    } finally {

        searchBtn.textContent = "Search";

        searchBtn.disabled = false;

    }

}

function displayWeather(location, data) {

    const current = data.current;


    cityName.textContent = location.name;


    if (location.country) {

        cityName.textContent =
            `${location.name}, ${location.country_code}`;

    }


    const currentDate = new Date();

    dateElement.textContent =
        currentDate.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });


    temperature.textContent =
        `${Math.round(current.temperature_2m)}°`;


    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°`;


    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    wind.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;


    condition.textContent =
        getWeatherDescription(current.weather_code);


    weatherIcon.textContent =
        getWeatherIcon(current.weather_code);


    displayForecast(data.daily);

}

function getWeatherDescription(code) {

    if (code === 0) {
        return "Clear sky";
    }

    if (code === 1 || code === 2) {
        return "Partly cloudy";
    }

    if (code === 3) {
        return "Overcast";
    }

    if ([45, 48].includes(code)) {
        return "Foggy";
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return "Drizzle";
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
        return "Rain";
    }

    if ([71, 73, 75, 77].includes(code)) {
        return "Snow";
    }

    if ([80, 81, 82].includes(code)) {
        return "Rain showers";
    }

    if ([95, 96, 99].includes(code)) {
        return "Thunderstorm";
    }

    return "Unknown";
}


function getWeatherIcon(code) {

    if (code === 0) {
        return "☀️";
    }

    if (code === 1 || code === 2) {
        return "🌤️";
    }

    if (code === 3) {
        return "☁️";
    }

    if ([45, 48].includes(code)) {
        return "🌫️";
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return "🌦️";
    }

    if ([61, 63, 65, 66, 67].includes(code)) {
        return "🌧️";
    }

    if ([71, 73, 75, 77].includes(code)) {
        return "❄️";
    }

    if ([80, 81, 82].includes(code)) {
        return "🌦️";
    }

    if ([95, 96, 99].includes(code)) {
        return "⛈️";
    }

    return "🌤️";
}

function displayForecast(daily) {

    forecastContainer.innerHTML = "";


    for (let i = 1; i < 6; i++) {

        const date = new Date(daily.time[i]);


        const day = date.toLocaleDateString("en-IN", {
            weekday: "short"
        });


        const maxTemp =
            Math.round(daily.temperature_2m_max[i]);


        const minTemp =
            Math.round(daily.temperature_2m_min[i]);


        const icon =
            getWeatherIcon(daily.weather_code[i]);


        const card = document.createElement("div");

        card.className = "forecast-card";


        card.innerHTML = `

            <p>${day}</p>

            <span>${icon}</span>

            <strong>${maxTemp}°</strong>

            <small>${minTemp}°</small>

        `;


        forecastContainer.appendChild(card);

    }

}


function saveRecentSearch(city) {

    let searches =
        JSON.parse(localStorage.getItem("recentCities")) || [];


    searches =
        searches.filter(item => item.toLowerCase() !== city.toLowerCase());


    searches.unshift(city);


    searches = searches.slice(0, 5);


    localStorage.setItem(
        "recentCities",
        JSON.stringify(searches)
    );

}


function displayRecentSearches() {

    const searches =
        JSON.parse(localStorage.getItem("recentCities")) || [];


    recentSearches.innerHTML = "";


    searches.forEach(city => {

        const button =
            document.createElement("button");


        button.textContent = city;


        button.addEventListener("click", function () {

            cityInput.value = city;

            getWeather(city);

        });


        recentSearches.appendChild(button);

    });

}


displayRecentSearches();


function showError(message) {

    errorMessage.textContent = message;

}