# ShAutoForm

ShAutoForm is a powerful auto-generating form component that automatically renders form fields based on configuration. It handles validation and submission, and integrates seamlessly with REST APIs.

## Basic Usage

```vue
<template>
  <ShAutoForm
    :fields="fields"
    :action="getActionUrl('addUser')"
    method="post"
    successMessage="User created successfully!"
  />
</template>

<script setup>
import { ShAutoForm } from "@iankibetsh/shframework";
import { useStreamline } from "@iankibetsh/vue-streamline";

const { getActionUrl } = useStreamline("users");

const fields = [
  {
    field: "name",
    label: "Full Name",
    required: true,
  },
  {
    field: "email",
    type: "email",
    required: true,
  },
  {
    field: "phone",
    type: "phone",
  },
];
</script>
```

## Props

### Required Props

#### fields

- **Type:** `Array`
- **Required:** `true`
- **Description:** Array of field configuration objects (preferred) or field names (strings)

**Example:**

```javascript
// Array of field objects with configuration (Recommended)
const fields = [
  {
    field: "name",
    label: "Full Name",
    placeholder: "Enter your name",
    required: true,
  },
  {
    field: "email",
    type: "email",
    label: "Email Address",
  },
];

// Simple array of field names
const fields = ["name", "email", "phone"];
```

### Optional Props

#### action

- **Type:** `String`
- **Required:** `false`
- **Description:** The API endpoint URL for form submission. When using Streamline, this is typically retrieved using `getActionUrl('actionName')`.

#### method

- **Type:** `String`
- **Default:** `'post'`
- **Validator:** Must be one of `['post', 'put', 'delete']`
- **Description:** HTTP method for the API request

#### actionLabel

- **Type:** `String`
- **Default:** `'Submit'`
- **Description:** Label text for the submit button

#### successMessage

- **Type:** `String`
- **Required:** `false`
- **Description:** Toast message to display on successful submission

#### successCallback

- **Type:** `Function`
- **Required:** `false`
- **Description:** Callback function executed after successful submission
- **Parameters:** `(responseData) => void`

#### preSubmitCallback

- **Type:** `Function`
- **Required:** `false`
- **Description:** Async callback executed before form submission. Return `true` to proceed or `false` to cancel
- **Parameters:** `(formData) => Promise<boolean>`

#### currentData

- **Type:** `Object`
- **Required:** `false`
- **Description:** Initial data to populate the form fields (useful for edit forms)

#### hideSubmitButton

- **Type:** `Boolean`
- **Default:** `false`
- **Description:** Hide the form's submit button. Useful when you want to trigger form submission externally via a ref or custom UI.

#### retainDataAfterSubmission

- **Type:** `Boolean`
- **Default:** `false`
- **Description:** Keep form data after successful submission instead of clearing

#### retainModal

- **Type:** `Boolean`
- **Default:** `false`
- **Description:** Keep modal open after successful submission

#### steps

- **Type:** `Array`
- **Required:** `false`
- **Description:** Configuration for multi-step forms. When provided, the form will be broken into steps with visual progress indicators

**Example:**

```javascript
const steps = [
  {
    name: "personal",
    title: "Personal Information",
    label: "Step 1: Personal Info", // Alternative to title
    description: "Tell us about yourself", // Optional step description
    fields: ["name", "email", "phone"],
    labels: {
      next: "Continue to Security",
      previous: "Back",
    },
  },
  {
    name: "account",
    title: "Account Details",
    description: "Create your account",
    fields: ["password", "password_confirmation"],
    labels: {
      next: "Next Step",
      previous: "Previous Step",
    },
  },
];
```

**Step Properties:**

- `name` (string): Unique identifier for the step
- `title` or `label` (string): Display text for the step indicator
- `description` (string, optional): Additional description shown under the title
- `fields` (array): Array of field names to include in this step
- `labels` (object, optional): Custom labels for navigation buttons
  - `next`: Label for the "Next" button (default: "Next")
  - `previous`: Label for the "Previous" button (default: "Previous")

