<script setup>
import { computed, inject, onMounted, ref, useTemplateRef, watch } from 'vue'
import _ from 'lodash'
import shApis from '../repo/helpers/ShApis.js'
import shRepo from '../repo/helpers/ShRepo.js'
import PhoneInput from './form-components/PhoneInput.vue'
import EmailInput from './form-components/EmailInput.vue'
import NumberInput from './form-components/NumberInput.vue'
import TextInput from './form-components/TextInput.vue'
import TextAreaInput from './form-components/TextAreaInput.vue'
import SelectInput from './form-components/SelectInput.vue'
import PasswordInput from './form-components/PasswordInput.vue'
import ShSuggest from './form-components/ShSuggest.vue'
import DateInput from './form-components/DateInput.vue'
import CheckboxInput from './form-components/CheckboxInput.vue'
const props = defineProps({
  action: {
    type: String,
    required: false
  },
  successCallback: {
    type: Function,
    required: false
  },
  retainDataAfterSubmission: {
    type: Boolean,
    default: false
  },
  successMessage: {
    type: String,
    required: false
  },
  fields: {
    type: Array,
    required: true
  },
  customComponents: {
    type: Object,
    required: false
  },
  placeHolders: {
    type: Object,
    required: false
  },
  formClasses: {
    type: Object,
    required: false
  },
  helperTexts: {
    type: Object,
    required: false
  },
  labels: {
    type: Object,
    required: false
  },
  data: {
    type: Object,
    required: false
  },
  preSubmitCallback: {
    type: Function,
    required: false
  },
  fillSelects: {
    type: Object,
    required: false
  },
  formClass: {
    type: String,
    required: false
  },
  actionLabel: {
    type: String,
    default: 'Submit'
  },
  textAreas: {
    type: Array,
    required: false
  },
  currentData: {
    type: Object,
    required: false
  },
  emails: {
    type: Array,
    required: false
  },
  method: {
    type: String,
    default: 'post',
    validator: (value) => ['post', 'put', 'delete'].includes(value)
  },
  phones: {
    type: Array,
    required: false
  },
  numbers: {
    type: Array,
    required: false
  },
  selects: {
    type: Array,
    required: false
  },
  dates: {
    type: Array,
    required: false
  },
  gqlMutation: {
    type: String,
    required: false
  },
  required: {
    type: Array,
    required: false
  },
  retainModal: {
    type: Boolean,
    default: false
  },
  steps: {
    type: Array,
    required: false
  }
})
const emit = defineEmits(['success', 'preSubmit', 'fieldChanged', 'formSubmitted', 'formError'])

// Default field type configurations
const DEFAULT_FIELD_TYPES = {
  textareas: ['message', 'meta_description', 'comment', 'call_response', 'comments', 'description'],
  selects: ['gender', 'payment_method', 'allow_view_mode', 'reasons_name', 'has_free_tier', 'payment_period', 'role', 'register_as', 'account_type'],
  numbers: ['age'],
  dates: ['free_tier_days', 'recurring_date', 'date', 'paid_at'],
  passwords: ['password', 'password_confirmation', 'pin'],
  phones: ['phone'],
  emails: ['email']
}

const formFields = ref([])
const formComponents = inject('formComponents', {})

