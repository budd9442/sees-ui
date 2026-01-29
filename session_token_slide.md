# Session & Token Handling
**Secure, Stateless Authentication with NextAuth.js**

---

## Architecture Overview

```mermaid
graph TB
    subgraph "Authentication Flow"
        A[User Login] --> B[Validate Credentials]
        B --> C[Generate JWT Token]
        C --> D[Sign with AUTH_SECRET]
        D --> E[Set HTTP-only Cookie]
        E --> F[Session Active]
    end
    
    subgraph "Request Flow"
        G[User Request] --> H[Read Cookie]
        H --> I[Verify JWT Signature]
        I --> J{Valid?}
        J -->|Yes| K[Decode Token]
        J -->|No| L[Reject - 401]
        K --> M[Extract user + role]
        M --> N[Authorize Request]
    end
    
    F -.->|Subsequent Requests| G
    
    style C fill:#4d96ff
    style E fill:#6bcf7f
    style I fill:#ffd93d
    style L fill:#ff6b6b
```

---

## Token Types in System

```mermaid
graph LR
    subgraph "Session JWT"
        A1[Purpose: Authentication]
        A2[Expiry: 30 days]
        A3[Storage: HTTP-only Cookie]
        A4[Reusable: Yes]
    end
    
    subgraph "Registration Token"
        B1[Purpose: User Onboarding]
        B2[Expiry: 7 days]
        B3[Storage: Database]
        B4[Single-use: Yes]
    end
    
    subgraph "Password Reset Token"
        C1[Purpose: Password Recovery]
        C2[Expiry: 7 days]
        C3[Storage: Database]
        C4[Single-use: Yes]
    end
    
    style A1 fill:#4d96ff
    style B1 fill:#6bcf7f
    style C1 fill:#ffa500
```

---

## JWT Payload Structure

```json
{
  "sub": "user_id",           // Subject (User ID)
  "role": "student",          // User role for RBAC
  "firstName": "John",        // User first name
  "lastName": "Doe",          // User last name
  "iat": 1706380800,          // Issued at timestamp
  "exp": 1708972800,          // Expiration timestamp
  "jti": "unique-token-id"    // JWT ID
}
```

---

## Security Features

| Feature | Implementation | Benefit |
|---------|----------------|---------|
| 🔒 **HTTP-only** | Cookie flag set | XSS attack prevention |
| 🛡️ **SameSite** | Cookie attribute | CSRF protection |
| ✍️ **Signed** | HMAC-SHA256 | Tampering detection |
| ⏱️ **Time-limited** | JWT expiration | Automatic invalidation |
| 🔐 **Secure** | HTTPS only | Man-in-the-middle protection |

---

## Complete Session Lifecycle

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant S as Server
    participant DB as Database
    
    Note over U,DB: Login Phase
    U->>B: Enter credentials
    B->>S: POST /api/auth/signin
    S->>DB: Validate user
    DB-->>S: User data + role
    S->>S: Generate JWT
    S->>S: Sign with AUTH_SECRET
    S->>B: Set HTTP-only cookie
    B-->>U: Redirect to dashboard
    
    Note over U,DB: Authenticated Request Phase
    U->>B: Access protected page
    B->>S: GET /dashboard (with cookie)
    S->>S: Verify JWT signature
    S->>S: Extract user + role
    S->>S: Check authorization
    S-->>B: Return protected content
    B-->>U: Display page
    
    Note over U,DB: Logout Phase
    U->>B: Click logout
    B->>S: POST /api/auth/signout
    S->>B: Clear cookie
    B-->>U: Redirect to login
```

---

## Token Generation Security

### Registration & Reset Tokens
```javascript
crypto.randomBytes(32).toString('hex')
// Generates: 256-bit entropy (64 hex characters)
// Example: "a3f5c8e9d2b1f4a7c6e8d9b2f1a4c7e6..."
```

### JWT Signing
```javascript
HMAC-SHA256(header + payload, AUTH_SECRET)
// Ensures token integrity and authenticity
```

---

## Benefits: JWT vs Traditional Sessions

```mermaid
graph TB
    subgraph "Traditional Sessions"
        T1[Database lookup per request]
        T2[Session store required]
        T3[Harder to scale]
        T4[Manual cleanup needed]
    end
    
    subgraph "JWT Sessions Our Approach"
        J1[No database needed ✅]
        J2[Stateless ✅]
        J3[Easy horizontal scaling ✅]
        J4[Auto-expires ✅]
    end
    
    T1 -.->|vs| J1
    T2 -.->|vs| J2
    T3 -.->|vs| J3
    T4 -.->|vs| J4
    
    style J1 fill:#6bcf7f
    style J2 fill:#6bcf7f
    style J3 fill:#6bcf7f
    style J4 fill:#6bcf7f
    style T1 fill:#ff6b6b
    style T2 fill:#ff6b6b
    style T3 fill:#ff6b6b
    style T4 fill:#ff6b6b
```

---

## Key Takeaways

> ✅ **Stateless Architecture**: No database lookups for session validation  
> ✅ **Industry Standard**: JWT with HTTP-only cookies  
> ✅ **Multi-layered Security**: XSS, CSRF, and tampering protection  
> ✅ **Scalable**: Horizontal scaling without session store  
> ✅ **Developer-friendly**: NextAuth.js handles complexity  

---

## Implementation Stack

- **Framework**: NextAuth.js v5 (Auth.js)
- **Token Format**: JWT (JSON Web Tokens)
- **Signing Algorithm**: HMAC-SHA256
- **Storage**: HTTP-only, Secure, SameSite cookies
- **Token Generation**: Node.js `crypto.randomBytes()`
