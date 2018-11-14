import Vue from 'vue'
import App from './App.vue'
import Vuesax from 'vuesax'
import Buefy from 'buefy'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faCoffee)

import 'buefy/dist/buefy.css'
import 'vuesax/dist/vuesax.css'

Vue.use(Vuesax, Buefy);
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false

new Vue({
    render: h => h(App)
}).$mount('#app')
