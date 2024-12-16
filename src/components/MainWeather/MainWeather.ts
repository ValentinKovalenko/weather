import { defineComponent, ref, onMounted } from "vue";
import Field from "../Field/Field.vue";
import Today from "../Today/Today.vue";
import axios from "axios";
import getWindDirection from "../../utils/getWindDirection.ts";
import dayjs from "dayjs";
import AllDays from "../AllDays/AllDays.vue";

interface WeatherData {
    location: string;
    temperature: number;
    feelsLike: number;
    status: string;
    description: string;
    humidity: number;
    pressure: number;
    speedWind: number;
    gustsWind: number;
    windDirection: string;
    sunrise: string;
    sunset: string;
    icon: string;
    latitude?: number;
    longitude?: number;
}

export default defineComponent({
    name: "MainWeather",
    components: { Field, Today, AllDays },
    setup() {
        const weatherData = ref<WeatherData | null>(null);
        const errorMessage = ref<string | null>(null);
        const latitude = ref<number | null>(null);
        const coordinatesLat = ref<number | null>(null);
        const coordinatesLon = ref<number | null>(null);
        const longitude = ref<number | null>(null);
        const uniqueDates = ref<string[]>([]);

        const updateWeatherData = async (data: WeatherData) => {
            weatherData.value = data;
            latitude.value = data.latitude ?? null;
            longitude.value = data.longitude ?? null;
            await fetchForecast(data.latitude!, data.longitude!);
        };
        const fetchWeatherByLocation = async (latitude: number, longitude: number) => {
            const apiKey = process.env.VUE_APP_API_KEY;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            try {
                const response = await axios.get(apiUrl);
                const weather: WeatherData = {
                    location: response.data.name,
                    temperature: Math.round(response.data.main.temp),
                    feelsLike: Math.round(response.data.main.feels_like),
                    status: response.data.weather[0].main,
                    description: response.data.weather[0].description,
                    humidity: response.data.main.humidity,
                    pressure: Math.round(response.data.main.pressure * 0.75006),
                    speedWind: Math.round(response.data.wind.speed),
                    gustsWind: Math.round(response.data.wind.gust),
                    windDirection: getWindDirection(response.data.wind.deg),
                    sunrise: dayjs.unix(response.data.sys.sunrise).format("HH:mm"),
                    sunset: dayjs.unix(response.data.sys.sunset).format("HH:mm"),
                    icon: response.data.weather[0].icon,
                    latitude: response.data.coord.lat,
                    longitude: response.data.coord.lon,
                };
                weatherData.value = weather;
                errorMessage.value = null;

               await fetchForecast(latitude, longitude);
            } catch (error: any) {
                errorMessage.value = error.response?.data?.message || "Unable to fetch weather data.";
            }
        };

        const fetchForecast = async (latitude: number, longitude: number) => {
            const apiKey = process.env.VUE_APP_API_KEY;
            const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            try {
                const response = await axios.get(apiUrl);
                coordinatesLat.value = latitude;
                coordinatesLon.value = longitude;
                uniqueDates.value = Array.from(
                    new Set(response.data.list.map((entry: any) => entry.dt_txt.split(" ")[0]))
                )
            } catch (error: any) {
                errorMessage.value = error.response?.data?.message || "Unable to fetch forecast data.";
            }
        };

        onMounted( () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude: lat, longitude: lon } = position.coords;
                        fetchWeatherByLocation(lat, lon);
                    },
                    () => {
                        errorMessage.value = "Location access denied.";
                    }
                );
            } else {
                errorMessage.value = "Geolocation is not supported by your browser.";
            }
        });

        return {
            weatherData,
            updateWeatherData,
            errorMessage,
            latitude,
            coordinatesLat,
            coordinatesLon,
            longitude,
            uniqueDates,
        };
    },
});