<template>
  <div class="image"></div>
  <div class="rain">
    <div class="container">
      <div class="main">
       <MainWeather/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import MainWeather from "./components/MainWeather/MainWeather.vue";

export default defineComponent({
  name: "App",
  components: {MainWeather},
});
</script>

<style scoped src="./style.css"></style>
