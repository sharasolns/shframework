<script setup>
import { onMounted, ref, watch } from 'vue'
import shApis from '../../repo/helpers/ShApis.js'

const props = defineProps(['modelValue','label','url','required','options','dataUrl','data'])
const emit = defineEmits(['update:modelValue','clearValidationErrors'])
const inputModel = ref(null)
const selectOptions = ref(null)
const modelValueUpdated = (e) => {
  emit('clearValidationErrors')
  emit('update:modelValue',inputModel.value)
}
onMounted(()=>{
  props.modelValue && (inputModel.value = props.modelValue)
  const options = props.data ?? props.options
  if(options){
    selectOptions.value = options.map(item=>{
      return {
        id: typeof item.id !== 'undefined' ? item.id : item.key ? item.key : item.value ? item.value:item.name ? item.name:item.label,
        name: item.label ? item.label : item.name ? item.name : item.value ? item.value:item.id ? item.id:item.option
      }
    })
  } else if (props.dataUrl || props.url) {
    shApis.doGet(props.dataUrl ??  props.url,{all:1}).then(res=>{
      selectOptions.value = res.data.map(item=>{
        return {
          id: item.id ? item.id : item.key ? item.key : item.value ? item.value:item.name ? item.name:item.label,
          name: item.label ? item.label : item.name ? item.name : item.value ? item.value:item.id ? item.id:item.option
        }
      })
    }).catch(ex=>{
      console.log(ex)
    })
  }
})
watch(()=>props.modelValue, (newValue)=>{
  if(newValue) {
    inputModel.value = newValue
  }
})
</script>

<template>
  <select v-model="inputModel" @change="modelValueUpdated" @keydown="modelValueUpdated" @updated="modelValueUpdated">
    <template v-for="option in selectOptions" :key="option.id">
      <option :value="option.id">{{ option.name }}</option>
    </template>
  </select>
</template>