## Events

- **Type:** `Object`
- **Required:** `false`
- **Description:** Custom labels for fields (key: field name, value: label text)

**Example:**

```javascript
const labels = {
  email: "Email Address",
  phone: "Phone Number",
};
```

#### placeHolders

- **Type:** `Object`
- **Required:** `false`
- **Description:** Custom placeholders for fields

**Example:**

```javascript
const placeHolders = {
  email: "you@example.com",
  phone: "+1234567890",
};
```

#### helperTexts

- **Type:** `Object`
- **Required:** `false`
- **Description:** Helper text displayed below fields

**Example:**

```javascript
const helperTexts = {
  email: "We will never share your email",
  password: "Must be at least 8 characters",
};
```

#### customComponents

- **Type:** `Object`
- **Required:** `false`
- **Description:** Custom Vue components for specific fields

**Example:**

```javascript
import CustomDatePicker from "./CustomDatePicker.vue";

const customComponents = {
  birthdate: CustomDatePicker,
};
```

#### formClasses

- **Type:** `Object`
- **Required:** `false`
- **Description:** Custom CSS classes for form elements

**Example:**

```javascript
const formClasses = {
  formGroup: "mb-3",
  formControl: "form-control custom-input",
  actionBtn: "btn btn-primary w-100",
};
```

#### formClass

- **Type:** `String`
- **Required:** `false`
- **Description:** CSS class for the form element

#### required

- **Type:** `Array`
- **Required:** `false`
- **Description:** Array of field names that should be marked as required

**Example:**

```javascript
const required = ["name", "email", "password"];
```

#### textAreas

- **Type:** `Array`
- **Required:** `false`
- **Description:** Fields to render as textareas

#### emails

- **Type:** `Array`
- **Required:** `false`
- **Description:** Fields to render as email inputs

#### phones

- **Type:** `Array`
- **Required:** `false`
- **Description:** Fields to render as phone inputs

#### numbers

- **Type:** `Array`
- **Required:** `false`
- **Description:** Fields to render as number inputs

#### dates

- **Type:** `Array`
- **Required:** `false`
- **Description:** Fields to render as date inputs

#### selects

- **Type:** `Array`
- **Required:** `false`
- **Description:** Fields to render as select dropdowns

#### fillSelects

- **Type:** `Object`
- **Required:** `false`
- **Description:** Configuration for select fields including options

**Example:**

```javascript
const fillSelects = {
  gender: {
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
    ],
  },
  country: {
    suggests: "/api/countries/search",
    type: "suggests",
  },
  interests: {
    options: [
      { value: "sports", label: "Sports" },
      { value: "music", label: "Music" },
    ],
    type: "checkbox",
  },
};
```

**Example:**

```javascript

```

## Events

### @success

Emitted when form submission is successful

**Payload:** `responseData`

**Example:**

```vue
<ShAutoForm :fields="fields" action="/api/users" @success="handleSuccess" />

<script setup>
const handleSuccess = (data) => {
  console.log("User created:", data);
};
</script>
```

### @preSubmit

Emitted before form submission (after preSubmitCallback)

**Payload:** `formData`

### @fieldChanged

Emitted when any field value changes

**Payload:** `(fieldName, fieldValue, allFormData)`

**Example:**

```vue
<ShAutoForm :fields="fields" @fieldChanged="onFieldChange" />

<script setup>
const onFieldChange = (field, value, formData) => {
  console.log(`${field} changed to:`, value);
  console.log("All form data:", formData);
};
</script>
```

### @formSubmitted

Emitted when form is successfully submitted (same as @success)

**Payload:** `responseData`

### @formError

Emitted when form submission fails

**Payload:** `errorReason`

## Field Configuration

When using object-based field definitions, you can configure each field individually:

```javascript
const fields = [
  {
    field: "email", // Field name (required)
    name: "email", // Alternative to 'field'
    type: "email", // Input type
    label: "Email Address", // Custom label
    placeholder: "Enter email",
    helper: "Helper text",
    helperText: "Alt helper", // Alternative to 'helper'
    required: true, // Mark as required
    component: CustomInput, // Custom component
    // Any other props to pass to the input component
    disabled: false,
    readonly: false,
    class: "custom-class",
  },
];
```

