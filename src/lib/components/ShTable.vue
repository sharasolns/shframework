<script setup>
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  inject,
  useSlots,
} from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useUserStore } from "../repo/stores/ShUser";
import NoRecords from "./others/NoRecords.vue";
import TableActions from "./table/TableActions.vue";
import ShCanvas from "./ShCanvas.vue";
import ShRange from "./ShRange.vue";
import pagination from "./list_templates/Pagination.vue";
import { DateTime } from "luxon";

import apis from "../repo/helpers/ShApis";
import helpers from "../repo/helpers/ShRepo.js";
import shRepo from "../repo/helpers/ShRepo.js";
import shStorage from "../repo/repositories/ShStorage";

// --- Props / Emits
const props = defineProps({
  endPoint: [String, null],
  orderBy: String,
  orderMethod: { type: String, default: "desc" },
  headers: [Array, null],
  disableMobileResponsive: { type: Boolean, default: false },
  cacheKey: [String, null],
  query: [String, null],
  pageCount: [Number, null],
  actions: [Object, null],
  hideCount: { type: Boolean, default: false },
  hideLoadMore: { type: Boolean, default: false },
  links: [Object, null],
  reload: [Number, Boolean, String, null],
  hideSearch: { type: Boolean, default: false },
  sharedData: [Object, null],
  searchPlaceholder: [String, null],
  event: [String, null],
  displayMore: [Boolean, null],
  displayMoreBtnClass: [String, null],
  moreDetailsColumns: [Array, null],
  moreDetailsFields: [Array, null],
  hasDownload: { type: Boolean, default: false },
  downloadFields: [Array, null],
  tableHover: { type: Boolean, default: false },
  hideIds: { type: Array, default: () => [] },
  paginationStyle: [String, null],
  hasRange: { type: Boolean, default: false },
  selectedRange: [Object, null],
  noRecordsMessage: [String, null],
  multiActions: { type: Array, default: () => [] },
});

const emit = defineEmits(["rowSelected", "dataReloaded", "dataLoaded"]);

// --- Injection
const noRecordsComponent = inject("noRecordsComponent", NoRecords);

// --- Local State
const order_by = ref(props.orderBy);
const order_method = ref(props.orderMethod);
const per_page = ref(props.pageCount ?? shRepo.getShConfig("tablePerPage", 10));
const page = ref(1);
const exactMatch = ref(false);
const filter_value = ref("");
const loading = ref("loading"); // 'loading' | 'done' | 'error'
const loading_error = ref("");
const records = ref([]);
const total = ref(0);
const pagination_data = ref(null);
const moreDetailsId = ref(null);
const moreDetailsModel = ref(null);
const downloading = ref(false);
const appUrl =
  window?.VITE_APP_API_URL ?? import.meta?.env?.VITE_APP_API_URL ?? "";
const hasCanvas = ref(0);
const selectedRecord = ref(null);
const timeOut = ref(null);
const tableHeaders = ref([]);
const pageStyle = ref(
  props.paginationStyle ??
    shRepo.getShConfig("tablePaginationStyle", "loadMore"),
);
const range = ref(null);
const from = ref(null);
const to = ref(null);
const period = ref(null);
const lastId = ref(null);

const selectedItems = ref([]);
const selectAll = ref(false);

// Responsive width
const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1024,
);
const handleResize = () => (windowWidth.value = window.innerWidth);

// --- Slots helpers
const slots = useSlots();
const hasDefaultSlot = computed(() => !!slots.default);
const hasRecordsSlot = computed(() => !!slots.records);
const hasEmptySlot = computed(() => !!slots.empty);

// --- Lifecycle
onMounted(() => {
  if (props.headers) tableHeaders.value = props.headers;

  if (props.actions?.actions) {
    props.actions.actions.forEach((a) => {
      if (a.canvasComponent) hasCanvas.value = 1;
    });
  }

  if (props.cacheKey) setCachedData();

  reloadData();

  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (timeOut.value) clearTimeout(timeOut.value);
});

