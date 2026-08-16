# SAMADHAN Governance Intelligence Platform

This is the frontend application for **SAMADHAN**, a civic engagement and governance intelligence platform. It is a React-based web application designed to connect citizens with government officials (MLAs, MPs, Collectors) to report, track, and resolve local civic issues. The platform features a role-based access system, real-time updates via WebSockets, and a modern, dark-themed user interface.

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Backend Integration](#backend-integration)
- [How to Run](#how-to-run)
- [Application Architecture](#application-architecture)
  - [Routing and Authentication](#routing-and-authentication)
  - [State Management](#state-management)
  - [API Service](#api-service)
- [Features](#features)
  - [Citizen Portal](#citizen-portal)
  - [Official Portal (MLA/MP/Collector)](#official-portal-mlampcollector)
  - [Shared Components](#shared-components)
- [Styling and Theme](#styling-and-theme)
- [How to Contribute](#how-to-contribute)
- [Contributing Guide](#contributing-guide)

## Project Overview

The SAMADHAN platform aims to streamline civic grievance redressal. It allows citizens to file reports, which are then intelligently routed to the appropriate government officials. Officials can manage these complaints, track their resolution status, and gain insights through analytics dashboards. The application is built with a focus on a premium user experience, featuring a dark, cyber-themed aesthetic with real-time data updates.

## Technology Stack

This project is built using the following technologies:

- **React 19**: A JavaScript library for building user interfaces.
- **Vite**: A next-generation frontend build tool that provides a faster and leaner development experience.
- **React Router v7**: For handling client-side routing and navigation within the application.
- **Leaflet & React-Leaflet**: Open-source JavaScript libraries for mobile-friendly interactive maps, used for displaying complaint locations.
- **Lucide React**: A collection of simple, consistent, and beautiful icons.
- **WebSockets**: For real-time communication, enabling live map updates and instant notifications.
- **CSS3**: Custom, modular stylesheets for a premium dark-themed UI without external UI frameworks like Bootstrap or Tailwind.

## Project Structure

The project follows a standard Vite and React structure. Here's an overview of the key directories and files:

```
H2K/
├── public/                  # Static assets like favicon and icons
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/              # Images and static assets used in components
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/          # Reusable UI components (Layouts, Map, Notifications, etc.)
│   │   ├── CitizenLayout.jsx
│   │   ├── MlaLayout.jsx
│   │   ├── MpLayout.jsx
│   │   ├── OfficialLayout.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── Toast.jsx
│   │   └── map/
│   │       └── LiveMap.jsx
│   ├── data/                # Static data or mock data for development
│   │   └── mockComplaints.js
│   ├── pages/               # Page-level components corresponding to routes
│   │   ├── Portal.jsx
│   │   ├── CitizenLogin.jsx
│   │   ├── OfficialLogin.jsx
│   │   ├── CitizenHome.jsx
│   │   ├── CitizenReport.jsx
│   │   ├── CitizenIssues.jsx
│   │   ├── CitizenAnalytics.jsx
│   │   ├── CitizenProfile.jsx
│   │   ├── OfficialDashboard.jsx
│   │   ├── OfficialProfile.jsx
│   │   ├── Analytics.jsx
│   │   ├── Escalations.jsx
│   │   ├── Constituency.jsx
│   │   ├── ComplaintDetail.jsx
│   │   ├── MlaDashboard.jsx
│   │   ├── MpDashboard.jsx
│   │   ├── MpOverview.jsx
│   │   ├── MpPriorityRanker.jsx
│   │   ├── MpMlaScoreboard.jsx
│   │   └── NotFound.jsx
│   ├── services/            # Core logic for API calls and authentication
│   │   ├── api.js
│   │   └── authGuard.jsx
│   ├── App.css              # Main application styles
│   ├── App.jsx              # Root component with routing configuration
│   ├── index.css            # Global styles, CSS variables, and base reset
│   └── main.jsx             # Entry point for the React application
├── index.html               # Main HTML file
├── package.json             # Project metadata and dependencies
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## Getting Started

Follow these instructions to get the project running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.x or higher recommended)
- **npm** (usually comes with Node.js) or **yarn**
- **Git**

### Installation

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <your-repository-url>
    cd H2K #(the folder you have full codebase)
    ```

2.  **Install dependencies**:
    Open your terminal in the project's root directory and run:
    ```bash
    npm install
    # or
    yarn install
    ```

This will download all the necessary packages listed in `package.json`.

## Backend Integration

This frontend application is designed to work with a backend API. The API base URL is configured in `src/services/api.js`.

- **Local Development**: By default, the application expects the backend to be running locally on `http://localhost:8000`. It will automatically connect to this address when you access the site via `localhost` or `127.0.0.1`.
- **Production/Deployment**: When deployed, it connects to the same origin (`/api`) or a specific URL set via an environment variable.

Ensure your backend server is running before you try to log in or file a complaint. The backend handles:
- User authentication (Citizen via OTP, Officials via password)
- Storing and retrieving complaints
- Real-time updates via WebSockets (`ws://localhost:8000/ws`)
- Citizen profiles and reward points

## How to Run
First run and connect backend
Backend:
```bash
cd backend
```

after that run 
```bash
python main.py
```
this will connet the backend
(mongodb)

To start the development server, run the following command in your terminal:
#(In the folder you have full codebase)
```bash
npm run dev #(In the folder you have full codebase)
# or
yarn dev
```

This will start the Vite development server, usually accessible at `http://localhost:5173` (or another port if 5173 is in use). It features Hot Module Replacement (HMR), meaning any changes you make to the code will be instantly reflected in the browser.

Other available commands:
- **`npm run build`**: Builds the application for production. The output will be in the `dist/` folder.
- **`npm run preview`**: Serves the production build locally for testing.
- **`npm run lint`**: Runs `oxlint` to check for linting errors in your JavaScript and JSX files.

## Application Architecture

### Routing and Authentication

The application's routing is managed in `src/App.jsx` using `react-router-dom`.

- **AuthGuard**: The `AuthGuard` component (`src/services/authGuard.jsx`) is a crucial part of the architecture. It protects certain routes based on the user's role. It checks `localStorage` for a `user_token` and `user_role`.
  - If a user人在用户未登录时尝试访问受保护页面，会被重定向到主门户 (`/`).
  - If a user with an incorrect role tries to access a restricted page (e.g., a `CITIZEN` trying to access an `MLA` dashboard), they are redirected to their appropriate default landing page.
- **Role-Based Routes**: The routes are grouped by user type mama (Citizen, Official, MLA, MP), with each group wrapped in its respective `Layout` component.

### State Management

The application uses a combination of **React's built-in state management** (`useState`, `useEffect`) and **localStorage** for handling data.

- **Component State**: Individual components (like `CitizenIssues`, `MlaDashboard`) manage their own data (e.g., lists of complaints, loading states) using `useState` and `useEffect`. Data is typically fetched from the backend when a component mounts.
- **Global State (Context)**: The `ToastProvider` in `src/components/Toast.jsx` uses React Context to provide a `showToast` function globally, allowing any component to trigger a notification without passing props down the tree.
- **Persistent State**: Authentication tokens and basic user info (name, id, role) are stored in the browser's `localStorage`. This allows the user to remain logged in after refreshing the page.

### API Service

All API calls are centralized in `src/services/api.js`.

- **`authFetch`**: A wrapper around the native `fetch` API that automatically includes the `Authorization` header with the bearer token from `localStorage`.
- **`BASE_URL`**: The API endpoint is dynamically determined. It looks for an environment variable `VITE_API_URL` first, then defaults to `localhost` for development.
- **`WS_URL`**: Similarly, the WebSocket URL is determined for real-time features.
- **Modular Functions**: The `api` object contains functions for all backend operations, such as `citizenRequestOtp`, `officialLogin`, `getComplaints`, `createComplaint`, etc. This makes it easy to manage and update API endpoints in one place.

## Features

### Citizen Portal

Designed for citizens to interact with the government.

- **Citizen Login (`/login/citizen`)**: A secure login using a phone number and a One-Time Password (OTP).
- **Home (`/citizen/home`)**: A personalized dashboard showing the citizen's activity, reward points, and a feed of recent issues in their ward.
- **File Report (`/citizen/file-report`)**: A page with a voice-to-text module for easily describing issues. It also captures geolocation automatically.
- **My Issues (`/citizen/issues`)**: A detailed view of all complaints filed by the logged-in citizen. They can view the status, AI diagnostic, and verify resolutions.
- **Analytics (`/citizen/analytics`)**: A dashboard showing personal impact metrics, resolution rates, and a breakdown of ward-level grievances.
- **Profile (`/citizen/profile`)**: Allows citizens to view and edit their personal information, ward, and geotagged location.

### Official Portal (MLA/MP/Collector)

Designed for government officials to manage and resolve complaints.

- **Official Login (`/login/official`)**: A login system for government officials (MLA, MP, Collector, Ministry) using email and password. Includes a sign-up flow.
- **Main Dashboard (`/official/dashboard`)**: A command center for officials showing key stats (total issues, resolved, pending, critical) and an queue of urgent incidents.
- **Constituency Map (`/official/constituency`)**: An interactive map using Leaflet that displays the geographic location of all active complaints. Clicking a pin shows details and allows officials to take action.
- **Escalations (`/official/escalations`)**: A dedicated view for tracking complaints that have been automatically escalated due to inaction.
- **Analytics (`/official/analytics`)**: Shows AI-recommended development projects based on complaint clustering, allowing officials to authorize DPRs (Detailed Project Reports).
- **MLA Dashboard (`/mla/dashboard`)** & **MP Dashboard (`/mp/dashboard`)**: Specialized dashboards for MLAs and MPs, respectively. The MP dashboard includes a high-level overview, a priority ranker for projects, and an accountability scoreboard for MLAs.
- **Complaint Detail (`/official/complaint/:id`)**: A deep-dive view into a single complaint, showing all evidence, AI diagnostics, citizen profile, and a timeline of events. Officials can change the status or submit a resolution here.

### Shared Components

Reusable components that are used across multiple pages.

- **Layouts (`*Layout.jsx`)**: Each user role has a dedicated layout with a sidebar for navigation and a top bar for notifications and user actions. This provides a consistent user experience across the application.
- **Live Map (`LiveMap.jsx`)** & **Constituency Map**: These components are used in the Official and MP portals to provide a real-time, geographic view of complaints. They use WebSockets to listen for new or updated complaints and reflect them on the map instantly.
- **Notification Bell (`NotificationBell.jsx`)**: Present in the top bar of all official layouts, it connects to a WebSocket to provide real-time alerts for events like new complaints, status changes, or escalation sweeps.
- **Toast (`Toast.jsx`)**: A global notification system used to provide user feedback for actions (e.g., "Complaint filed successfully!", "Login failed.").

## Styling and Theme

The application features a custom, premium dark theme.

- **CSS Variables**: Global colors, fonts, and spacing are defined as CSS custom properties (variables) in `src/index.css` and are used throughout the application for consistency.
- **Modular Styles**: Each major component and page has its own dedicated `.css` file (e.g., `CitizenHome.css`), which keeps the styles organized and easy to manage.
- **Fonts**: The primary font family is `'Inter'`, with `'Space Grotesk'` used for headings and `'Space Mono'` used for data, labels, and monospaced elements to give a technical, dashboard-like feel.
- **Responsive Design**: Media queries are included in `src/index.css` and some component-specific styles to ensure a decent experience on smaller screens, though the primary focus is on desktop/tablet dashboards.

## How to Contribute

We welcome contributions! To keep the codebase clean and consistent, please follow these steps:

1.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name`
2.  **Make your changes** in the new branch.
3.  **Run the linter** before committing: `npm run lint`
4.  **Commit your changes** with a clear and descriptive message.
5.  **Push your branch** to the repository: `git push origin feature/your-feature-name`
6.  **Open a Pull Request** for review.

## Contributing Guide

When contributing, collaborators should familiarize themselves with the application's flow and key components.

- **Adding a new route**: If you are adding a new page, ensure you add the route in `src/App.jsx` and wrap it in the appropriate `AuthGuard` and `Layout` components.
- **Connecting to the API**: Always use the `api` service from `src/services/api.js` for any backend communication. Avoid using `fetch` directly in components.
- **Adding new styles**: Prefer adding styles to the existing component-specific `.css` files. If a style is global, add it to `src/index.css`. Please stick to the existing color palette and font families to maintain the UI's consistency.
- **Using the Toast System**: For any user-facing feedback, use the `useToast` hook from `src/components/Toast.jsx` to show success, error, or info messages.

---

**Built with passion by the H2K team.**
