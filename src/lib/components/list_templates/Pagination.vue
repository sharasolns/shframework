<template>
  <div v-if="paginationStyle !== 'loadMore'">
    <div class="record_count_body mb-3">
      <template v-if="pagination_data.end > 1">
        <span class="per_page_show">Showing</span>&nbsp;
        <select class="select_per_page" v-on:change="changePerPage" v-model="per_page">
          <option v-for="option in pageOptions" :value="option">{{  option }}</option>
        </select>
      </template>
      <span class="record_counts"> Showing {{ pagination_data.record_count }} items</span>
    </div>
    <nav aria-label="Page navigation" v-if="pagination_data != null && pagination_data.end > 1">
      <ul class="pagination">
        <li :class="getActivePage === 1 ? 'disabled' : '' " class="page-item"><a @click="changeTableKey('page',getActivePage - 1)" class="page-link">«</a></li>
        <li class="page-item" v-for="page in getPages" :key="page" v-bind:class="getActivePage === page ? 'active':''">
          <a v-if="getActivePage === page" class="page-link">{{ page }}</a>
          <a v-else-if="['..','...'].includes(page)" class="page-link">{{ page }}</a>
          <a v-else v-on:click="changeTableKey('page',page)" class="page-link">{{ page }}</a>
        </li>
        <li  :class="getActivePage === this.pagination_data.end ? 'disabled' : '' "   class="page-item"><a @click="changeTableKey('page',getActivePage + 1)" class="page-link">»</a></li>
      </ul>
    </nav>
  </div>
  <div v-else>
    <div class="text-center" v-if="this.pagination_data.loading === 1 && loadMore && hideLoadMore">
      <div class="spinner-border" role="status">
      </div>
    </div>
    <div class="text-center" v-if="!hideCount">
      <span class="per_page_show">Showing {{ pagination_data.displayCount }} of {{ pagination_data.record_count }} items</span>
    </div>
    <div class="text-center" v-if="pagination_data.displayCount < pagination_data.record_count && !hideLoadMore">
      <button v-if="this.pagination_data.loading !== 1" class="btn btn-sm btn-primary mt-1" @click="loadMoreRecords">
        Load More
      </button>
      <span v-else class="spinner-border"></span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Pagination',
  props: ['pagination_data', 'loadMore', 'hideCount', 'hideLoadMore', 'paginationStyle','perPage'],
  data () {
    return {
      current_page: this.pagination_data.current,
      per_page: this.pagination_data.per_page,
      loadingMore: 0,
      pageOptions: [10,25,50,100,200,400]
    }
  },
  mounted(){
    if(!this.pageOptions.includes(this.perPage)){
      const recordCount = this.pagination_data.record_count
      recordCount > 0 && recordCount < this.perPage && this.pageOptions.push(recordCount)
      recordCount > 0 && recordCount >= this.perPage && this.pageOptions.push(this.perPage)
    }
  },
  methods: {
    changeTableKey: function (key, value) {
      this.$emit('changeKey', key, value)
    },
    changePerPage: function () {
      this.$emit('changeKey', 'per_page', this.per_page)
    },
    loadMoreRecords: function () {
      this.$emit('loadMoreRecords', 'now')
    }
  },
  computed: {
    getActivePage: function () {
      return this.pagination_data.current
    },
    getPerPage: function () {
      return this.per_page
    },
    getPages: function () {
      const pages = this.pagination_data.end
      const current = this.pagination_data.current
      var displayPages = []
      if (pages < 13) {
        return this.pagination_data.end
      } else {
        if (current < 7) {
          for (let i = 1; i < 9; i++) {
            displayPages.push(i)
          }
          displayPages.push('...')
          displayPages.push(pages - 1)
          displayPages.push(pages)
          return displayPages
        } else if ((pages - current) < 6) {
          displayPages.push(1)
          displayPages.push(2)
          displayPages.push('...')
          var max = pages - 9
          let l = 1
          for (let i = pages; i > max; i--) {
            displayPages.push(max + l)
            l++
          }
          return displayPages
        } else {
          displayPages.push(1)
          displayPages.push(2)
          displayPages.push('...')
          for (let i = current - 3; i < current + 4; i++) {
            displayPages.push(i)
          }
          displayPages.push('..')
          displayPages.push(pages - 1)
          displayPages.push(pages)
          return displayPages
        }
      }
    }
  }
}
</script>