// --- Utils used in template
const getData = (record, key) => {
  if (!key || !record) return "";
  if (typeof key !== "string") return "";
  return key.split(".").reduce((obj, i) => (obj ? obj[i] : ""), record);
};

const getLabel = (title) => {
  if (typeof title === "string") {
    if (title.includes(".")) {
      const parts = title.split(".");
      return parts[parts.length - 1].replace(/_/g, " ");
    }
    return title.replace(/_/g, " ");
  }
  if (typeof title === "object") {
    if (title.label) return title.label;
    const key = title.key ?? title.field ?? "";
    if (key.includes(".")) {
      const parts = key.split(".");
      return parts[parts.length - 1].replace(/_/g, " ");
    }
    return key.replace(/_/g, " ");
  }
  return "";
};

const getSlotName = (key) => {
  if (typeof key === "string") return key;
  if (typeof key === "object") return key.key ?? key.field ?? "";
  if (typeof key === "function") return key(null);
  return "";
};

const { user } = storeToRefs(useUserStore());

const activeMultiActions = computed(() => {
  return props.multiActions.filter((action) => {
    if (!action.permission) return true;
    return user.value.isAllowedTo(action.permission);
  });
});

const cleanColumn = (col) => {
  const newCol = { ...col };
  delete newCol.component;
  delete newCol.key;
  return newCol;
};

const showColumn = (header) => {
  if (typeof header === "string") return true;
  if (typeof header === "object" && header.validator) return header.validator();
  return true;
};

const cleanCanvasProps = (actions) => {
  const replaced = { ...actions };
  replaced.class = null;
  return replaced;
};

const canvasClosed = () => {
  selectedRecord.value = null;
};

const rowSelected = (row) => {
  selectedRecord.value = null;
  setTimeout(() => {
    selectedRecord.value = row;
    emit("rowSelected", row);
  }, 100);
};

const changeKey = (key, value) => {
  if (key === "order_by") {
    order_by.value = value;
    order_method.value = order_method.value === "desc" ? "asc" : "desc";
  } else if (key === "per_page") {
    per_page.value = value;
    page.value = 1;
  } else {
    // generic
    // support pagination component passing keys like 'page'
    if (key in stateProxy) {
      stateProxy[key] = value;
    } else {
      // fallback direct
      if (key === "page") page.value = value;
    }
  }
  reloadData();
};

const getLinkClass = (config) =>
  typeof config === "object" ? config.class || "" : "";

const replaceActionUrl = (path, obj) => {
  if (!path) return "";
  const matches = path.match(/\{(.*?)\}/g);
  try {
    matches?.forEach((k) => {
      const key = k.replace("{", "").replace("}", "");
      path = path.replace(`{${key}}`, obj[key]);
    });
    return path;
  } catch (e) {
    return path;
  }
};

const doEmitAction = (action, data) => {
  if (typeof action === "function") action(data);
  else emit(action, data);
};

const getFieldType = (field) => {
  const numbers = ["age", "interest_rate_pa"];
  const moneys = [
    "amount",
    "paid_amount",
    "total_paid",
    "total",
    "monthly_fee",
    "share_cost",
    "min_contribution",
    "min_membership_contribution",
  ];
  const dates = [
    "invoice_date",
    "free_tier_days",
    "updated_at",
    "created_at",
    "end_time",
  ];

  const rawField =
    typeof field === "object" ? (field.key ?? field.field ?? "") : field;
  const lastPart =
    typeof rawField === "string" && rawField.includes(".")
      ? rawField.split(".").pop()
      : rawField;

  if (typeof lastPart === "string" && numbers.includes(lastPart))
    return "numeric";
  if (typeof lastPart === "string" && moneys.includes(lastPart)) return "money";
  if (typeof lastPart === "string" && dates.includes(lastPart)) return "date";
  return "string";
};

