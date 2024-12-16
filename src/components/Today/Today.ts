import { defineComponent } from 'vue';
export default defineComponent({
    name: 'Today',
    props: {
        location: String,
        temperature: Number,
        feelsLike: Number,
        status: String,
        description: String,
        speedWind: Number,
        gustsWind: Number,
        humidity: Number,
        pressure: Number,
        windDirection: String,
        sunrise: String,
        sunset: String,
        icon: String,
    },
    computed: {
        iconUrl(): string {
            return `https://openweathermap.org/img/wn/${this.icon}@2x.png`;
        },
    },
});