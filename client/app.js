import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import "@vueform/toggle/themes/default.css";

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

createApp(App)
    .use(ToastPlugin)
    .mount('#app');