const replaceLinkUrl = (p, obj) => {
  let path = p;
  if (typeof path === "object") {
    if (path.link) path = path.link;
    else if (path.url) path = path.url;
    else if (path.path) path = path.path;
    else path = "";
  }
  const matches = path.match(/\{(.*?)\}/g);
  matches?.forEach((k) => {
    const key = k.replace("{", "").replace("}", "");
    path = path.replace(`{${key}}`, obj[key]);
  });
  return path;
};

const formatDate = (date) =>
  DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED);

const setMoreDetailsModel = (row) => {
  moreDetailsModel.value = null;
  moreDetailsModel.value = row;
};

const loadMoreRecords = () => reloadData(page.value + 1, 1);

const rangeChanged = (newRange) => {
  range.value = newRange;
  from.value = newRange.from.toFormat("LL/dd/yyyy");
  to.value = newRange.to.toFormat("LL/dd/yyyy");
  period.value = newRange.period;
  reloadData();
};

const userTyping = () => {
  if (timeOut.value) clearTimeout(timeOut.value);
  timeOut.value = setTimeout(() => reloadData(1), 800);
};

const exportData = () => {
  downloading.value = true;
  const headers = [];
  const fields = props.downloadFields ? props.downloadFields : props.headers;
  fields?.forEach((header) => {
    if (typeof header === "string") headers.push(header);
  });

  const data = {
    titles: headers,
    export: 1,
    order_by: order_by.value,
    order_method: order_method.value,
    filter_value: filter_value.value,
    from: from.value,
    to: to.value,
    period: period.value,
    lastId: lastId.value,
  };

  apis
    .doPost(props.endPoint, data)
    .then((res) => {
      downloading.value = false;
      if (res.data.file) {
        const url =
          appUrl +
          "external-download?file=" +
          res.data.file +
          "&name=" +
          res.data.name;
        window.location.href = url;
      }
    })
    .catch((reason) => {
      downloading.value = false;
      const error =
        typeof reason.response === "undefined"
          ? "Error getting data from backend"
          : `${reason.response.status}:${reason.response.statusText}`;
      helpers.swalError("Error", error);
    });
};

const setCachedData = () => {
  if (props.cacheKey) {
    records.value = shStorage.getItem("sh_table_cache_" + props.cacheKey, null);
  }
};

const reloadNotifications = () => reloadData();

// Main loader
const reloadData = (newPage, append) => {
  if (typeof newPage !== "undefined") page.value = newPage;

  if (props.cacheKey && records.value !== null) {
    loading.value = "done";
  } else if (!append) {
    loading.value = "loading";
  }

  let data = {
    order_by: order_by.value,
    order_method: order_method.value,
    per_page: per_page.value,
    page: page.value,
    filter_value: filter_value.value,
    paginated: true,
    from: from.value,
    to: to.value,
    period: period.value,
    exact: exactMatch.value,
    lastId: lastId.value,
  };

  // strip empty
  Object.keys(data).forEach((k) => {
    if (data[k] === null || data[k] === "") delete data[k];
  });

  if (pagination_data.value) pagination_data.value.loading = 1;

  let endPoint = props.endPoint;
  if (!props.endPoint && props.query) {
    endPoint = "sh-ql";
    data.query = props.query;
  }

  apis
    .doGet(endPoint, data)
    .then((req) => {
      emit("dataReloaded", pagination_data.value);
      loading.value = "done";

      const response = req.data.data;
      emit("dataLoaded", response);

      if (page.value < 2 && props.cacheKey) {
        shStorage.setItem("sh_table_cache_" + props.cacheKey, response.data);
      }

      pagination_data.value = {
        current: response.current_page,
        start: response.from,
        end: response.last_page,
        record_count: response.total,
        per_page: response.per_page,
        loading: 0,
        displayCount:
          response.total > response.per_page
            ? response.per_page
            : response.total,
      };

      if (!props.headers && response.total > 0) {
        tableHeaders.value = Object.keys(response.data[0]);
      }

      lastId.value =
        response.data.length > 0
          ? response.data[response.data.length - 1].id
          : null;

      if (append) {
        records.value.push(...response.data);
        let totalShown =
          response.total > response.per_page
            ? response.per_page * response.current_page
            : response.total;
        if (totalShown > response.total) totalShown = response.total;
        pagination_data.value.displayCount = totalShown;

        const scrollingElement = document.scrollingElement || document.body;
        scrollingElement.scrollTop = scrollingElement.scrollHeight;
      } else {
        records.value = response.data;
      }
    })
    .catch((reason) => {
      const error =
        typeof reason.response === "undefined"
          ? "Error getting data from backend"
          : `${reason.response.status}:${reason.response.statusText} (${props.endPoint})`;
      loading_error.value = error;
      loading.value = "error";
    });
};

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedItems.value = records.value.map((r) => r.id);
  } else {
    selectedItems.value = [];
  }
};