const getFieldComponent = (fieldObj) => {
  // Return custom component if specified
  if (fieldObj.component) {
    return fieldObj.component
  }

  const field = fieldObj.field ?? fieldObj.name

  // Check for custom components in props
  if (props.customComponents?.[field]) {
    return props.customComponents[field]
  }

  // Handle fillSelects configuration
  if (props.fillSelects?.[field]) {
    Object.assign(fieldObj, props.fillSelects[field])
    if (fieldObj.suggests || fieldObj.suggest) {
      fieldObj.type = 'suggests'
    } else {
      fieldObj.type = 'select'
    }
  }

  // Handle suggests type
  if (fieldObj.suggests || fieldObj.suggest) {
    fieldObj.type = 'suggests'
  }

  // Get component mappings
  const componentMap = {
    text: formComponents.text ?? TextInput,
    textarea: formComponents.textArea ?? TextAreaInput,
    email: formComponents.email ?? EmailInput,
    phone: formComponents.phone ?? PhoneInput,
    number: formComponents.number ?? NumberInput,
    select: formComponents.select ?? SelectInput,
    password: formComponents.password ?? PasswordInput,
    date: formComponents.date ?? DateInput,
    checkbox: formComponents.checkbox ?? CheckboxInput
  }

  // Return component based on explicit type
  if (fieldObj.type) {
    if (fieldObj.type === 'suggest' || fieldObj.type === 'suggests') {
      return ShSuggest
    }
    if (fieldObj.type === 'checkbox' || fieldObj.type === 'checkboxes') {
      return CheckboxInput
    }
    return componentMap[fieldObj.type] ?? componentMap.text
  }

  // Infer component from field name patterns
  if (DEFAULT_FIELD_TYPES.passwords.includes(field)) {
    return componentMap.password
  }
  if ((props.textAreas?.includes(field)) || DEFAULT_FIELD_TYPES.textareas.includes(field)) {
    return componentMap.textarea
  }
  if ((props.emails?.includes(field)) || DEFAULT_FIELD_TYPES.emails.includes(field)) {
    return componentMap.email
  }
  if ((props.phones?.includes(field)) || DEFAULT_FIELD_TYPES.phones.includes(field)) {
    return componentMap.phone
  }
  if ((props.numbers?.includes(field)) || DEFAULT_FIELD_TYPES.numbers.includes(field)) {
    return componentMap.number
  }
  if ((props.dates?.includes(field)) || DEFAULT_FIELD_TYPES.dates.includes(field)) {
    return componentMap.date
  }

  return componentMap.text
}
const shFormElementClasses = inject('shFormElementClasses', {})
const shAutoForm = useTemplateRef('shAutoForm')
const loading = ref(false)
const submitBtn = ref(false)
const validationErrors = ref({})
const formError = ref(null)
const submitBtnWidth = ref(null)
const isDirty = ref(false)
const isSynchronizing = ref(false)

// Helper functions
const closeModal = () => {
  setTimeout(() => {
    if (!shAutoForm.value) {
      // Form not available, most probably after redirection
      return
    }
    const modal = shAutoForm.value.closest('.modal-dialog')
    if (modal) {
      const closeBtn = modal.querySelector('[data-bs-dismiss="modal"]')
      closeBtn?.click()
    }
  }, 1500)
}

const getLabel = field =>
  props.labels?.[field] !== undefined
    ? props.labels[field]
    : _.startCase(_.camelCase(field))

const getElementClass = section =>
  props.formClasses?.[section] ??
  shFormElementClasses[section] ??
  _.snakeCase(section).replace(/_/gi, '-')

const getComponentClass = field => {
  const baseClass = getElementClass('formControl')
  return validationErrors.value[field] ? `${baseClass} is-invalid` : baseClass
}

const getHelperText = field => props.helperTexts?.[field] || false

const getPlaceholder = field => props.placeHolders?.[field] || ''

const getFormData = () => {
  const data = {}
  formFields.value.forEach(field => {
    data[field.field] = field.value
  })
  return data
}

const fieldChanged = (field, value) => {
  if (isSynchronizing.value) return
  isDirty.value = true
  delete validationErrors.value[field]
  
  // Find the field and update its value if it was passed
  const fieldObj = formFields.value.find(f => f.field === field)
  if (fieldObj && value !== undefined) {
    fieldObj.value = value
  }
  
  const data = getFormData()
  const fieldValue = fieldObj?.value
  setTimeout(() => {
    emit('fieldChanged', field, fieldValue, data)
  }, 300)
}

const getComponentProps = (field) => {
  const { component, value, ...props } = field
  // remove required
  delete props.required
  return props
}
const isFloating = getElementClass('formGroup').includes('form-floating')

const submitForm = async (e) => {
  e.preventDefault()

  if (submitBtn.value) {
    submitBtnWidth.value = `${submitBtn.value.getBoundingClientRect().width}px`
  }

  validationErrors.value = {}
  loading.value = true

  const data = getFormData()

  // Pre-submit callback
  if (props.preSubmitCallback) {
    const callbackRes = await props.preSubmitCallback(data)
    if (callbackRes !== true) {
      loading.value = false
      return false
    }
  }

  emit('preSubmit', data)

  // Handle GraphQL mutation
  if (props.gqlMutation) {
    const selectFields = Object.keys(data)
    let args = selectFields
      .filter(key => data[key])
      .map(key => `${key}: "${data[key]}"`)
      .join(', ')

    if (args) {
      args = `(${args})`
    }

    const mutation = `{\n${props.gqlMutation}${args} {\n${selectFields.join('\n')}\n}\n}`
    shApis.graphQlMutate(mutation)
      .then(handleSuccessRequest)
      .catch(handleFailedRequest)
  } else {
    // Handle REST API
    const method = props.method === 'put'
      ? shApis.doPut
      : props.method === 'delete'
        ? shApis.doDelete
        : shApis.doPost

    method(props.action, data)
      .then(handleSuccessRequest)
      .catch(handleFailedRequest)
  }

  return false
}

