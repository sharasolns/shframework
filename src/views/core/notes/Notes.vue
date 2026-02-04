<script setup>
import ShTable from "@/lib/components/ShTable.vue";
import FormatTitle from '@/views/core/notes/FormatTitle.vue'
import { ref } from 'vue'
import shApis from '@/lib/repo/helpers/ShApis'
import shRepo from '@/lib/repo/helpers/ShRepo'
import { ShConfirmAction } from '@'

const selected = ref([])
const rowSelected = row=> {
  // selected.value.push(row)
}

const edit = item=>{
  alert('Edit')
}

const deleteItem = item=>{
  shRepo.runPlainRequest('notes/delete', item).then(res=>{
    res.isConfirmed && res.value.success && shRepo.showToast('Note deleted')
    res.isConfirmed && !res.value.success && shRepo.showToast(res.message, 'error')
  }).catch(err=>{
    shRepo.showToast(err.message, 'error')
  })
}

const viewItem = item=>{
  alert('View')
}

const formatTitle = row=>{
  return `<h3>${row.title}</h3>`
}

const status = ref('active')
const allowSummary = row=>{
  return status.value === 'active'
}
</script>
<template>
    <div class="max-2">
      <h5 v-if="false">false</h5>
      <button v-if="true" @click="deleteItem({id:1})">Delete Plain</button>
      <sh-confirm-action :url="'notes/note/delete/1'" :data="{id:1}" @success="res=>{console.log(res)}">Delete SH</sh-confirm-action>
        <h5 v-if-user-can="'notes'">Notes</h5>
        <div class="card shadow rounded">
            <div class="card-body">
              <sh-table :end-point="`notes/list`" no-records-message="No notes">
                <template v-slot:records="slotProps">
                  <h3>{{ records }}</h3>
                </template>
              </sh-table>
              {{ selected}}
                <sh-table  :has-range="false" :end-point="`notes/list`" :headers="['id','user.name',{
                  label:'Summary',
                  key:'title',
                  callback:formatTitle,
                  validator:allowSummary,
                  sortable:true
                },'title','note','created_at']"
                          :onViewItem="viewItem"
                :actions="{
                  label: '&nbsp;',
                  type: 'dropdown',
                  icon: 'bi-person',
                  actions:[
                      {
                          label: 'Edit',
                          icon: 'edit',
                          emits: edit
                      },
                      {
                          label: 'Delete',
                          icon: 'delete',
                          class: 'text-danger btn',
                          emits: deleteItem
                      },
                      {
                          label: 'View',
                          icon: 'view',
                          class: 'text-primary btn',
                          emits: 'viewItem'
                      }
                  ]
                }"
                >
            <template #note="{ row }">
              <p v-html="row.note"></p>
            </template>
              </sh-table>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>
