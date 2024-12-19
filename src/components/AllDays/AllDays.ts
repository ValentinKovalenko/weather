import {defineComponent, ref, watch, PropType} from "vue";
import axios from "axios";
import dayjs from "dayjs";

interface Forecast {
    date: string;
    dayWeather: [];
    status: string;
    icon: string;
}

export default defineComponent({
    name: "AllDays",
    methods: {
        formatDay: (day: string): string => dayjs(day).format("dddd"),
        formatTime: (timestamp: number): string => dayjs.unix(timestamp).format("HH:mm"),
        formatPressure: (pressure: number): number => Math.round(pressure * 0.75006),
        iconUrl: (icon: string): string => `https://openweathermap.org/img/wn/${icon}@2x.png`,
        speedWind: (wind: number): number => Math.round(wind * 0.75006),
        formatTemp: (temp: number): number => parseFloat(temp.toFixed(1)),
    },
    props: {
        latitude: {
            type: [Number, null] as PropType<number | null>,
            required: true,
        },
        longitude: {
            type: [Number, null] as PropType<number | null>,
            required: true,
        },
        coordinatesLon: {
            type: Number,
            required: false,
        },
        coordinatesLat: {
            type: Number,
            required: false,
        },
        uniqueDates: {
            type: Array as PropType<string[]>,
            required: true,
        },
    },
    setup(props) {
        const forecastData = ref<Forecast[] | null>(null);
        const forecastError = ref<string | null>(null);
        const userLatitude = ref<number | null>(props.coordinatesLat || null);
        const userLongitude = ref<number | null>(props.coordinatesLon || null);
        const activeDayIndex = ref(0);


        const fetchForecast = async () => {
            const apiKey = process.env.VUE_APP_API_KEY;
            const lat = props.latitude || userLatitude.value;
            const lon = props.longitude || userLongitude.value;
            if (lat === null || lon === null) {
                forecastError.value = "Missing coordinates.";
                return;
            }
            const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            try {
                const response = await axios.get(apiUrl);
                const dailyForecasts = props.uniqueDates.map((date) => {
                    const dailyData = response.data.list.filter((entry: any) =>
                        entry.dt_txt.startsWith(date)
                    );
                    const {weather} = dailyData[0];
                    return {
                        date,
                        dayWeather: dailyData,
                        status: weather[0].main,
                        icon: weather[0].icon,
                    };
                });

                forecastData.value = dailyForecasts;
                forecastError.value = null;
            } catch (error: any) {
                forecastError.value =
                    error.response?.data?.message || "Unable to fetch forecast data.";
            }
        };

        const setActiveDay = (index: number) => activeDayIndex.value = index;

        watch(
            () => [props.latitude, props.longitude, props.uniqueDates],
            fetchForecast,
            {immediate: true}
        );

        return {forecastData, forecastError, activeDayIndex, setActiveDay};
    },
});