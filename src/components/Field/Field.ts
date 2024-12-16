import { defineComponent, ref } from 'vue';
import axios from "axios";
import getWindDirection from '../../utils/getWindDirection.ts';
import dayjs from 'dayjs';
export default defineComponent({
    name: 'Field',
    emits: ['updateWeather'],
    setup(_, { emit }) {
        const cityName = ref('');
        const errorMessage = ref('');

        const fetchWeather = async () => {
            const apiKey = process.env.VUE_APP_API_KEY;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName.value}&appid=${apiKey}&units=metric`;
            try {
                const response = await axios.get(apiUrl);
                const weather = {
                    location: response.data.name,
                    temperature: Math.round(response.data.main.temp),
                    feelsLike: Math.round(response.data.main.feels_like),
                    status: response.data.weather[0].main,
                    description: response.data.weather[0].description,
                    humidity: response.data.main.humidity,
                    pressure : Math.round(response.data.main.pressure * 0.75006),
                    speedWind: Math.round(response.data.wind.speed),
                    gustsWind: Math.round(response.data.wind.gust),
                    windDirection: getWindDirection(response.data.wind.deg),
                    sunrise: dayjs.unix(response.data.sys.sunrise).format('HH:mm'),
                    sunset: dayjs.unix(response.data.sys.sunset).format('HH:mm'),
                    icon: response.data.weather[0].icon,
                    latitude: response.data.coord.lat,
                    longitude: response.data.coord.lon,
                };
                emit('updateWeather', weather);
                cityName.value = '';
                errorMessage.value = '';
            } catch (error: any) {
                errorMessage.value =
                    error.response?.data?.message || 'An error occurred. Please try again.';
            }
        };

        return { cityName, errorMessage, fetchWeather };
    },
});