## Auto-detected Field Types

ShAutoForm automatically detects field types based on field names:

- **Textareas:** message, meta_description, comment, call_response, comments, description
- **Emails:** email
- **Phones:** phone
- **Numbers:** age
- **Dates:** free_tier_days, recurring_date, date, paid_at
- **Passwords:** password, password_confirmation, pin
- **Selects:** gender, payment_method, allow_view_mode, reasons_name, has_free_tier, payment_period, role, register_as, account_type
- **Checkboxes:** (No default auto-detect, use `type: 'checkbox'` or `type: 'checkboxes'`)

## Examples

### Simple Contact Form

```vue
<template>
  <ShAutoForm
    :fields="fields"
    :action="getActionUrl('sendMessage')"
    actionLabel="Send Message"
    successMessage="Message sent successfully!"
    @success="onSuccess"
  />
</template>

<script setup>
import { ShAutoForm } from "@iankibetsh/shframework";
import { useStreamline } from "@iankibetsh/vue-streamline";

const { getActionUrl } = useStreamline("contact");

const fields = [
  { field: "name", label: "Name", required: true },
  { field: "email", type: "email", label: "Email", required: true },
  { field: "message", type: "textarea", label: "Message", required: true },
];

const onSuccess = (data) => {
  console.log("Form submitted:", data);
};
</script>
```

### User Registration Form

```vue
<template>
  <ShAutoForm
    :fields="fields"
    :fillSelects="fillSelects"
    :action="getActionUrl('register')"
    method="post"
    actionLabel="Create Account"
    successMessage="Account created successfully!"
    @success="redirectToLogin"
  />
</template>

<script setup>
import { ShAutoForm } from "@iankibetsh/shframework";
import { useStreamline } from "@iankibetsh/vue-streamline";
import { useRouter } from "vue-router";

const router = useRouter();
const { getActionUrl } = useStreamline("auth");

const fields = [
  { field: "name", label: "Name", required: true },
  { field: "email", type: "email", label: "Email", required: true },
  { field: "password", type: "password", label: "Password", required: true },
  {
    field: "password_confirmation",
    type: "password",
    label: "Confirm Password",
  },
  { field: "phone", type: "phone", label: "Phone" },
  { field: "gender", type: "select", label: "Gender" },
  { field: "age", type: "number", label: "Age" },
];

const fillSelects = {
  gender: {
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ],
  },
};

const redirectToLogin = () => {
  router.push("/login");
};
</script>
```

### Edit Form with Pre-filled Data

```vue
<template>
  <ShAutoForm
    :fields="fields"
    :currentData="userData"
    :action="getActionUrl('updateUser')"
    method="put"
    actionLabel="Update Profile"
    successMessage="Profile updated!"
    @success="handleUpdate"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ShAutoForm } from "@iankibetsh/shframework";
import { useStreamline } from "@iankibetsh/vue-streamline";

const userId = ref(1);
const userData = ref({});
const { getActionUrl } = useStreamline(`users/${userId.value}`);

const fields = [
  { field: "name", label: "Name" },
  { field: "email", type: "email", label: "Email" },
  { field: "phone", type: "phone", label: "Phone" },
];

onMounted(async () => {
  // Fetch user data
  const response = await fetch(`/api/users/${userId.value}`);
  userData.value = await response.json();
});

const handleUpdate = (data) => {
  console.log("User updated:", data);
};
</script>
```

### Form with Pre-submit Validation

```vue
<template>
  <ShAutoForm
    :fields="['email', 'password']"
    :preSubmitCallback="validateForm"
    action="/api/login"
    actionLabel="Sign In"
    @success="handleLogin"
  />
</template>

<script setup>
import { ShAutoForm } from "@/lib/components/ShAutoForm.vue";

const validateForm = async (formData) => {
  if (!formData.email.includes("@")) {
    alert("Please enter a valid email");
    return false;
  }

  if (formData.password.length < 8) {
    alert("Password must be at least 8 characters");
    return false;
  }

  return true;
};

const handleLogin = (data) => {
  console.log("Logged in:", data);
};
</script>
```

