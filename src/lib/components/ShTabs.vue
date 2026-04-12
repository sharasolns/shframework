<script setup>
import { onMounted, ref, watch } from 'vue'
import apis from '../repo/helpers/ShApis.js'
import { useRoute, useRouter } from 'vue-router'
import shRepo from '../repo/helpers/ShRepo.js'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../repo/stores/ShUser'

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  baseUrl: {
    type: String,
    required: true
  },
  sharedData: {
    type: Object
  },
  activeTab: {
    type: String
  },
  tabCounts: {
    type: Object
  },
  responsive: {
    type: Object
  },
  classes: {
    type: String
  },
  classOne: {
    type: String
  },
  classTwo: {
    type: String
  }
})
const route = useRoute()
const router = useRouter()
const currentTab = ref('')
const path = ref(route.path)
const allowedTabs = ref([])
const {user} = storeToRefs(useUserStore())
const realTabCounts = ref({})
onMounted(()=>{
  if(props.tabs.length === 0){
    return;
  }
  allowedTabs.value = props.tabs.filter(tab=>{
    if(typeof tab === 'object'){
      if(tab.count || tab.counts){
        realTabCounts.value[tab.name || tab.key] = tab.count || tab.counts
      }
      if(tab.validator){
        if(tab.validator()){
          return tab
        }
        return false
      } else if(tab.permission){
        if(user.value && user.value.isAllowedTo(tab.permission)){
          return tab
        }
        return false
      }
    }
    return tab
  })
  if(allowedTabs.value.length > 0){
    resetTabCounts()
    setTab(allowedTabs.value[0])
  }
})

watch(()=>props, () => {
  console.log('changed')
  resetTabCounts()
},{
  deep: true}
)

watch(()=>route.path,()=>{
  const arr = route.fullPath.split('/')
  if (!tabExistsInUrl()) {
    resetTabCounts()
  }

})

watch(()=>route.path,(newPath)=>{
  path.value = newPath
})

const setTab = (tab) => {

  if (tab) {
    const label = getTabLabel(tab)
    currentTab.value = label.replace(/_/g, ' ')
  }
}
const setTabCounts = (tabCounts) => {

}
const resetTabCounts = () => {
  const arr = route.fullPath.split('/')
  if (!tabExistsInUrl()) {
    router.replace(route.fullPath + '/tab/' + getTabKey(allowedTabs.value[0]))
  } else {
    setTab(arr[arr.length - 1])
  }
  let tbCounts = props.tabCounts
  // merge with realTabCounts
  if (tbCounts && typeof tbCounts === 'object') {
    realTabCounts.value = {...realTabCounts.value, ...tbCounts}
  } else if(typeof tbCounts === 'string') {
    // it is a string fetch from api
    apis.doGet(tbCounts).then(res => {
      realTabCounts.value = {...realTabCounts.value, ...res.data}
    })
  }

}
const tabExistsInUrl = () => {
  let exists = false
  props.tabs.forEach(tab => {
    const tabKey = getTabKey(tab)
    if (route.fullPath.includes(`/${tabKey}`)) {
      exists = true
    }
  })
  return exists
}

const getTabKey = (tab)=>{
  if(typeof tab === 'string') {
    return tab
  }
  return tab.name || tab.key
}

const getTabLabel = tab=>{
  let label = ''
  if (typeof tab === 'string') {
    label = tab
  } else {
    label = tab.label || tab.name || tab.key
  }
  return label.replace(/_/g, ' ')
}
</script>
<template>
  <template v-if="allowedTabs.length > 0">
    <ul class="nav nav-tabs sh-tabs" :class="classes ?? shRepo.getShConfig('tabsClass','sh-tabs nav-tabs-bordered')">
      <li class="nav-item" v-for="tab in allowedTabs" :key="getTabKey(tab)">
        <router-link @click="setTab(tab)" :active-class="'active'" class="nav-link text-capitalize"
                     :to="baseUrl+'/tab/'+getTabKey(tab)" role="tab" :class="'sh_tab_' + getTabKey(tab)">
          {{ getTabLabel(tab) }}
          <sup class="sh_tab_count" v-if="realTabCounts[getTabKey(tab)] !== undefined && realTabCounts[getTabKey(tab)] > 0">
            {{ realTabCounts[getTabKey(tab)] }}
          </sup>
        </router-link>
      </li>
    </ul>
    <div class="tab-content" :class="classTwo">
      <router-view v-bind="$attrs" :currentTab="currentTab" :key="path" :sharedData="sharedData" :tabCounts="tabCounts"></router-view>
    </div>
  </template>
  <div v-else class="alert alert-warning">
    <div v-if="tabs.length">
      403 Not Allowed
    </div>
    <div v-else>
      No tabs found
    </div>
  </div>
</template>

<style scoped>

</style>
