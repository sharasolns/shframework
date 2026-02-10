<script setup>
import { computed, onMounted, ref } from 'vue'
import ShModal from './ShModal.vue'
import ShAutoForm from './ShAutoForm.vue'
const props = defineProps(['action',
  'classes',
  'method',
  'hasTerms',
  'country_code',
  'submitBtnClass',
  'fields',
  'modalSize',
  'columns', 'placeholders', 'field_permissions', 'retainDataAfterSubmission',
  'currentData', 'actionLabel', 'fillSelects', 'phones', 'successCallback',
  'failedCallback', 'labels', 'editors',
  'datePickers',
  'required',
  'textAreas',
  'files',
  'phones',
  'numbers',
  'hideButton',
  'customComponent','modalTitle','class','successMessage', 'modalId'])
const emit = defineEmits(['success','fieldChanged','formSubmitted','formError','modalId'])
const formProps = ref(props)
let btnClass=props.class
const realModalId = props.modalId ?? 'rand' + (Math.random() + 1).toString(36).substring(2)
const success = (res)=>{
  emit('success',res)
}
onMounted(()=>{
  emit('modalId',realModalId)
})

const fieldChanged = (field, value)=>{
  emit('fieldChanged',field, value)
}

const formSubmitted = (res)=>{
  emit('formSubmitted',res)
}

const formError = (res)=>{
  emit('formError',res)
}



const allProps = ref({})

// make cleaned props computed

const cleanedProp = computed(()=>{
  const p = {...props}
  delete p.class
  delete p.modalId
  delete p.hideButton
  return p
})
</script>
<template>
  <a v-show="!hideButton" :class="btnClass" :href="'#' + realModalId" data-bs-toggle="modal">
    <slot></slot>
    <teleport to="body">
      <sh-modal :modal-size="modalSize" :modal-id="realModalId" :modal-title="modalTitle">
        <sh-auto-form v-if="allProps"
                      @success="success"
                      @field-changed="fieldChanged"
                      @form-submitted="formSubmitted"
                      @form-error="formError"
                      :key="JSON.stringify(currentData ?? {})"
                      v-bind="cleanedProp"/>
      </sh-modal>
    </teleport>
  </a>
</template>
