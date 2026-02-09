<script setup>
const model = defineModel()
const props = defineProps(['label','isInvalid'])
const emit = defineEmits(['clearValidationErrors'])

const onInput = () => {
  emit('clearValidationErrors')
}
</script>

<template>
  <input type="text" v-model="model" @input="onInput">
</template>