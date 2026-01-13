<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps(['modelValue','label','isInvalid'])
const emit = defineEmits(['update:modelValue','clearValidationErrors'])
const inputModel = ref(null)

const modelValueUpdated = (e) => {
  emit('clearValidationErrors')
  emit('update:modelValue',inputModel.value)
}
onMounted(()=>{
  props.modelValue && (inputModel.value = props.modelValue)
})

watch(()=>props.modelValue, (newValue)=>{
  if(newValue) {
    inputModel.value = newValue
  }
})

</script>

<template>
  <input type="text" v-model="inputModel" @change="modelValueUpdated" @keydown="modelValueUpdated" @updated="modelValueUpdated">
</template>