import Vue from 'vue'
import App from './App.vue'
import Vuesax from 'vuesax'
import Buefy from 'buefy'
require('font-awesome/scss/font-awesome.scss')
import 'buefy/dist/buefy.css'
import 'vuesax/dist/vuesax.css'

Vue.use(Vuesax, Buefy);
Vue.config.productionTip = false

new Vue({
    render: h => h(App)
}).$mount('#app')
