<script setup>
import { computed } from 'vue'

const model = defineModel()
const props = defineProps(['label', 'options', 'data'])

const checkboxOptions = computed(() => {
  const options = props.data ?? props.options
  if (!options) return []
  return options.map(item => {
    return {
      id: typeof item.id !== 'undefined' ? item.id : item.key ? item.key : item.value ? item.value : item.name ? item.name : item.label,
      label: item.label ? item.label : item.name ? item.name : item.value ? item.value : item.id ? item.id : item.option
    }
  })
})

const toggleValue = (id) => {
  if (!Array.isArray(model.value)) {
    model.value = []
  }
  const index = model.value.indexOf(id)
  if (index > -1) {
    model.value.splice(index, 1)
  } else {
    model.value.push(id)
  }
}

const isChecked = (id) => {
  if (!Array.isArray(model.value)) return false
  return model.value.includes(id)
}
</script>

<template>
  <div class="sh-checkbox-group">
    <div v-for="option in checkboxOptions" :key="option.id" class="form-check me-2">
      <input
        class="form-check-input"
        type="checkbox"
        :id="'checkbox_' + option.id"
        :checked="isChecked(option.id)"
        @change="toggleValue(option.id)"
      >
      <label class="form-check-label" :for="'checkbox_' + option.id">
        {{ option.label }}
      </label>
    </div>
  </div>
</template>

<style scoped>
.sh-checkbox-group {
  display: flex;
  flex-wrap: wrap;
}
</style>
