<script setup>
import { computed } from 'vue'

const model = defineModel()
const props = defineProps(['label'])
const emit = defineEmits(['clearValidationErrors'])

const onInput = () => {
  emit('clearValidationErrors')
}
</script>

<template>
  <input type="email" v-model="model" @input="onInput">
</template>