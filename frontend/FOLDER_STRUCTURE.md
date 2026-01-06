# Frontend Folder Structure Guide

This document explains the organized folder structure of the AppliTrak frontend application.

## 📁 Directory Structure Overview

```
frontend/src/
├── assets/                     # Static assets (images, fonts, icons)
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── components/                 # Reusable UI components
│   ├── common/                 # Shared components across all roles
│   │   ├── Header/
│   │   │   ├── Header.jsx
│   │   │   ├── Header.css
│   │   │   └── index.js
│   │   ├── Footer/
│   │   │   ├── Footer.jsx
│   │   │   ├── Footer.css
│   │   │   └── index.js
│   │   └── index.js
│   ├── admin/                  # Admin-specific components
│   ├── employer/               # Employer-specific components
│   └── job-seeker/             # Job seeker-specific components
│
├── context/                    # React Context providers
│   └── AuthContext.jsx         # Authentication state management
│
├── data/                       # Static data and mock data
│   └── jobs.js                 # Sample job listings
│
├── hooks/                      # Custom React hooks
│   └── useSavedJobs.js         # Hook for saved jobs functionality
│
├── layouts/                    # Layout wrapper components
│   ├── MainLayout.jsx          # Default public layout (Header + Footer)
│   ├── MainLayout.css
│   ├── AuthLayout.jsx          # Clean layout for auth pages
│   ├── AuthLayout.css
│   ├── AdminLayout.jsx         # Admin dashboard layout with sidebar
│   ├── AdminLayout.css
│   ├── EmployerLayout.jsx      # Employer dashboard layout
│   ├── EmployerLayout.css
│   ├── JobSeekerLayout.jsx     # Job seeker dashboard layout
│   ├── JobSeekerLayout.css
│   └── index.js                # Barrel export
│
├── pages/                      # Page components organized by role
│   ├── common/                 # Public pages accessible by all
│   │   ├── Home/
│   │   │   ├── Home.jsx
│   │   │   ├── Home.css
│   │   │   └── index.js
│   │   ├── About/
│   │   ├── Contact/
│   │   ├── Company/
│   │   └── index.js
│   │
│   ├── auth/                   # Authentication pages
│   │   ├── Login/
│   │   │   ├── Login.jsx
│   │   │   ├── Login.css
│   │   │   └── index.js
│   │   ├── Register/
│   │   └── index.js
│   │
│   ├── admin/                  # Admin dashboard pages
│   │   ├── Dashboard/
│   │   ├── ManageUsers/
│   │   ├── Reports/
│   │   ├── Settings/
│   │   └── index.js
│   │
│   ├── employer/               # Employer dashboard pages
│   │   ├── Dashboard/
│   │   ├── PostJob/
│   │   │   ├── PostJob.jsx
│   │   │   ├── PostJob.css
│   │   │   ├── components/     # Step components
│   │   │   │   ├── Step1BasicInfo.jsx
│   │   │   │   ├── Step2JobDetails.jsx
│   │   │   │   ├── Step3Compensation.jsx
│   │   │   │   ├── Step4Education.jsx
│   │   │   │   └── Step5Preview.jsx
│   │   │   └── index.js
│   │   ├── ManageJobs/
│   │   ├── ViewApplications/
│   │   └── index.js
│   │
│   ├── job-seeker/             # Job seeker dashboard pages
│   │   ├── Dashboard/
│   │   ├── BrowseJobs/
│   │   ├── JobDetails/
│   │   ├── Applications/
│   │   ├── SavedJobs/
│   │   ├── JobAnalyzer/
│   │   ├── Profile/
│   │   └── index.js
│   │
│   └── index.js                # Main pages barrel export
│
├── routes/                     # Route configurations
│   ├── AdminRoutes.jsx         # Admin route definitions
│   ├── EmployerRoutes.jsx      # Employer route definitions
│   ├── JobSeekerRoutes.jsx     # Job seeker route definitions
│   ├── ProtectedRoute.jsx      # Auth-protected route wrapper
│   ├── PublicRoute.jsx         # Public route wrapper
│   └── index.js                # Barrel export
│
├── services/                   # API and external service integrations
│   └── jobsApi.js              # Job-related API calls
│
├── utils/                      # Utility functions
│   └── slug.js                 # URL slug utilities
│
├── App.jsx                     # Main application component
├── App.css                     # Global application styles
├── main.jsx                    # Application entry point
└── index.css                   # Global CSS variables and resets
```

## 🎯 Key Principles

### 1. **Colocated Files**
Each component/page has its own folder with:
- `ComponentName.jsx` - The React component
- `ComponentName.css` - Component-specific styles
- `index.js` - Barrel export for clean imports

### 2. **Role-Based Organization**
Pages and components are organized by user role:
- `common/` - Shared across all users
- `admin/` - Admin-only content
- `employer/` - Employer-only content
- `job-seeker/` - Job seeker-only content

### 3. **Barrel Exports**
Each folder has an `index.js` for clean imports:
```javascript
// Instead of:
import Dashboard from '../pages/admin/Dashboard/Dashboard';

// Use:
import Dashboard from '../pages/admin/Dashboard';
// or
import { Dashboard } from '../pages/admin';
```

### 4. **Layouts for Role-Specific UX**
Each user role has a dedicated layout:
- `MainLayout` - Public pages with header/footer
- `AuthLayout` - Clean centered layout for login/register
- `AdminLayout` - Admin sidebar with dark theme
- `EmployerLayout` - Employer sidebar with blue theme
- `JobSeekerLayout` - Job seeker sidebar with green theme

## 📝 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Header.jsx` |
| CSS Files | Match component | `Header.css` |
| Hooks | camelCase with "use" prefix | `useSavedJobs.js` |
| Utilities | camelCase | `slug.js` |
| Folders | kebab-case | `job-seeker/` |

## 🔗 Import Aliases

The project uses Vite's path alias `@/` pointing to `src/`:

```javascript
// Instead of:
import { useAuth } from '../../../context/AuthContext';

// Use:
import { useAuth } from '@/context/AuthContext';
```

## 🚀 Adding New Pages

### For a new admin page:

1. Create folder: `src/pages/admin/NewPage/`
2. Create files:
   - `NewPage.jsx`
   - `NewPage.css`
   - `index.js` (exports default)
3. Add export to `src/pages/admin/index.js`
4. Add route in `src/routes/AdminRoutes.jsx`

### Example:
```javascript
// src/pages/admin/NewPage/index.js
export { default } from './NewPage';

// src/pages/admin/index.js
export { default as NewPage } from './NewPage';

// src/routes/AdminRoutes.jsx
<Route path="new-page" element={<NewPage />} />
```

## 🎨 CSS Architecture

- **Global variables** defined in `index.css`
- **Component styles** colocated with components
- **BEM-like naming** for CSS classes
- **CSS variables** for theming:
  ```css
  --main-color: #3f6fb6;
  --black: #1a1a1a;
  --white: #ffffff;
  --light-bg: #f8f8f8;
  --light-color: #666;
  ```

## 🔒 Protected Routes

Use the route wrappers for access control:

```jsx
// Protected route requiring authentication
<Route element={<ProtectedRoute />}>
  <Route path="dashboard" element={<Dashboard />} />
</Route>

// Protected route requiring specific role
<Route element={<ProtectedRoute requiredRole="admin" />}>
  <Route path="settings" element={<Settings />} />
</Route>
```

## 📦 Migration Notes

When adding new features:
1. Follow the established folder structure
2. Create barrel exports for all new folders
3. Update route files as needed
4. Use layouts for consistent UX
5. Colocate styles with components
