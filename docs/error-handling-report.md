# Error Handling Report

This report documents the multi-layered error handling strategy implemented in the SEES platform to ensure system stability and a clear user experience.

## 1. Server-Side Error Handling (Server Actions)
Our primary strategy for API-level operations follows a standardized functional pattern.

- **Standard Return Shape**: Instead of throwing raw errors that trigger global 500 pages, actions return a consistent object:
  ```typescript
  return { success: false, error: 'User-friendly message' };
  ```
- **Try-Catch Blocks**: Every mutation and data fetch within a Server Action is wrapped in a `try-catch` block.
- **Server Logging**: Caught errors are logged to the server console using `console.error` for developer debugging before returning the safe error object.
- **Zod Validation**: Input validation errors are caught via `safeParse` and returned as a flattened error object for client-side form mapping.

## 2. Client-Side Error Feedback
The frontend is designed to gracefully handle both expected business errors and unexpected system failures.

- **Toast Notifications**: We use **Sonner** for non-blocking feedback. 
  - On `success: true`, a success toast is shown.
  - On `success: false`, the specific error message from the server is displayed in an error toast.
- **Unexpected Failures**: Client-side `try-catch` blocks around server action calls handle network timeouts or infrastructure crashes:
  ```typescript
  try {
      const result = await someAction(data);
      if (!result.success) toast.error(result.error);
  } catch (error) {
      toast.error("An unexpected error occurred");
  }
  ```
- **Form Validation**: **React Hook Form** with **Zod Resolvers** prevents invalid data from reaching the server, providing immediate inline error messages.

## 3. Authentication Specifics (NextAuth)
Authentication errors follow a specialized flow due to the integration with Auth.js.

- **Credential Errors**: Invalid logins return a `null` user, which Auth.js converts into standard error strings (e.g., `CredentialsSignin`).
- **2FA Flow**: Specialized errors like `2FA_REQUIRED` and `INVALID_2FA_CODE` are thrown during the `authorize` callback and captured by the login page state to toggle the UI to the 2FA input view.

## 4. Audit & Security
- **Audit Logging of Failures**: Security-sensitive failures (like `AUTH_LOGIN_FAILED`) are recorded in the system audit log using `writeAuditLog`, capturing the reason and requester metadata (IP, User Agent).
- **Graceful DB Failures**: In scenarios where non-critical updates fail (like updating `last_login_date`), the error is caught and logged but does not block the user's primary workflow.

## 5. Summary of Best Practices
| Layer | Strategy | Tooling |
|-------|----------|---------|
| **API** | Functional Error Return | TypeScript Interfaces |
| **Input** | Schema-based rejection | Zod |
| **UI** | Passive & Active Alerts | Sonner & Shadcn Alerts |
| **Global** | Next.js Error Boundaries | `error.tsx` (selective) |
| **Logs** | Persistent Audit Trail | Custom Audit Service |