### Form with Custom Components

```vue
<template>
  <ShAutoForm
    :fields="['name', 'birthdate', 'avatar']"
    :customComponents="customComponents"
    action="/api/users"
    @success="handleSuccess"
  />
</template>

<script setup>
import { ShAutoForm } from "@/lib/components/ShAutoForm.vue";
import CustomDatePicker from "./CustomDatePicker.vue";
import ImageUploader from "./ImageUploader.vue";

const customComponents = {
  birthdate: CustomDatePicker,
  avatar: ImageUploader,
};

const handleSuccess = (data) => {
  console.log("User created with custom inputs:", data);
};
</script>
```

### Form with Dynamic Fields

```vue
<template>
  <ShAutoForm
    :fields="dynamicFields"
    action="/api/submit"
    @fieldChanged="onFieldChange"
  />
</template>

<script setup>
import { ref } from "vue";
import { ShAutoForm } from "@/lib/components/ShAutoForm.vue";

const dynamicFields = ref(["name", "email"]);

const onFieldChange = (field, value, formData) => {
  // Add phone field if email is filled
  if (field === "email" && value && !dynamicFields.value.includes("phone")) {
    dynamicFields.value.push("phone");
  }
};
</script>
```

### Multi-Step Form

```vue
<template>
  <ShAutoForm
    :fields="fields"
    :steps="steps"
    :action="getActionUrl('register')"
    method="post"
    actionLabel="Complete Registration"
    successMessage="Registration completed!"
    @success="onRegistrationComplete"
  />
</template>

<script setup>
import { ShAutoForm } from "@iankibetsh/shframework";
import { useStreamline } from "@iankibetsh/vue-streamline";
import { useRouter } from "vue-router";

const router = useRouter();
const { getActionUrl } = useStreamline("auth");

const fields = [
  { field: "name", label: "Name", required: true },
  { field: "email", type: "email", label: "Email", required: true },
  { field: "phone", type: "phone", label: "Phone" },
  { field: "password", type: "password", label: "Password", required: true },
  {
    field: "password_confirmation",
    type: "password",
    label: "Confirm Password",
  },
  { field: "address", label: "Address" },
  { field: "city", label: "City" },
  { field: "country", type: "select", label: "Country" },
];

const steps = [
  {
    name: "personal",
    title: "Personal Information",
    description: "Tell us about yourself",
    fields: ["name", "email", "phone"],
    labels: {
      next: "Continue to Security",
      previous: "Back",
    },
  },
  {
    name: "account",
    title: "Account Security",
    description: "Create a strong password",
    fields: ["password", "password_confirmation"],
    labels: {
      next: "Continue to Address",
      previous: "Back to Personal Info",
    },
  },
  {
    name: "address",
    title: "Address Details",
    description: "Where are you located?",
    fields: ["address", "city", "country"],
    labels: {
      previous: "Back to Security",
    },
  },
];

const onRegistrationComplete = (data) => {
  router.push("/dashboard");
};
</script>
```

## Validation

ShAutoForm automatically handles server-side validation errors (HTTP 422 responses). Errors are displayed below the respective fields with the `is-invalid` class.

**Server Response Format:**

```json
{
  "errors": {
    "email": "The email has already been taken.",
    "password": ["The password must be at least 8 characters."]
  }
}
```

## Styling

ShAutoForm uses injected CSS classes from the `shFormElementClasses` provider. You can override these globally or per-form:

### Global Configuration

```javascript
// In your main.js or plugin
app.provide("shFormElementClasses", {
  formGroup: "form-group mb-3",
  formControl: "form-control",
  actionBtn: "btn btn-primary",
});
```

### Per-Form Configuration

