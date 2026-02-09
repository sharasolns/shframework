import ShStorage from '../repositories/ShStorage.js'
import shIndexedDB from '../repositories/ShIndexedDB.js'
import Swal from 'sweetalert2'
import apis from './ShApis.js'
import { DateTime } from 'luxon'
import shApis from './ShApis.js'
import { Modal,Offcanvas } from 'bootstrap'

function swalSuccess(message){
    Swal.fire('Success!', message, 'success')
}

function swalError(message){
    Swal.fire('Error!', message, 'error')
}

function swalHttpError(reason){
    let error = ''
    if (typeof reason !== 'undefined') {
        if (typeof reason.response !== 'undefined') {
            let reasonString = ''
            if (typeof reason.response.data === 'string') {
                reasonString = reason.response.data
            } else {
                reasonString = JSON.stringify(reason.response.data)
            }
            error = reason.response.status + ': ' + reason.response.statusText + '<br/>' + reasonString
        } else {
            if (typeof reason !== 'string') {
                error = 'A Unexpected script error occurred<br/>' + JSON.stringify(reason)
            } else {
                error = 'A Unexpected script error occurred<br/>' + JSON.stringify(reason)
            }
        }
    } else {
        if (typeof reason !== 'string') {
            error = 'A Unexpected script error occurred<br/>' + JSON.stringify(reason)
        } else {
            error = 'A Unexpected script error occurred<br/>' + JSON.stringify(reason)
        }
    }
    Swal.fire('Error!', error, 'error')
}

function runSilentRequest(url){
    return apis.doPost(url)
}

function setTabCounts(url){
    apis.doGet(url).then(res => {
        Object.keys(res.data).forEach(key => {
            const elem = document.getElementById(key)
            if (elem === null) {
                return
            }
            if (typeof elem !== 'undefined') {
                let txt = elem.innerHTML
                txt = txt.split('<i class="d-none"></i>')[0]
                if (parseInt(res.data[key]) > 0) {
                    elem.innerHTML = txt + '<i class="d-none"></i><sup class="rounded-circle p-1 bg-info text-white">' + res.data[key] + '</sup>'
                }
            }
            // document.getElementById(key).innerHTML res.data[key]
        })
    })
}

function formatHttpCatchError(reason){
    let error = ''
    if (typeof reason !== 'undefined') {
        if (typeof reason.response !== 'undefined') {
            alert('here')
            let reasonString = ''
            if (typeof reason.response.data === 'string') {
                reasonString = reason.response.data
            } else {
                reasonString = JSON.stringify(reason.response.data)
            }
            error = reason.response.status + ': ' + reason.response.statusText + '<br/>' + reasonString
        } else {
            if (typeof reason !== 'string') {
                error = 'A Unexpected script error occurred<br/>' + JSON.stringify(reason)
            } else {
                error = 'A Unexpected script error occurred<br/>' + JSON.stringify(reason)
            }
        }
    } else {
        if (typeof reason !== 'string') {
            error = 'A Unexpected script error occurred<br/>' + JSON.stringify(reason)
        } else {
            error = 'A Unexpected script error occurred<br/>' + JSON.stringify(reason)
        }
    }
    return error
}

function getMenuCount(url){
    apis.doGet(url).then(res => {
    })
}

const signOutUser = () => {
    const loginUrl = getShConfig('loginUrl', 'auth/login')
    const logoutApiEndPoint = getShConfig('logoutApiEndpoint', 'auth/logout')
    shApis.doPost(logoutApiEndPoint).then(res => {
        ShStorage.removeItem('access_token')
        ShStorage.removeItem('user')
        ShStorage.removeItem('last_activity')
        window.location.href = loginUrl
    }).catch(ex => {
        ShStorage.removeItem('access_token')
        ShStorage.removeItem('user')
        ShStorage.removeItem('last_activity')
        window.location.href = loginUrl
    })
}


function getShConfig(key = null, def = ''){
    const config = ShStorage.getItem('ShConfig') ?? {}
    if (key) {
        return config[key] ?? def
    }
    return config
}

function showToast(message, toastType, config){
    if(!message){
        return
    }
    const mixinConfig = {
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        customClass: {
            popup: 'colored-toast'
        },
        iconColor: 'white',
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    }
    if (!toastType) {
        toastType = 'success'
    }
    if (config) {
        Object.keys(config).map(key =>{
            let newKey = key
            if(key === 'duration'){
                newKey = 'timer'
            }
            if(key === 'timeout'){
                newKey = 'timer'
            }
            mixinConfig[newKey] = config[key]
        })
    }
    // console.log(mixinConfig)
    const Toast = Swal.mixin(mixinConfig)
    // Toast.mixin({
    //   position: 'top'
    // })
    Toast.fire({
        icon: toastType,
        title: message,
    })
}

