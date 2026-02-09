# SH Framework (@iankibetsh/shframework)

[![npm version](https://img.shields.io/npm/v/@iankibetsh/shframework.svg)](https://www.npmjs.com/package/@iankibetsh/shframework)

A powerful Vue 3 library for rapid application development, specifically designed to integrate seamlessly with Laravel-based backends.

## 🚀 Installation

Install the package using npm:

```shell
npm install @iankibetsh/shframework
```

## 🛠 Core Components

### 1. ShTable

A robust table component that handles server-side pagination, searching, and custom formatting.

- **Nested Key Support**: Access nested properties using dot notation (e.g., `user.name`).
- **Auto-Label Generation**: Automatically generates human-readable labels from keys if not explicitly provided (e.g., `user.first_name` becomes "First Name").
- **Named Slots for Custom Formatting**: Use named slots for columns to provide custom formatting (e.g., `<template #age="{ row }">`).
- **Multi-Action Support**: Enable row selection and collective operations with a floating action bar.
- **Caching & Background Loading**: Uses IndexedDB to cache data. Shows cached data immediately while fetching fresh data in the background (enabled via `enableTableCache` config or `:cache="true"` prop).
- **User-Specific Caching**: Automatically prefixes cache keys with user identifiers (e.g., `id`, `email`) to ensure data isolation between users. Configure via `cacheUserFields`.
- **Metadata Tracking**: Tracks cache source URLs and timestamps in a dedicated `cache_metadata` store for better auditability.
- **Links & Actions**: Easily define column links and action buttons.

```html
<sh-table :headers="['id', 'user.name', 'email']" end-point="users/list">
  <template #user.name="{ row }">
    <strong>{{ row.user.name }}</strong>
  </template>
</sh-table>
```

### Multi-Action Support

Enable multi-row selection and perform collective actions by passing the `multi-actions` prop.

```html
<sh-table
  :headers="['id', 'name']"
  end-point="users/list"
  :multi-actions="[
    {
      label: 'Delete Selected',
      class: 'btn-outline-danger',
      icon: 'bi-trash',
      permission: 'delete_users',
      callback: (selectedRecords) => {
        // Handle action, e.g., send IDs to backend
        const ids = selectedRecords.map(r => r.id);
        console.log('Selected IDs:', ids);
      }
    }
  ]"
/>
```

### 2. ShAutoForm

The flagship component for generating complex forms from simple configurations.

- **Auto-Detection**: Infers input types from field names (email, phone, date, etc.).
- **Multi-Step Support**: Break long forms into logical steps with progress indicators.
- **Validation**: Seamlessly handles and displays Laravel validation errors (422).
- **GraphQL Support**: Integrate with GraphQL mutations via the `gqlMutation` prop.
- **Checkbox Support**: Easily handle boolean or multiple-choice fields with `type: 'checkbox'`.
- **Modern Reactivity**: Built using Vue 3.4's `defineModel` for clean, conflict-free two-way binding.

```html
<sh-auto-form
  :fields="['name', 'email', 'password', 'gender']"
  :required="['name', 'email']"
  action="auth/register"
  :successCallback="onRegistered"
/>
```

### 3. ShForm

The underlying engine for `ShAutoForm`, used for more granular control over form layouts and field types.

### 4. ShModalForm

A convenience component that wraps a trigger button, a Bootstrap modal, and an `ShForm` into one.

```html
<sh-modal-form
  modal-id="addTaskModal"
  modal-title="Create New Task"
  :fields="['title', 'description']"
  action="tasks/store"
>
  Add Task
</sh-modal-form>
```

---

## 🏗 Helpers & Utilities

### shApis

A thin wrapper around Axios for making API requests. It uses `VITE_APP_API_URL` from your `.env` as the base.

- `shApis.doGet(endpoint, params)`
- `shApis.doPost(endpoint, data)`

### shRepo

A collection of common UI and data utilities.

- `shRepo.runPlainRequest(url, message)`: Post request with a confirmation prompt.
- `shRepo.runSilentRequest(url)`: Direct post request without prompt.
- `shRepo.showToast(message, type)`: Displays a sweetalert2 toast.
- `shRepo.flushCache()`: Clears all IndexedDB cache data.
- `shRepo.swalSuccess(message)` / `shRepo.swalError(message)`: Standard success/error popups.

### shUser (State Management)

Pinia-based store for managing authenticated user state and sessions.

```javascript
import { useUserStore } from "@iankibetsh/shframework";
const userStore = useUserStore();

userStore.setUser(); // Fetches current user
userStore.logOut(); // Clears session and local storage
```

---

## 📄 Documentation

For full details, property lists, and advanced usage, visit our documentation:

👉 [https://frontend-documentation.pages.dev/](https://frontend-documentation.pages.dev/)

## License

MIT
