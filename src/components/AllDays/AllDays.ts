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
        dayjs() {
            return dayjs
        }
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