const handleSuccessRequest = res => {
  loading.value = false
  emit('formSubmitted', res.data)
  emit('success', res.data)

  if (props.successMessage) {
    shRepo.showToast(props.successMessage)
  }

  if (props.successCallback) {
    props.successCallback(res.data)
  }

  if (!props.retainDataAfterSubmission) {
    formFields.value.forEach(field => field.value = null)
  }
  isDirty.value = false

  if (!props.retainModal) {
    closeModal()
  }
}

const handleFailedRequest = reason => {
  loading.value = false
  const httpStatus = reason.response?.status || 0

  formError.value = httpStatus === 422 ? null : reason.message ?? null

  // Handle validation errors
  if (httpStatus === 422 && typeof reason.response?.data?.errors === 'object') {
    const httpErrors = reason.response.data.errors
    Object.keys(httpErrors).forEach(key => {
      validationErrors.value[key] = typeof httpErrors[key] === 'string'
        ? httpErrors[key]
        : httpErrors[key][0]
    })

    // Navigate to the step containing the first error
    if (formSteps.value.length > 1) {
      const errorFields = Object.keys(httpErrors)

      // Find the first step that contains any error field
      for (let i = 0; i < formSteps.value.length; i++) {
        const stepFieldNames = formSteps.value[i].fields.map(f => f.field)
        const hasError = errorFields.some(errorField => stepFieldNames.includes(errorField))

        if (hasError) {
          currentStep.value = i
          break
        }
      }
    }
  }

  if (httpStatus !== 422 && formError.value) {
    shRepo.showToast(formError.value, 'error')
  }

  emit('formError', reason)
}
const setExistingData = (existingData) => {
  // Don't sync if no data provided
  if (!existingData) return
  
  // Don't sync if user has made changes to the form
  if (isDirty.value) return
  
  isSynchronizing.value = true
  const keys = Object.keys(existingData)

  keys.forEach(k => {
    const field = formFields.value.find(f => f.field === k)
    if (field) {
      field.value = existingData[k]
    }
  })
  
  setTimeout(() => {
    isSynchronizing.value = false
  }, 100)
}

watch(() => props.currentData, (newData, oldData) => {
  // Only sync if form is pristine (not dirty) OR if this is a completely new object reference
  // This prevents reactive updates to currentData from overwriting user input
  if (!isDirty.value || !oldData) {
    setExistingData(newData)
  }
}, { deep: true })

const currentStep = ref(0)
const formSteps = ref([])
const isLastStep = computed(() => currentStep.value === formSteps.value.length - 1)
const currentStepObject = computed(() => formSteps.value[currentStep.value] || {})

