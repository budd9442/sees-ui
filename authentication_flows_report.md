# Authentication Flows

Quick reference for authentication flows in the Student Enrollment & Evaluation System.

---

## 1. Login Flow

```mermaid
sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Email + Password
    System->>Database: Find user + relations
    System->>System: Verify password (bcrypt)
    System->>System: Determine role
    System->>Database: Update last_login
    System->>User: Set JWT cookie → Dashboard
```

**Key Points**:
- Password verification: `bcrypt.compare()`
- Role from database relations (staff/student)
- JWT stored in HTTP-only cookie
- File: `auth.ts`

---

## 2. Registration Flow

```mermaid
sequenceDiagram
    participant Admin
    participant System
    participant User
    
    Admin->>System: Create user
    System->>System: Generate token (32 bytes)
    System->>User: Email invitation link
    User->>System: Click link + set password
    System->>System: Hash password (bcrypt)
    System->>System: Mark token as used
```

**Key Points**:
- Token expiry: 7 days
- Single-use tokens
- Placeholder password until user sets real one
- File: `lib/actions/user-actions.ts`

---

## 3. Password Reset Flow

```mermaid
sequenceDiagram
    participant User
    participant System
    
    User->>System: Request reset (email)
    System->>System: Generate token
    System->>User: Email reset link
    User->>System: Click link + new password
    System->>System: Hash password + mark token used
```

**Key Points**:
- No email enumeration (same response for all)
- Token expiry: 7 days
- Single-use tokens
- File: `app/api/auth/reset-password/route.ts`

---

## 4. Session Management

**JWT Payload**:
```json
{
  "sub": "user_id",
  "role": "student|staff|admin",
  "firstName": "John",
  "lastName": "Doe",
  "exp": 1708972800
}
```

**Cookie Security**:
- `httpOnly: true` → XSS protection
- `secure: true` → HTTPS only
- `sameSite: 'lax'` → CSRF protection

**Flow**: Login → JWT signed → HTTP-only cookie → Verify on each request

---

## 5. Role Determination

```mermaid
flowchart TD
    A[User Login] --> B{staff_type?}
    B -->|ADMIN/REGISTRAR| C[admin]
    B -->|Other| D{Has staff?}
    D -->|Yes| E[staff]
    D -->|No| F{Has student?}
    F -->|Yes| G[student]
    F -->|No| H[student - default]
```

**Priority**: Admin → Staff → Student → Default (student)

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt (10 rounds) |
| Token Generation | crypto.randomBytes(32) |
| Session Storage | HTTP-only cookies |
| Token Expiry | 7 days |
| Single-use Tokens | Database flag |
| CSRF Protection | SameSite cookies |

---

## Recommendations

🔴 **High Priority**:
- Add rate limiting on auth endpoints
- Remove hardcoded admin email checks

🟡 **Medium Priority**:
- Account lockout after failed attempts
- Comprehensive audit logging

🟢 **Low Priority**:
- Password complexity requirements
- Session timeout on inactivity

