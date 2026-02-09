import /* Vue, */ { createApp } from 'vue'
import ShFrontend from './lib/plugins/ShFrontend.js'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'sweetalert2/dist/sweetalert2.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'
import router from './app/routes/router.js'

import './views/assets/main.css'


// import SampleComponent from './views/autoform/SampleComponent.vue'

import PasswordInput from './lib/components/form-components/PasswordInput.vue'
import ViewTaskPopup from './views/popups/ViewTaskPopup.vue'
import NoRecords from './lib/components/others/NoRecords.vue'
import {streamline} from '@iankibetsh/vue-streamline'

const app = createApp(App)
app.use(createPinia())
const shFormElementClasses = {
  formGroup: 'mb-2',
  formLabel: 'form-label',
  helperText: 'form-text',
  actionBtn: 'btn btn-primary',
  formErrorTitle: 'alert alert-danger',
  invalidFeedback: 'invalid-feedback',
  formControl: 'form-control'
}
const shFormComponents = {
  // text: SampleComponent,
  // phone: SampleComponent,
  // email: SampleComponent,
  // textArea: SampleComponent,
  // number: SampleComponent,
  password: PasswordInput,
}
const UserdetailsColumns = [
  {
    name: 'name',
    label: 'Name'
  },
  {
    name: 'email',
    label: 'Email'
  },
  {
    name: 'phone',
    label: 'Phone'
  }
]
app.use(ShFrontend,{
  sessionTimeout: 400,
  defaultRange: 'All Time',
  loginUrl: '/sh-auth',
  logoutApiEndpoint: 'auth/logout',
  redirectLogin: '/dashboard',
  router: router,
  registerTitle: 'Welcome, create a new account',
  registerSubTitle: 'Create a new account to access the system',
  loginTitle: 'Login to your account',
  tablePaginationStyle: 'table', //loadMore,table
  noRecordsComponent: NoRecords,
  tablePerPage: 3,
  enableTableCache: true,
  shFormElementClasses,
  toastTimer: 4000,
  shFormComponents,
  UserdetailsColumns,
  userEndpoint: 'auth/user',
  cacheUserFields: ['id']
})

app.use(streamline, {
    streamlineHeaders: {
        // 'Content-Type': 'application/json',
        // 'Accept': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
    },
    streamlineUrl: import.meta.env.VITE_APP_API_URL + 'streamline',
    enableCache: true,
})


//popups
app.component('ViewTask', ViewTaskPopup)
app.use(router)

app.mount('#main_vx_app')
