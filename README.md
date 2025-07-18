# PropMatch

**Smart, Simple Property Management for Residential Agents**

PropMatch is a modern property management application built with Next.js and Supabase, designed to help real estate agents efficiently organize, and manage their property listings.

## Features

-   **🏠 Property Management**: Create, edit, and organize property listings
-   **📸 Image Upload**: Multi-image upload with preview and management
-   **🔍 Search & Filter**: Search properties by title, location, or city
-   **⭐ Rating System**: 5-star rating system for properties
-   **🏷️ Tag Management**: Dynamic tagging system for property features
-   **👤 User Authentication**: Secure authentication with Supabase Auth
-   **📱 Responsive Design**: Mobile-first responsive interface
-   **🎯 Onboarding Flow**: Guided user onboarding experience

## Tech Stack

-   **Framework**: Next.js 15 with App Router
-   **Database**: Supabase (PostgreSQL)
-   **Authentication**: Supabase Auth
-   **Storage**: Supabase Storage for image uploads
-   **Styling**: Tailwind CSS + shadcn/ui components
-   **Forms**: React Hook Form with Zod validation
-   **State Management**: React hooks with optimized re-rendering
-   **Icons**: Lucide React
-   **Notifications**: Sonner toast system

## Getting Started

### Prerequisites

-   Node.js 18+
-   npm/yarn/pnpm
-   Supabase account

### Installation

1. **Clone the repository**

    ```bash
    git clone <your-repo-url>
    cd propmatch
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**

    Create a `.env.local` file in the root directory:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

    Get these values from your [Supabase project settings](https://supabase.com/dashboard/project/_/settings/api).

4. **Set up the database**

    Run the migrations in your Supabase SQL editor:

    ```bash
    # Copy and run the SQL files in order:
    # 1. supabase/migrations/202507172020.sql (schema)
    # 2. supabase/migrations/202507172024.sql (seed data)
    # 3. supabase/migrations/202507172025.sql (security policies)
    ```

5. **Set up Supabase Storage**

    Create a storage bucket named `property-images` in your Supabase dashboard:

    - Go to Storage → New Bucket
    - Name: `property-images`
    - Public: ✅ Enabled
    - File size limit: 50MB
    - Allowed file types: `image/jpeg,image/png,image/webp,image/gif`

6. **Run the development server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
propmatch/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   └── property-actions.ts   # Property CRUD & image upload logic
│   ├── auth/                     # Authentication pages
│   │   ├── login/               # Login page
│   │   ├── sign-up/             # Registration page
│   │   └── [other-auth-pages]/  # Password reset, etc.
│   ├── add-property/            # Add new property page
│   ├── edit-property/[id]/      # Edit existing property page
│   ├── onboarding/              # User onboarding flow
│   ├── protected/               # Protected route examples
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (Property Dashboard)
│   └── globals.css              # Global styles
│
├── components/                   # Reusable React components
│   ├── ui/                      # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   └── [other-ui-components]
│   ├── tutorial/                # Tutorial/help components
│   ├── property-dashboard.tsx   # Main dashboard component
│   ├── property-card.tsx        # Individual property display
│   ├── add-property-form.tsx    # Property creation form
│   ├── edit-property-form.tsx   # Property editing form
│   ├── onboarding-splash.tsx    # Splash screen component
│   ├── onboarding-steps.tsx     # Onboarding wizard
│   ├── auth-button.tsx          # Authentication controls
│   └── [other-components]
│
├── lib/                         # Utility libraries
│   ├── supabase/               # Supabase client configuration
│   │   ├── client.ts           # Client-side Supabase client
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── middleware.ts       # Supabase SSR middleware
│   └── utils.ts                # General utility functions
│
├── supabase/                    # Database schema & migrations
│   └── migrations/
│       ├── 202507172020.sql    # Database schema setup
│       ├── 202507172024.sql    # Seed data
│       └── 202507172025.sql    # Row Level Security policies
│
├── docs/                        # Project documentation
│   └── IMAGE_UPLOAD_SYSTEM.md  # Image upload system docs
│
├── middleware.ts                # Next.js middleware (auth + onboarding)
├── components.json              # shadcn/ui configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── next.config.ts               # Next.js configuration
└── package.json                 # Dependencies and scripts
```

## Architecture Overview

### Database Schema

-   **Property**: Main property listings with user ownership
-   **PropertyType**: Lookup table for property types (apartment, house, etc.)
-   **PropertyImage**: Image URLs linked to properties
-   **PropertyTag**: Tag system for property features
-   **Property_Tag_Join**: Many-to-many relationship for property tags

### Authentication Flow

1. **Onboarding**: First-time users see splash screen + guided steps
2. **Auth Routes**: Login/signup with Supabase Auth
3. **Protected Routes**: Middleware redirects unauthenticated users
4. **Row Level Security**: Database-level access control

### Property Management Flow

1. **Dashboard**: View and search existing properties
2. **Add Property**: Multi-step form with image upload
3. **Edit Property**: Update details and manage images
4. **Image Storage**: Supabase Storage with organized file structure

### Image Upload System

-   **Storage**: Organized in `property-images/{propertyId}/` folders
-   **Upload**: Sequential processing with error handling
-   **Cleanup**: Automatic deletion when properties are removed
-   **Security**: User ownership validation and file type restrictions

## Key Features

### Property Dashboard

-   Grid layout of property cards
-   Real-time search functionality
-   Add new property quick action
-   Loading states and empty state handling

### Property Forms

-   **React Hook Form**: Optimized performance with minimal re-renders
-   **Zod Validation**: Type-safe form validation
-   **Image Upload**: Multi-image support with preview
-   **Tag Management**: Dynamic tag addition/removal
-   **Star Rating**: Interactive 5-star rating system

### User Experience

-   **Mobile-First**: Responsive design for all screen sizes
-   **Toast Notifications**: User feedback for all actions
-   **Loading States**: Progress indicators for async operations
-   **Error Handling**: Graceful error recovery and user messaging

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
