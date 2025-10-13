# DEDE E-Service Frontend

Frontend application for the DEDE E-Service system built with Next.js, React, and TypeScript.

## Features

- User authentication and authorization
- Dashboard with statistics and recent activities
- License request management
- Inspection management
- Audit report management
- Notification system
- User profile management
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Configure the API URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── providers.tsx      # React providers
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   ├── licenses/         # License components
│   ├── inspections/      # Inspection components
│   ├── audits/           # Audit components
│   └── notifications/    # Notification components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── api.ts            # API client
│   └── auth.ts           # Authentication service
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Form Handling**: React Hook Form
- **Icons**: Heroicons
- **HTTP Client**: Axios

## Environment Variables

- `NEXT_PUBLIC_API_URL`: URL of the backend API server
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_VERSION`: Application version
- `NODE_ENV`: Environment (development/production)

## Authentication

The application uses JWT-based authentication. Tokens are stored in localStorage and automatically included in API requests.

## API Integration

All API requests are handled through the centralized API client in `src/lib/api.ts`. The client includes:

- Automatic token injection
- Response interceptors for error handling
- File upload support
- Type-safe requests and responses

## Responsive Design

The application is fully responsive and works on desktop, tablet, and mobile devices. The layout uses a combination of:

- Tailwind CSS responsive utilities
- Mobile-first design approach
- Adaptive navigation (sidebar on desktop, drawer on mobile)

## Deployment

The application can be deployed to any platform that supports Next.js, such as:

- Vercel (recommended)
- Netlify
- AWS Amplify
- Docker containers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.