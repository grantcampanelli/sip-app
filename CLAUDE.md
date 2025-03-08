# Sip App Development Guide

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack
- Next.js/React with TypeScript
- Prisma ORM with PostgreSQL
- NextAuth for authentication
- Mantine UI component library

## Code Style Guidelines
- **Imports**: Group imports by external libraries first, then internal components/utilities
- **Naming**: Use camelCase for variables/functions, PascalCase for components/interfaces
- **TypeScript**: Use proper type annotations, avoid `any` when possible
- **Error Handling**: Use try/catch blocks with appropriate error messages
- **Components**: Keep components focused on a single responsibility
- **API Routes**: Structure as HTTP method handlers with proper error responses
- **Database**: Use Prisma client for all database operations

## Git Workflow
- Create feature branches from main
- Use descriptive commit messages
- PR titles should clearly describe the change