const toggleSelectItem = (id) => {
  const index = selectedItems.value.indexOf(id);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(id);
  }
};

const runMultiAction = (action) => {
  const selectedRecords = records.value.filter((r) =>
    selectedItems.value.includes(r.id),
  );
  if (typeof action.callback === "function") {
    action.callback(selectedRecords);
  }
  selectedItems.value = [];
};

watch(
  selectedItems,
  (newVal) => {
    selectAll.value =
      newVal.length === records.value.length && records.value.length > 0;
  },
  { deep: true },
);

// --- Watches
watch(
  () => props.hideIds,
  (newVal) => {
    if (Array.isArray(newVal) && Array.isArray(records.value)) {
      records.value = records.value.filter((r) => !newVal.includes(r.id) && r);
    }
  },
  { deep: true },
);

watch(
  () => props.reload,
  () => reloadData(),
);
watch(
  () => props.endPoint,
  () => reloadData(),
);

// optional proxy (for changeKey generic setter)
const stateProxy = reactive({
  page,
  per_page,
  order_by,
  order_method,
});
</script>
<template>
  <div class="auto-table mt-2">
    <div class="col-md-4 mb-2" v-if="hasDownload">
      <button
        :disabled="downloading"
        class="btn btn-warning btn-sm"
        @click="exportData()"
      >
        <template v-if="!downloading">
          <i class="bi-download"></i> Export
        </template>
        <template v-else>
          <span
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <span class="visually-hidden">Loading...</span>
        </template>
      </button>
    </div>

    <div class="row" v-if="!hideSearch">
      <div
        class="col-12 mb-3 d-flex justify-content-between flex-column flex-md-row flex-lg-row"
      >
        <div class="sh-search-bar input-group" :class="hasRange ? 'me-2' : ''">
          <input
            @keydown="userTyping"
            @keyup="userTyping"
            type="search"
            @change="reloadData(1)"
            v-model="filter_value"
            :placeholder="searchPlaceholder ? searchPlaceholder : 'Search'"
            class="form-control sh-search-input"
          />
          <span
            class="input-group-text exact_checkbox"
            v-if="filter_value.length > 1"
          >
            <input
              @change="reloadData"
              :value="true"
              v-model="exactMatch"
              type="checkbox"
            />
            <span class="ms-1">Exact</span>
          </span>
        </div>

        <div v-if="hasRange" class="sh-range-selector">
          <sh-range @range-selected="rangeChanged" :selected="selectedRange" />
        </div>
      </div>
    </div>

    <template v-if="hasDefaultSlot">
      <div class="text-center" v-if="loading === 'loading'">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="loading === 'error'" class="alert alert-danger">
        <span>{{ loading_error }}</span>
      </div>
      <template v-if="loading === 'done'">
        <template v-if="records.length === 0">
          <slot name="empty" v-if="hasEmptySlot"></slot>
          <div v-else-if="!hasRecordsSlot" class="text-center bg-primary-light px-2 py-1 rounded no_records_div">
            <i class="bi-info-circle"></i> No records found
          </div>
        </template>
        <template v-for="record in records" :key="record.id" v-else>
          <slot :record="record"></slot>
        </template>
      </template>
    </template>

    <template v-else-if="hasRecordsSlot">
      <div class="text-center" v-if="loading === 'loading' && !cacheKey">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div
        v-else-if="loading === 'error' && !cacheKey"
        class="alert alert-danger error-loading"
      >
        <span>{{ loading_error }}</span>
      </div>
      <template v-if="loading === 'done' || cacheKey">
        <template v-if="!records || records.length === 0">
          <slot name="empty" v-if="hasEmptySlot"></slot>
          <component :is="noRecordsComponent" v-else>
            <i class="bi-info-circle"></i>
            {{ noRecordsMessage ?? "No records found" }}
          </component>
        </template>
        <slot name="records" :records="records"></slot>
      </template>
    </template>

    <table
      class="table sh-table"
      :class="tableHover ? 'table-hover' : ''"
      v-else-if="(windowWidth > 700 || disableMobileResponsive) && records.length > 0"
    >
      <thead class="sh-thead">
        <tr>
          <th v-if="activeMultiActions.length > 0" style="width: 40px">
            <input
              type="checkbox"
              class="form-check-input"
              v-model="selectAll"
              @change="toggleSelectAll"
            />
          </th>
          <template v-for="title in tableHeaders" :key="title">
            <th v-if="showColumn(title)">
              <a
                class="text-capitalize"
                @click="changeKey('order_by', title)"
                v-if="typeof title === 'string'"
                >{{ getLabel(title) }}</a
              >

              <a
                class="text-capitalize"
                @click="changeKey('order_by', title.key)"
                v-else-if="typeof title === 'object'"
                >{{ getLabel(title) }}</a
              >

              <a
                class="text-capitalize"
                @click="changeKey('order_by', title(null))"
                v-else-if="typeof title === 'function'"
                >{{ title(null).replace(/_/g, " ") }}</a
              >

              <a
                class="text-capitalize"
                v-else-if="typeof title !== 'undefined'"
                @click="changeKey('order_by', title)"
                >{{ String(getLabel(title)) }}</a
              >
            </th>
          </template>

          <th v-if="actions" class="text-capitalize">
            {{ actions.label }}
          </th>
        </tr>
      </thead>

      <tbody class="sh-tbody">
        <tr class="text-center" v-if="loading === 'loading'">
          <td
            :colspan="
              activeMultiActions.length > 0
                ? tableHeaders.length + 1
                : tableHeaders.length
            "
          >
            <div class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </td>
        </tr>

        <tr
          class="text-center alert alert-danger"
          v-else-if="loading === 'error'"
        >
          <td
            :colspan="
              activeMultiActions.length > 0
                ? tableHeaders.length + 1
                : tableHeaders.length
            "
          >
            {{ loading_error }}
          </td>
        </tr>

        <tr class="no_records" v-else-if="records.length === 0">
          <td
            :colspan="
              actions
                ? tableHeaders.length + (activeMultiActions.length > 0 ? 2 : 1)
                : tableHeaders.length + (activeMultiActions.length > 0 ? 1 : 0)
            "
          >
            <slot name="empty" v-if="hasEmptySlot"></slot>
            <div
              v-else
              class="text-center bg-primary-light px-2 py-1 rounded no_records_div"
            >
              <i class="bi-info-circle"></i> No records found
            </div>
          </td>
        </tr>

        <tr
          v-else-if="loading === 'done'"
          v-for="(record, index) in records"
          :key="record.id"
          :class="record.class"
          @click="rowSelected(record)"
        >
          <td v-if="activeMultiActions.length > 0" @click.stop>
            <input
              type="checkbox"
              class="form-check-input"
              :value="record.id"
              :checked="selectedItems.includes(record.id)"
              @change="toggleSelectItem(record.id)"
            />
          </td>
          <template v-for="key in tableHeaders" :key="key">
            <td v-if="showColumn(key)">
              <slot :name="getSlotName(key)" :row="record" :index="index">
                <router-link
                  v-if="typeof key === 'string' && links && links[key]"
                  :target="links[key].target ? '_blank' : ''"
                  :to="replaceLinkUrl(links[key], record)"
                  :class="getLinkClass(links[key])"
                  v-html="getData(record, key)"
                />
                <span v-else-if="getFieldType(key) === 'numeric'">
                  {{ Intl.NumberFormat().format(getData(record, key)) }}
                </span>
                <span
                  v-else-if="getFieldType(key) === 'money'"
                  class="text-success fw-bold"
                >
                  {{ Intl.NumberFormat().format(getData(record, key)) }}
                </span>
                <span v-else-if="getFieldType(key) === 'date'">
                  {{ formatDate(getData(record, key)) }}
                </span>
                <span
                  v-else-if="typeof key === 'string'"
                  v-html="getData(record, key)"
                />
                <span
                  v-else-if="typeof key === 'function'"
                  v-html="key(record, index)"
                />
                <span
                  v-else-if="typeof key === 'object' && key.callBack"
                  v-html="key.callBack(record, index)"
                />
                <span
                  v-else-if="typeof key === 'object' && key.callback"
                  v-html="key.callback(record, index)"
                />
                <component
                  v-else-if="typeof key === 'object' && key.component"
                  :is="key.component"
                  :item="record"
                  v-bind="cleanColumn(key)"
                />
                <span
                  v-else-if="typeof key === 'object'"
                  v-html="getData(record, key.key ?? key.field)"
                />
                <span v-else v-html="getData(record, key[0])" />
              </slot>
            </td>
          </template>

          <td v-if="actions" style="white-space: nowrap">
            <table-actions
              :emitAction="doEmitAction"
              :actions="actions"
              :record="record"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mobile-list-items" v-else-if="loading === 'done' && records.length > 0">
        <template v-for="(record, index) in records" :key="record.id">
          <div
            class="single-mobile-req bg-light p-3"
            @click="rowSelected(record)"
          >
            <div v-if="activeMultiActions.length > 0" class="mb-2" @click.stop>
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :id="'mobile-check-' + record.id"
                  :checked="selectedItems.includes(record.id)"
                  @change="toggleSelectItem(record.id)"
                />
                <label
                  class="form-check-label"
                  :for="'mobile-check-' + record.id"
                  >Select Item</label
                >
              </div>
            </div>
            <template v-for="key in tableHeaders" :key="key[0]">
              <template v-if="showColumn(key)">
                <p
                  class="mb-1 font-weight-bold text-capitalize profile-form-title"
                  v-if="typeof key === 'string'"
                >
                  {{ getLabel(key) }}
                </p>
                <p
                  class="mb-1 font-weight-bold text-capitalize profile-form-title"
                  v-else-if="typeof key === 'function'"
                >
                  {{ key(null).replace(/_/g, " ") }}
                </p>
                <p
                  class="mb-1 font-weight-bold text-capitalize profile-form-title"
                  v-else-if="typeof key === 'object'"
                >
                  {{ getLabel(key) }}
                </p>
                <p
                  class="mb-1 font-weight-bold text-capitalize profile-form-title"
                  v-else
                >
                  {{ key[1].replace(/_/g, " ") }}
                </p>

                <span>
                  <slot :name="getSlotName(key)" :row="record" :index="index">
                    <router-link
                      v-if="typeof key === 'string' && links && links[key]"
                      :to="replaceLinkUrl(links[key], record)"
                      :class="getLinkClass(links[key])"
                      v-html="getData(record, key)"
                    />
                    <span v-else-if="getFieldType(key) === 'numeric'">
                      {{ Intl.NumberFormat().format(getData(record, key)) }}
                    </span>
                    <span
                      v-else-if="getFieldType(key) === 'money'"
                      class="text-primary fw-bold"
                    >
                      {{ Intl.NumberFormat().format(getData(record, key)) }}
                    </span>
                    <span v-else-if="getFieldType(key) === 'date'">
                      {{ formatDate(getData(record, key)) }}
                    </span>
                    <span
                      v-else-if="typeof key === 'string'"
                      v-html="getData(record, key)"
                    />
                    <span
                      v-else-if="typeof key === 'object' && key.callBack"
                      v-html="key.callBack(record, index)"
                    />
                    <span
                      v-else-if="typeof key === 'object' && key.callback"
                      v-html="key.callback(record, index)"
                    />
                    <component
                      v-else-if="typeof key === 'object' && key.component"
                      :is="key.component"
                      :item="record"
                      v-bind="cleanColumn(key)"
                    />
                    <span
                      v-else-if="typeof key === 'object'"
                      v-html="getData(record, key.key ?? key.field)"
                    />
                    <span
                      v-else-if="typeof key === 'function'"
                      v-html="key(record, index)"
                    />
                    <span v-else v-html="getData(record, key[0])" />
                  </slot>
                </span>
              </template>

              <hr class="my-2" />
            </template>

            <div v-if="actions">
              <table-actions
                :emitAction="doEmitAction"
                :actions="actions"
                :record="record"
              />
            </div>
          </div>
        </template>
    </div>

    <div v-else>
      <div class="text-center" v-if="loading === 'loading'">
        <div class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>

      <div v-else-if="loading === 'error'">
        <span>{{ loading_error }}</span>
      </div>

      <div v-else-if="loading === 'done' && records.length === 0">
        <slot name="empty" v-if="hasEmptySlot"></slot>
        <div
          v-else
          class="text-center bg-primary-light px-2 py-1 rounded no_records_div"
        >
          <i class="bi-info-circle"></i> No records found
        </div>
      </div>
    </div>

    <pagination
      v-if="pagination_data"
      @loadMoreRecords="loadMoreRecords"
      :hide-load-more="hideLoadMore"
      :per-page="per_page"
      :hide-count="hideCount"
      :pagination_data="pagination_data"
      @changeKey="changeKey"
      :pagination-style="pageStyle"
    />

    <template v-if="actions">
      <template v-for="action in actions.actions" :key="action.label">
        <sh-canvas
          @offcanvasClosed="canvasClosed"
          v-if="action.canvasId"
          :position="action.canvasPosition"
          :canvas-size="action.canvasSize"
          :canvas-title="action.canvasTitle"
          :canvas-id="action.canvasId"
        >
          <component
            @recordUpdated="reloadData"
            v-if="selectedRecord"
            v-bind="cleanCanvasProps(action)"
            :record="selectedRecord"
            :is="action.canvasComponent"
          />
        </sh-canvas>
      </template>
    </template>

    <div
      v-if="selectedItems.length > 0 && activeMultiActions.length > 0"
      class="sh-multi-actions-bar shadow-lg border rounded p-3 bg-white d-flex justify-content-between align-items-center animate__animated animate__slideInUp"
    >
      <div>
        <span class="badge bg-primary rounded-pill me-2">{{
          selectedItems.length
        }}</span>
        items selected
      </div>
      <div class="d-flex gap-2">
        <button
          v-for="action in activeMultiActions"
          :key="action.label"
          class="btn btn-sm"
          :class="action.class ?? 'btn-outline-primary'"
          @click="runMultiAction(action)"
        >
          <i v-if="action.icon" :class="action.icon"></i>
          {{ action.label }}
        </button>
        <button class="btn btn-sm btn-light" @click="selectedItems = []">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.colored-toast.swal2-icon-success {
  background-color: #a5dc86 !important;
}

.colored-toast.swal2-icon-error {
  background-color: #f27474 !important;
}

.colored-toast.swal2-icon-warning {
  background-color: #f8bb86 !important;
}

.colored-toast.swal2-icon-info {
  background-color: #3fc3ee !important;
}

.colored-toast.swal2-icon-question {
  background-color: #87adbd !important;
}

.colored-toast .swal2-title {
  color: white;
}

.colored-toast .swal2-close {
  color: white;
}

.colored-toast .swal2-html-container {
  color: white;
}

.sh-multi-actions-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1050;
  min-width: 300px;
}
</style>