onMounted(() => {
  // Initialize form fields
  props.fields?.forEach(field => {
    let fieldObj

    if (typeof field === 'object') {
      fieldObj = { ...field }
      fieldObj.field = fieldObj.field ?? fieldObj.name
      fieldObj.helper = fieldObj.helperText ?? getHelperText(fieldObj.field)
      fieldObj.label = fieldObj.label ?? getLabel(fieldObj.field ?? fieldObj.name)
      fieldObj.placeholder = fieldObj.placeholder ?? fieldObj.placeHolder ?? getPlaceholder(fieldObj.field)
      fieldObj.value = null
    } else {
      fieldObj = {
        field: field,
        label: getLabel(field),
        helper: getHelperText(field),
        placeholder: getPlaceholder(field),
        value: null
      }

      // Apply fillSelects configuration
      if (props.fillSelects?.[fieldObj.field]) {
        Object.assign(fieldObj, props.fillSelects[fieldObj.field])
      }
    }

    // Mark as required if in required array
    if (props.required?.includes(fieldObj.field)) {
      fieldObj.required = true
    }

    formFields.value.push(fieldObj)
  })

  // Add hidden ID field
  formFields.value.push({
    field: 'id',
    type: 'hidden'
  })

  isSynchronizing.value = true
  setExistingData(props.currentData)
  setTimeout(() => {
    isSynchronizing.value = false
  }, 200)

  // Initialize steps
  if (!props.steps || props.steps.length === 0) {
    // Single step form - all fields in one step
    formSteps.value = [{
      name: 'Form',
      label: 'Form',
      fields: formFields.value
    }]
  } else {
    // Multi-step form - map fields to steps
    formSteps.value = props.steps.map(step => {
      const stepFields = step.fields.map(fieldName => {
        return formFields.value.find(f => f.field === fieldName)
      }).filter(f => f !== undefined)

      return {
        ...step,
        fields: stepFields
      }
    })
  }
})
</script>
<template>
  <form :class="formClass" ref="shAutoForm" class="sh-auto-form" @submit="e => submitForm(e)">
    <!-- Step Indicator -->
    <div v-if="formSteps.length > 1" class="sh-form-steps-container">
      <div class="sh-form-steps-wrapper">
        <div
          v-for="(step, index) in formSteps"
          :key="`step-${index}`"
          :class="[
            'sh-form-step',
            getElementClass('formStep'),
            {
              'active': index === currentStep,
              'completed': index < currentStep,
              'upcoming': index > currentStep
            }
          ]"
        >
          <div class="sh-step-connector" v-if="index > 0"></div>
          <div class="sh-step-indicator">
            <div class="sh-step-number">
              <span v-if="index < currentStep" class="sh-step-check">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="sh-step-content">
              <div class="sh-step-title" v-html="step.title || step.label || step.name"></div>
              <div v-if="step.description" class="sh-step-description" v-html="step.description"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="sh-current-step-info d-none">
        <span class="sh-step-counter">Step {{ currentStep + 1 }} of {{ formSteps.length }}</span>
        <span class="sh-step-name">{{ currentStepObject.title || currentStepObject.label || currentStepObject.name }}</span>
      </div>
    </div>

    <!-- Form Fields -->
    <template v-for="(stepData, stepIndex) in formSteps" :key="`step-${stepIndex}`">
      <div v-show="currentStep === stepIndex" class="sh-step-fields">
        <div v-for="(field, fieldIndex) in stepData.fields" :key="`field-${field.field}-${fieldIndex}`" :class="getElementClass('formGroup') + ' sh-field-' + field.field">
          <template v-if="field.type === 'hidden'">
            <input type="hidden" :name="field.field" v-model="field.value">
          </template>
          <template v-else>
            <label v-if="!isFloating && field.label" :class="getElementClass('formLabel')">
              <span v-html="field.label" class="sh-label"></span>
              <span v-if="field.required" class="text-danger sh-required">*</span>
            </label>
            <component v-bind="getComponentProps(field)" :isInvalid="typeof validationErrors[field.field] !== 'undefined'"
                       @update:modelValue="val => fieldChanged(field.field, val)"
                       v-model="field.value" :class="getComponentClass(field.field)"
                       :is="getFieldComponent(field)"/>
            <label v-if="isFloating && field.label" :class="getElementClass('formLabel')" v-html="field.label"></label>
            <div class="form-notch" v-if="isFloating">
              <div class="form-notch-leading"></div>
              <div class="form-notch-middle"></div>
              <div class="form-notch-trailing"></div>
            </div>
            <div v-if="field.helper" :class="getElementClass('helperText')" v-html="field.helper"></div>
            <div v-if="validationErrors[field.field]" :class="getElementClass('invalidFeedback')">
              {{ validationErrors[field.field] }}
            </div>
          </template>
        </div>
      </div>
    </template>
    <slot/>

    <!-- Navigation Buttons -->
    <div class="sh-form-navigation" :class="formSteps.length > 1 ? 'd-flex':''">
      <div v-if="currentStep > 0" :class="getElementClass('formGroup')">
        <button
          type="button"
          :class="[getElementClass('actionBtn'), 'sh-btn-previous']"
          @click="currentStep -= 1"
          :disabled="loading"
        >
          <span class="sh-btn-icon">←</span>
          <span>{{ currentStepObject.labels?.previous || 'Previous' }}</span>
        </button>
      </div>
      <div v-if="!isLastStep" :class="getElementClass('formGroup') + ' ms-auto'">
        <button
          type="button"
          :class="[getElementClass('actionBtn'), 'sh-btn-next']"
          @click="currentStep += 1"
          :disabled="loading"
        >
          <span>{{ currentStepObject.labels?.next || 'Next' }}</span>
          <span class="sh-btn-icon">→</span>
        </button>
      </div>
      <div v-if="isLastStep" :class="getElementClass('formGroup') + ' ms-auto'">
        <button
          :style="{width: submitBtnWidth}"
          ref="submitBtn"
          :disabled="loading"
          :class="[getElementClass('actionBtn'), 'sh-btn-submit']"
        >
          <template v-if="loading">
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span class="ms-2 d-none">Processing...</span>
          </template>
          <span v-if="!loading">{{ actionLabel }}</span>
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
/* Step Container */
.sh-form-steps-container {
  margin-bottom: 2.5rem;
  padding: 0;
}

