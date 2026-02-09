<script setup>
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";

import admin from '@/app/menus/admin.js'
import { useUserStore } from '@/lib/repo/stores/ShUser.js'
import shRepo from '@/lib/repo/helpers/ShRepo.js'
import shApis from '@/lib/repo/helpers/ShApis.js'
import ShTable from '@/lib/components/ShTable.vue'

let menus = ref([])

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const router = useRouter()

function setMenus() {
  menus.value = admin
}

function toggleSidebar() {
  const width = document.documentElement.clientWidth;
  if (width < 1200) {
    const elements = document.getElementsByTagName('body')
    elements[0].classList.toggle('toggle-sidebar')
  }

}

function logoutUser() {
  userStore.logOut()
  shRepo.showToast('logout successful')
  router.push('/auth/login')
}
function flushCache() {
  shRepo.confirmAction('Flush Cache', 'Are you sure you want to clear all cached data?').then(res => {
    if(res.isConfirmed){
      shRepo.flushCache().then(() => {
        shRepo.showToast('Cache cleared successfully')
        window.location.reload()
      })
    }
  })
}
const unreadCount = ref('-')
const getUnreadCount = () => {
  shApis.doGet('messages/count-unread').then(res => {
    unreadCount.value = res.data.unreadCount
  }).catch(ex=>{
    shRepo.showToast(ex.message, 'error')
  })
}
onMounted(() => {
  setMenus()
  user.role == 'member' && getUnreadCount()
})

</script>

<template>
  <!--<h1>App Layout</h1>-->

  <!-- ======= Header ======= -->
  <header id="header" class="header fixed-top d-flex align-items-center" v-if="user">

    <div class="d-flex align-items-center justify-content-between">
      <router-link to="/" class="logo d-flex align-items-center">
        <img src="/favicon.png" alt="">
        <span class="d-none d-lg-block">ShFramework</span>
      </router-link>
      <i class="bi bi-list toggle-sidebar-btn" @click="toggleSidebar"></i>
    </div>

    <nav class="header-nav ms-auto">
      <ul class="d-flex align-items-center">

        <li class="nav-item d-block d-lg-none">
          <a class="nav-link nav-icon search-bar-toggle " href="#">
            <i class="bi bi-search"></i>
          </a>
        </li><!-- End Search Icon-->

        <li class="nav-item dropdown d-none">

          <a class="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
            <i class="bi bi-bell"></i>
            <span class="badge bg-primary badge-number">4</span>
          </a><!-- End Notification Icon -->

          <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications">
            <li class="dropdown-header">
              You have 4 new notifications
              <a href="#"><span class="badge rounded-pill bg-primary p-2 ms-2">View all</span></a>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>

            <li class="notification-item">
              <i class="bi bi-exclamation-circle text-warning"></i>
              <div>
                <h3>Lorem Ipsum</h3>
                <p>Quae dolorem earum veritatis oditseno</p>
                <p>30 min. ago</p>
              </div>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li class="dropdown-footer">
              <a href="#">Show all notifications</a>
            </li>

          </ul><!-- End Notification Dropdown Items -->

        </li><!-- End Notification Nav -->
        <template v-if="user.role == 'member'">
          <li class="nav-item dropdown">

            <a @click="getUnreadCount" class="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
              <i class="bi bi-chat-left-text"></i>
              <span class="badge bg-success badge-number">{{ unreadCount }}</span>
            </a><!-- End Messages Icon -->
            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow messages" style="max-height: 300px; overflow-y: auto">

              <sh-table :key="unreadCount" hide-load-more="1" hide-count="1" pagination-style="loadMore" :headers="['id']" end-point="messages/list-unread">
                <template v-slot:records="slotProps">
                  <li class="dropdown-header">
                    You have {{ unreadCount }} new messages
                  </li>
                  <li>
                    <hr class="dropdown-divider">
                  </li>

                  <li class="message-item" v-for="message in slotProps.records">
                    <router-link :to="`/threads/thread/${message.phone}`">
                      <div>
                        <h5>{{  message.phone  }}</h5>
                        <p>{{ message.message }}</p>
                        <p>{{ shRepo.formatDate(message.created_at)  }}</p>
                      </div>
                    </router-link>
                  </li>
                  <li>
                    <hr class="dropdown-divider">
                  </li>

                  <li class="dropdown-footer">
                    <router-link to="/messages/inbox">Show all messages</router-link>
                  </li>
                </template>
              </sh-table>
            </ul><!-- End Messages Dropdown Items -->
          </li><!-- End Messages Nav -->
        </template>


        <li class="nav-item dropdown pe-3">

          <a class="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
            <span class=" bi-person"></span>
            <span class="d-none d-md-block dropdown-toggle ps-2">{{ user.name }}</span>
          </a><!-- End Profile Iamge Icon -->

          <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
            <li class="dropdown-header">
              <h6>{{ user.name }}</h6>
              <span>{{  user.role }}</span>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>

            <li>
              <router-link to="/sh-user-profile" class="dropdown-item d-flex align-items-center">
                <i class="bi bi-person"></i>
                <span>My Profile</span>
              </router-link>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <a @click="flushCache" class="dropdown-item d-flex align-items-center" href="#">
                <i class="bi bi-trash"></i>
                <span>Flush Cache</span>
              </a>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <a @click="logoutUser" class="dropdown-item d-flex align-items-center" href="#">
                <i class="bi bi-box-arrow-right"></i>
                <span>Sign Out</span>
              </a>
            </li>

          </ul><!-- End Profile Dropdown Items -->
        </li><!-- End Profile Nav -->

      </ul>
    </nav><!-- End Icons Navigation -->

  </header><!-- End Header -->

  <!-- ======= Sidebar ======= -->
  <aside id="sidebar" class="sidebar">

    <ul class="sidebar-nav" id="sidebar-nav">
      <template v-for="menu in menus" :key="menu.slug">
        <li @click="toggleSidebar" class="nav-item" v-if="user.isAllowedTo(menu.slug) && menu.type === 'single'">
          <router-link class="nav-link collapsed" :to="menu.path">
            <i :class="menu.icon"></i>
            <span>{{ menu.label }}</span>
          </router-link>
        </li>
        <li class="nav-item" v-if="user.isAllowedTo(menu.slug) && menu.type === 'many'">
          <a class="nav-link collapsed" :data-bs-target="'#menu_' + menu.slug" data-bs-toggle="collapse" href="#">
            <i :class="menu.icon"></i><span>{{ menu.label }}</span><i
              class="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul :id="'menu_' + menu.slug" class="nav-content collapse " data-bs-parent="#sidebar-nav">
            <template v-for="child in menu.children" :key="child.slug">
              <li @click="toggleSidebar" v-if="user.isAllowedTo(menu.slug+ '.' + child.slug)">
                <router-link :to="child.path">
                  <i class="bi bi-circle"></i><span>{{ child.label }}</span>
                </router-link>
              </li>
            </template>
          </ul>
        </li>
      </template>
    </ul>

  </aside><!-- End Sidebar-->

  <main id="main" class="main">

    <div class="pagetitle">
      <h1 class="system-title"></h1>
      <nav class="d-none">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="index.html">Home</a></li>
          <li class="breadcrumb-item">Pages</li>
          <li class="breadcrumb-item active">Blank</li>
        </ol>
      </nav>
    </div><!-- End Page Title -->
    <router-view v-if="user" />

  </main><!-- End #main -->



</template>



<style scoped>
#footer {
  position: absolute;
  left: 0px;
  bottom: 0px;
  height: 20px;
  width: 90%;
}
</style>
