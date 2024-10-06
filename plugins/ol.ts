
import 'vue3-openlayers/styles.css';
import OpenLayersMap from 'vue3-openlayers';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(OpenLayersMap);
});