async function runPlainRequest(url, message, title, data){
    if (typeof title === 'undefined') {
        title = null
    }
    return Swal.fire({
        title: title !== null ? title : 'Are you sure?',
        html: message,
        showCancelButton: true,
        confirmButtonColor: '#32c787',
        cancelButtonText: 'No, cancel',
        confirmButtonText: 'Yes, Proceed!',
        reverseButtons: true,
        showLoaderOnConfirm: true,
        preConfirm: () => {
            return apis.doPost(url, data).then(function (response){
                return {
                    response: response.data,
                    success: true
                }
            })
                .catch(error => {
                    return {
                        success: false,
                        error: error,
                        message: error.message
                    }
                })
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
}
async function confirmAction(title,message){
    if (typeof title === 'undefined') {
        title = null
    }
    return Swal.fire({
        title: title !== null ? title : 'Are you sure?',
        html: message,
        showCancelButton: true,
        confirmButtonColor: '#32c787',
        cancelButtonText: 'No, cancel',
        confirmButtonText: 'Yes, Proceed!',
        reverseButtons: true,
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading()
    })
}

function formatDate(date, format){
    if (!format) {
        format = 'lll'
    }

    const formatMap = {
        'lll': "MMM d, yyyy, h:mm a",
        'LLL': "MMMM d, yyyy, h:mm a",
        'll': "MMMM d, yyyy",
        'LL': "MMMM d, yyyy",
        'L': "MM/dd/yyyy",
        'l': "MM/dd/yyyy",
        'YYYY-MM-DD': 'yyyy-MM-dd',
        'YYYY/MM/DD': 'yyyy/MM/dd',
        'YYYY': 'yyyy',
        'MM': 'MM',
        'DD': 'dd',
        'HH:mm': 'HH:mm',
        'hh:mm A': 'hh:mm a',
        'MMM D, YYYY': 'MMM d, yyyy',
        'MMMM D, YYYY': 'MMMM d, yyyy',
        'MMM D, YYYY h:mm A': 'MMM d, yyyy h:mm a',
        'MMMM D, YYYY h:mm A': 'MMMM d, yyyy h:mm a',
        // Add more as needed
    }
    const luxonFormat = formatMap[format] || format
    // Accepts ISO string, JS Date, or Luxon DateTime
    let dt
    if (typeof date === 'string' || date instanceof String) {
        dt = DateTime.fromISO(date)
        if (!dt.isValid) dt = DateTime.fromRFC2822(date)
        if (!dt.isValid) dt = DateTime.fromFormat(date, 'yyyy-MM-dd')
    } else if (date instanceof Date) {
        dt = DateTime.fromJSDate(date)
    } else if (date && typeof date === 'object' && date.isValid !== undefined) {
        dt = date
    } else {
        return ''
    }
    return dt.isValid ? dt.toFormat(luxonFormat) : ''
}

function formatNumber(amount, decimalPoints = 0){
    return numberFormat(amount, decimalPoints)
}

function numberFormat(amount, decimalPoints = 0){
    let formatted = parseFloat(amount).toFixed(decimalPoints)
    formatted = new Intl.NumberFormat().format(formatted)
    const formattedArr = formatted.split('.')
    return decimalPoints === 0 ? formattedArr[0] : formattedArr[0] + '.' + (formattedArr[1] || '0').padEnd(decimalPoints, 0)
}

const showModal = modalId => {
    const modal = new Modal(document.getElementById(modalId))
    modal.show()
}

const hideModal = modalId => {
    const cleanedId = modalId.replace('#','')
    const modalElement = document.getElementById(cleanedId)
    if(modalElement){
        const button = modalElement.querySelector('.sh-modal-close')
        if(button){
            button.click()
        } else {
            const modal = new Modal(modalElement)
            modal.hide()
        }
    }
}

const showOffCanvas = offCanvasId => {
    const offCanvas = new Offcanvas(document.getElementById(offCanvasId))
    offCanvas.show()
}

const hideOffCanvas = offCanvasId => {
    const element = document.getElementById(offCanvasId)
    const button = element.querySelector('.sh-offcanvas-close')
    if(button){
        button.click()
    } else {
        const offCanvas = new Offcanvas(element)
        offCanvas.hide()
    }
}

const flushCache = () => {
    return shIndexedDB.clear()
}

export default {
    swalSuccess,
    swalError,
    runPlainRequest,
    confirmAction,
    getMenuCount,
    setTabCounts,
    getShConfig,
    showToast,
    runSilentRequest,
    swalHttpError,
    formatHttpCatchError,
    formatDate,
    numberFormat,
    formatNumber,
    signOutUser,
    showModal,
    hideModal,
    showOffCanvas,
    hideOffCanvas,
    flushCache
}
