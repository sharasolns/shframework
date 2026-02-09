# shRepo

This contains common helper functions

## Importing

```javascript
import { shRepo } from "@iankibetsh/shframework";
```

## Methods

### `runPlainRequest`

Use to run doPost request but with a prompt for confirmation

```javascript
shRepo
  .runPlainRequest("admin/departments/department/delete-department/1")
  .then((res) => {
    if (res.isConfirmed) {
      // success
    }
  });
```

### `runSilentRequest`

Use to run doPost request **WITHOUT** prompt for confirmation

```javascript
shRepo
  .runSilentRequest("admin/departments/department/delete-department/1")
  .then((res) => {
    if (res.isConfirmed) {
      // success
    }
  });
```

### `showToast`

shows a toast message

```javascript
shRepo.showToast("module added successfully", "success");
```

Takes the `message` and `type` in the case above a success

### `flushCache`

Clears all data from the application's IndexedDB stores (`table_cache` and `cache_metadata`).

```javascript
shRepo.flushCache().then(() => {
  console.log("Cache cleared");
});
```

### `swalError`

Triggers a sweet alert popup with error

### `swalSuccess`

Triggers a sweet alert popup with success
