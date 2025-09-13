# User Auth & Profile UML Diagrams

## 1. Component Diagram - System Architecture

This diagram shows the high-level components involved in the user authentication and profile management system.

```mermaid
graph TD
    subgraph "Frontend"
        LoginScreen[Login Screen]
        RegisterScreen[Register Screen]
        ProfileScreen[Profile Screen]
    end

    subgraph "Backend API"
        AuthRoutes[auth.routes.ts]
        UserRoutes[user.routes.ts]
        AuthMiddleware[auth.ts]
    end

    subgraph "Backend Logic"
        AuthController[auth.controller.ts]
        UserController[user.controller.ts]
    end

    subgraph "Database"
        PrismaClient[Prisma Client]
        UserTable[(User Table)]
    end

    LoginScreen --> AuthRoutes
    RegisterScreen --> AuthRoutes
    ProfileScreen --> UserRoutes

    AuthRoutes --> AuthController
    UserRoutes --> UserController
    UserRoutes -- uses --> AuthMiddleware

    AuthController --> PrismaClient
    UserController --> PrismaClient

    PrismaClient --> UserTable
```

## 2. Sequence Diagram - User Registration

This diagram illustrates the sequence of events when a new user registers.

```mermaid
sequenceDiagram
    participant Client as Frontend Client
    participant Server as Backend Server
    participant DB as Database

    Client->>Server: POST /api/auth/register (fullName, email, password)
    Server->>Server: Validate input data
    Server->>DB: Check if user with email exists
    DB-->>Server: User does not exist
    Server->>Server: Hash password
    Server->>DB: Create new User record
    DB-->>Server: New User created
    Server->>Server: Generate JWT Token
    Server-->>Client: 201 Created (JWT Token, User Info)
```

## 3. Sequence Diagram - User Login

This diagram illustrates the sequence of events when a user logs in.

```mermaid
sequenceDiagram
    participant Client as Frontend Client
    participant Server as Backend Server
    participant DB as Database

    Client->>Server: POST /api/auth/login (email, password)
    Server->>DB: Find user by email
    DB-->>Server: User record
    alt User Found
        Server->>Server: Compare hashed password
        alt Password Matches
            Server->>Server: Generate JWT Token
            Server-->>Client: 200 OK (JWT Token, User Info)
        else Password Mismatch
            Server-->>Client: 401 Unauthorized (Invalid credentials)
        end
    else User Not Found
        Server-->>Client: 401 Unauthorized (Invalid credentials)
    end
```

## 4. Sequence Diagram - User Profile Update

This diagram illustrates the sequence of events when a user updates their profile.

```mermaid
sequenceDiagram
    participant Client as Frontend Client
    participant Server as Backend Server
    participant DB as Database

    Client->>Server: PUT /api/users/profile (Update data) with Auth Token
    Server->>Server: Auth Middleware: Verify JWT Token
    alt Token Valid
        Server->>Server: Get user ID from token
        Server->>DB: Update user record for user ID
        DB-->>Server: Updated user record
        Server-->>Client: 200 OK (Updated User Info)
    else Token Invalid
        Server-->>Client: 401 Unauthorized
    end
```
