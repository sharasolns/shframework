<script setup>
import { computed, onMounted, ref } from 'vue'
import shApis from '../../repo/helpers/ShApis.js'

const model = defineModel()
const props = defineProps(['label','url','required','options','dataUrl','data'])
const emit = defineEmits(['clearValidationErrors'])

const onInput = () => {
  emit('clearValidationErrors')
}

const selectOptions = ref(null)

onMounted(()=>{
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
</script>

<template>
  <select v-model="inputModel">
    <template v-for="option in selectOptions" :key="option.id">
      <option :value="option.id">{{ option.name }}</option>
    </template>
  </select>
</template>
