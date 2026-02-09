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
  <textarea v-model="model" @input="onInput"></textarea>
</template>