```vue
<ShAutoForm
  :fields="fields"
  :formClasses="{
    formGroup: 'my-form-group',
    formControl: 'my-input',
    actionBtn: 'my-submit-btn',
  }"
/>
```

## Custom Form Components

You can provide custom form input components globally:

```javascript
// In your main.js or plugin
import CustomTextInput from "./CustomTextInput.vue";
import CustomEmailInput from "./CustomEmailInput.vue";

app.provide("formComponents", {
  text: CustomTextInput,
  email: CustomEmailInput,
  textArea: CustomTextAreaInput,
  phone: CustomPhoneInput,
  number: CustomNumberInput,
  select: CustomSelectInput,
  password: CustomPasswordInput,
  date: CustomDateInput,
});
```

## Best Practices

1. **Use field objects for complex forms** - Provides better control and readability
2. **Leverage auto-detection** - Name fields appropriately (email, phone, etc.) for automatic type inference
3. **Handle errors gracefully** - Listen to `@formError` event for error handling
4. **Pre-validate when needed** - Use `preSubmitCallback` for client-side validation
5. **Keep forms focused** - Break large forms into smaller, logical sections
6. **Provide helpful labels and hints** - Use `labels` and `helperTexts` for better UX
7. **Test validation** - Ensure server returns proper 422 validation errors
8. **Use multi-step forms for long forms** - Break complex forms into logical steps for better UX

## Multi-Step Forms

ShAutoForm supports multi-step forms through the `steps` prop. This is useful for breaking down complex forms into manageable sections with a beautiful visual progress indicator.

### Visual Design Features

The redesigned multi-step form includes:

- **Progress Indicator**: Visual step circles with numbers and checkmarks
- **Connector Lines**: Lines connecting steps showing progress (green for completed)
- **Active State Highlighting**: Current step is highlighted with blue color and pulsing effect
- **Completed Steps**: Show checkmark (✓) instead of numbers
- **Step Counter**: "Step X of Y" display at the bottom
- **Current Step Name**: Shows the current step title prominently
- **Smooth Transitions**: Animated transitions when moving between steps
- **Responsive Design**: Adapts to mobile screens with vertical layout

### Step Configuration

Each step should have:

- `name`: Unique identifier for the step
- `title` or `label`: Display text for the step indicator
- `description` (optional): Additional context shown under the title
- `fields`: Array of field names to include in this step
- `labels` (optional): Custom labels for navigation buttons
  - `next`: Label for the "Next" button
  - `previous`: Label for the "Back" button

### Features

- **Automatic navigation**: Previous/Next buttons are automatically shown
- **Visual progress**: Step indicators with numbers, connecting lines, and state colors
  - Gray: Upcoming steps
  - Blue: Current step (with glow effect)
  - Green: Completed steps (with checkmarks)
- **Optional**: If no steps are provided, form works as a single-step form
- **Field validation**: All fields are validated on final submission
- **Data persistence**: Form data is maintained across steps
- **Animations**: Smooth fade-in effects when switching steps
- **Mobile responsive**: Vertical layout on small screens

### Styling Steps

You can customize step styling through the `formClasses` prop:

```javascript
const formClasses = {
  formStep: "custom-step-class", // Class for each step indicator
  // The component automatically adds these classes:
  // - 'active' for current step
  // - 'completed' for finished steps
  // - 'upcoming' for future steps
};
```

### Dark Mode Support

The multi-step form automatically adapts to dark mode with appropriate color adjustments for better visibility.

## Tips

- Fields are automatically converted to camelCase labels (e.g., `first_name` → "First Name")
- Password fields are automatically masked
- The submit button shows a spinner during submission
- Forms automatically close modals after successful submission (unless `retainModal` is true)
- Use `currentData` prop for edit forms to pre-fill values
- Combine `@fieldChanged` with reactive fields for dynamic form behavior

## See Also

- [ShForm](./shform.md) - Manual form builder with more control
- [ShModalForm](./shmodalform.md) - Auto form in a modal
- [Form Components](../helpers/form-components.md) - Individual form input components
