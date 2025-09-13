Based on the information from the README.md file and the project structure, here are the files involved in user authentication and profile management:

- berse-app-backend\prisma\schema.prisma: 
    This file defines the User model for the database, which includes all the fields related to a user's profile, authentication, and settings.
- berse-app-backend\src\routes\auth.routes.ts: 
    This file likely defines the API routes for authentication, such as /login and /register.
- berse-app-backend\src\routes\user.routes.ts: 
    This file likely defines the API routes for user profile management, such as getting or updating a user's profile.
- berse-app-backend\src\controllers\auth.controller.ts: 
    This file likely contains the business logic for user authentication, handling the registration and login processes.
- berse-app-backend\src\controllers\user.controller.ts: 
    This file likely contains the business logic for managing user profiles, such as retrieving or updating profile information.
- berse-app-backend\src\middleware\auth.ts: 
    This file is likely a middleware that verifies the user's authentication status, probably by checking for a valid JWT token, before allowing access to protected routes.