import ShUserProfile from '../components/core/auth/ShUserProfile.vue'
import ShStorage from '../repo/repositories/ShStorage.js'
import Departments from '../components/core/Departments/Departments.vue'
import Department from '../components/core/Departments/department/Department.vue'
import ManagePermissions from '../components/core/Departments/department/ManagePermissions.vue'
import ShAuth from '../components/core/auth/ShAuth.vue'
import TextInput from '../components/form-components/TextInput.vue'
import NoRecords from '../components/others/NoRecords.vue'
import isAllowedTo from '../custom-directives/isAllowedTo.js'
import { initApi } from '../repo/helpers/ShApis'
const ShFrontend = {
  install: (app, options) => {

    // add user-can directive
    app.directive('if-user-can', isAllowedTo)

    if(options.sessionTimeout){
      app.provide('sessionTimeout',options.sessionTimeout)
      ShStorage.setItem('sessionTimeout',options.sessionTimeout)
    }
    const shFormElements = options.shFormElementClasses ?? {}

    const defaultFormElementClasses = {
      formGroup: shFormElements.formGroup ?? 'mb-2',
      formLabel: shFormElements.formLabel ?? 'form-label',
      helperText: shFormElements.helperText ?? 'form-text',
      actionBtn: shFormElements.actionBtn ?? 'btn btn-primary',
      formErrorTitle: shFormElements.formErrorTitle ?? 'alert alert-danger',
      invalidFeedback: shFormElements.invalidFeedback ?? 'invalid-feedback',
      formControl: shFormElements.formControl ?? 'invalid-feedback',
    }
    const swalPosition = options.swalPosition ?? 'top-end'
    const loginEndpoint = options.loginEndpoint ?? 'auth/login'
    const registerEndpoint = options.registerEndpoint ?? 'auth/register'
    const forgotEndpoint = options.forgotEndpoint ?? 'auth/forgot-password'
    const registerTitle = options.registerTitle ?? 'Create a new account'
    const registerSubTitle = options.registerSubTitle ?? `It's quick and easy`
    const loginTitle = options.loginTitle ?? `Login to your account`
    const logoutApiEndpoint = options.logoutApiEndpoint ?? `auth/logout`
    const formTextInput = options.formTextInput ?? TextInput
    const loginUrl = options.loginUrl ?? `/login`
    const redirectLogin = options.redirectLogin ?? `/`
    const redirectRegister = options.redirectRegister ?? `/`
    const noRecordsComponent = options.noRecordsComponent ?? NoRecords
    const registrationFields = options.registrationFields ?? ['name','email','phone','password','password_confirmation']
    const AuthComponent = options.authComponent ?? ShAuth
    const userEndpoint = options.userEndpoint ?? 'auth/user'
    const cacheUserFields = options.cacheUserFields ?? ['id']
    const baseApiUrl = options.baseApiUrl ?? import.meta.env.VITE_APP_API_URL
    app.provide('loginEndpoint',loginEndpoint)
    app.provide('registerEndpoint', registerEndpoint)
    app.provide('registrationFields', registrationFields)
    app.provide('registerTitle', registerTitle)
    app.provide('registerSubTitle', registerSubTitle)
    app.provide('redirectLogin', redirectLogin)
    app.provide('loginTitle', loginTitle)
    app.provide('redirectRegister', redirectRegister)
    app.provide('logoutApiEndpoint', logoutApiEndpoint)
    app.provide('formComponents', options.shFormComponents ?? {})
    app.provide('loginUrl', loginUrl)
    app.provide('shFormElementClasses',defaultFormElementClasses)
    app.provide('noRecordsComponent',noRecordsComponent)
    app.provide('forgotEndpoint',forgotEndpoint)
    app.provide('userEndpoint',userEndpoint)
    app.provide('cacheUserFields', cacheUserFields)
    window.swalPosition = swalPosition
    initApi(baseApiUrl)
    if(options.router) {
      options.router.addRoute({
        path: '/sh-auth',
        component: AuthComponent
      })
      options.router.addRoute({
        path: '/sh-departments',
        component: Departments
      })
      options.router.addRoute({
        path: '/sh-departments/permissions/:id',
        component: Department
      })
      options.router.addRoute({
        path: '/sh-departments/manage-permissions/:id',
        component: ManagePermissions
      })
      options.router.addRoute({
        path: '/sh-user-profile',
        component: ShUserProfile
      })
    }
    //filter unwanted config items from options to be put in local storage
    const removeKeys = ['formTextInput','router','shFormElementClasses']
    const allowKeys = ['enableTableCache', 'cacheUserFields']
    Object.keys(options).map(key=> ((!['string','integer','number','boolean'].includes(typeof options[key]) && !allowKeys.includes(key)) || removeKeys.includes(key)) && delete options[key])

    ShStorage.setItem('ShConfig',options)
  }
}
export default ShFrontend
