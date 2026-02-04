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
- **Auto-Labels**: Automatically generates headers from keys (e.g., `created_at` -> **Created At**).
- **Named Slots**: Customize any column using `<template #column_key="{ row }">`.
- **Links & Actions**: Easily define column links and action buttons.

```html
<sh-table :headers="['id', 'user.name', 'email']" end-point="users/list">
  <template #user.name="{ row }">
    <strong>{{ row.user.name }}</strong>
  </template>
</sh-table>
```

### 2. ShAutoForm

The flagship component for generating complex forms from simple configurations.

- **Auto-Detection**: Infers input types from field names (email, phone, date, etc.).
- **Multi-Step Support**: Break long forms into logical steps with progress indicators.
- **Validation**: Seamlessly handles and displays Laravel validation errors (422).
- **GraphQL Support**: Integrate with GraphQL mutations via the `gqlMutation` prop.

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
