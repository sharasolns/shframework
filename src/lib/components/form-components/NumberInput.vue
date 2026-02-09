<script setup>
import { computed } from 'vue'

const model = defineModel()
const props = defineProps(['label','min','max'])
const emit = defineEmits(['clearValidationErrors'])

const onInput = () => {
  emit('clearValidationErrors')
}
</script>

<template>
  <input :min="min" :max="max" type="number" v-model="model" @input="onInput">
</template>