/* Steps Wrapper */
.sh-form-steps-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  margin-bottom: 1.5rem;
}

/* Individual Step */
.sh-form-step {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Step Connector Line */
.sh-step-connector {
  position: absolute;
  top: 18px;
  right: 50%;
  width: 100%;
  height: 2px;
  background: #e5e7eb;
  z-index: 0;
  transition: background 0.3s ease;
}

.sh-form-step.completed .sh-step-connector {
  background: #10b981;
}

.sh-form-step.active .sh-step-connector {
  background: linear-gradient(to right, #10b981 50%, #e5e7eb 50%);
}

/* Step Indicator */
.sh-step-indicator {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Step Number Circle */
.sh-step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  background-color: white;
  border: 2px solid #d1d5db;
  color: #9ca3af;
  transition: all 0.25s ease;
}

.sh-form-step.active .sh-step-number {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: scale(1.05);
}

.sh-form-step.completed .sh-step-number {
  background: #10b981 !important;
  border-color: #10b981;
  color: white;
}

.sh-step-check {
  font-size: 18px;
  font-weight: bold;
}

/* Step Content */
.sh-step-content {
  max-width: 120px;
}

.sh-step-title {
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
  transition: color 0.25s ease;
}

.sh-form-step.active .sh-step-title {
  color: #3b82f6;
  font-weight: 600;
}

.sh-form-step.completed .sh-step-title {
  color: #10b981;
}

.sh-step-description {
  font-size: 11px;
  color: #d1d5db;
  margin-top: 0.25rem;
  line-height: 1.3;
}

/* Current Step Info */
.sh-current-step-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.sh-step-counter {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sh-step-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* Step Fields Container */
.sh-step-fields {
  animation: fadeInSlide 0.25s ease;
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Navigation Buttons */
.sh-form-navigation {
  gap: 0.75rem;
  margin-top: 2rem;
}

.sh-btn-icon {
  display: inline-block;
  transition: transform 0.2s ease;
}

.sh-btn-previous:hover .sh-btn-icon {
  transform: translateX(-2px);
}

.sh-btn-next:hover .sh-btn-icon {
  transform: translateX(2px);
}

.sh-btn-next,
.sh-btn-submit {
  min-width: 120px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sh-form-steps-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .sh-step-connector {
    display: none;
  }

  .sh-form-step {
    flex-direction: row;
    justify-content: flex-start;
    text-align: left;
  }

  .sh-step-indicator {
    flex-direction: row;
    gap: 0.75rem;
  }

  .sh-step-content {
    max-width: none;
  }

  .sh-current-step-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .sh-step-connector {
    background-color: #374151;
  }

  .sh-form-step.completed .sh-step-connector {
    background: #10b981;
  }

  .sh-form-step.active .sh-step-connector {
    background: linear-gradient(to right, #10b981 50%, #374151 50%);
  }

  .sh-current-step-info {
    border-bottom-color: #374151;
  }

  .sh-step-number {
    border-color: #4b5563;
    color: #6b7280;
  }

  .sh-form-step.active .sh-step-number {
    border-color: #60a5fa;
    color: #60a5fa;
  }

  .sh-step-title {
    color: #6b7280;
  }

  .sh-form-step.active .sh-step-title {
    color: #60a5fa;
  }

  .sh-step-description {
    color: #4b5563;
  }

  .sh-step-counter {
    color: #9ca3af;
  }

  .sh-step-name {
    color: #d1d5db;
  }
}
</style>

