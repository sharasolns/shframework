# Sh modal Form

Sometimes you may want to use sh-modal-form. This is a component that combines the sh-modal and sh-form components.
Instead of creating button and modal separately, you can use this component to create a button that will trigger a modal with a form inside it.

## Importing

```javascript
import { ShModalForm } from "@iankibetsh/shframework";
```

## Example Usage

```html
<sh-modal-form
  modal-id="addTask"
  modal-title="Add Task"
  :fields="fields"
  :action="getActionUrl('store')"
  :successCallback="taskAdded"
  >Add Task</sh-modal-form
>
```

```javascript
import { useStreamline } from "@iankibetsh/vue-streamline";
const { getActionUrl } = useStreamline("tasks");

const fields = [
  { field: "name", label: "Task Name", required: true },
  { field: "description", type: "textarea", label: "Description" },
  { field: "phone", type: "phone", label: "Phone" },
];
```

## Attributes

### `modal-id`

- Type: `string`
- Default: `none`
- Required: `true`
- Details
  This is the modal attribute id that will be attached or triggered by a button later on

```
 Example: modal-id='exampleModal'
```

### `modal-title`

- Type: `string`
- Default: `none`
- Required: `false`
- Details
  This is the title of the modal

```
    Example: modal-title='My Example Modal'
```

### `modal-size`

- Type: `string`
- Default: `md`
- Required: `false`
- Options: `sm`, `md`, `lg`, `xl`
- Details
  This is the size of the modal

```
    Example: modal-size='md'
```

### `fields`

- Type: `array`
- Default: `none`
- Required: `true`
- Details
  These are the form fields configuration. While simple strings are supported, an array of objects is recommended for better control.

```
    Example:
    :fields="[
        { field: 'name', label: 'Full Name', required: true },
        { field: 'email', type: 'email', label: 'Email' }
    ]"
```

### `action`

- Type: `string`
- default: `none`
- Required: `true`
- Details:
  This is the action url to the api backend where the request will be handled.
  When using Streamline, it's recommended to use `getActionUrl('actionName')`.

```
    Example: :action="getActionUrl('store')"
```

### `method`

- Type: `string`
- Default: `post`
- Required: `false`
- Options: `post`, `put`, `patch`, `delete`
- Details:
  This is the method of the request. By default, the method is post

```
    Example: :method="put"
```

### `success-callback`

- Type: `function/method`
- Default: `none`
- Required: `false`
- Details:
  This is the method that will be called after the request is successful

```
    Example: :successCallback="taskAdded"
```

### `success-message`

- Type: `string`
- Default: `Action Successful`
- Required: `false`
- Details
  This is the message that will appear on the confirmation dialog

```
    Example: success-message="Task added successfully"
```

### `hide-button`

- Type: `boolean`
- Default: `false`
- Required: `false`
- Details:
  If `true`, the modal trigger button/link will be hidden. This is useful when you want to trigger the modal programmatically (e.g., via `shRepo.showModal(id)`).

### `hide-submit-button`

- Type: `boolean`
- Default: `false`
- Required: `false`
- Details:
  If `true`, the submit button inside the form will be hidden. Useful when you want to trigger form submission externally.
