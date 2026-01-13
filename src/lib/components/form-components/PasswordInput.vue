<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps(['modelValue','label'])
const emit = defineEmits(['update:modelValue','clearValidationErrors'])
const inputModel = ref(null)

const modelValueUpdated = (e) => {
  emit('clearValidationErrors')
  emit('update:modelValue',inputModel.value)
}
onMounted(()=>{
  props.modelValue && (inputModel.value = props.modelValue)
})

</script>

<template>
  <input type="password" v-model="inputModel" @change="modelValueUpdated" @keydown="modelValueUpdated" @updated="modelValueUpdated">
</template>