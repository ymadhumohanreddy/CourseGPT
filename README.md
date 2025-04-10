[Live Demo → https://coursegptapp.vercel.app/](https://coursegptapp.vercel.app/)
# CourseGPT

CourseGPT is an AI-powered course authoring platform designed to streamline the creation, organization, and management of online learning content. It enables users to generate structured courses with AI-generated lessons, customizable modules, and rich content editing features.

---

## Features

### Course and Module Management
- Complete hierarchy: Courses contain Modules, which contain Lessons
- Drag-and-drop interface for reordering modules and lessons
- Full support for creating, editing, and deleting courses, modules, and lessons

### AI-Powered Content Generation
- Integrated with Google Gemini 1.5 Flash AI model
- Automatically generates lessons and assessments based on module topics
- Customizable parameters: content type, quantity, difficulty level, and context

### Rich Text Editing
- Built-in rich text editor for creating and formatting lesson content
- Support for headings, lists, links, and inline styling
- Real-time preview of lesson content

### User Authentication
- Supabase authentication integration
- Secure login and user-specific content access
- Protected routes for authorized users only

### Responsive Design
- Fully responsive layout
- Optimized for desktops, tablets, and mobile devices

### Auto-save Functionality
- Real-time auto-saving of content
- Toggle option for enabling/disabling auto-save
- Visual feedback to confirm saved changes

### Bulk Actions
- Multi-select functionality for modules and lessons
- Bulk deletion and batch operations for efficient content management

### Course Preview Mode
- Preview courses as end users will see them
- Switch between editing and preview modes with a single toggle

### Expandable/Collapsible Modules
- Collapse or expand modules for focused content editing
- Visual indicators for current module states

---

## Tech Stack

### Frontend
- **React** – Component-based frontend framework
- **TypeScript** – Type-safe JavaScript for improved development
- **Tailwind CSS** – Utility-first CSS framework for custom styling
- **Shadcn UI** – Component library built on Tailwind
- **React Router** – Client-side routing
- **React Query** – Data fetching and caching

### Backend
- **Supabase** – Backend-as-a-Service platform providing:
  - PostgreSQL database
  - Authentication system
  - Row-level security
  - Edge Functions for serverless backend logic

### AI Integration
- **Google Gemini 1.5 Flash** – For educational content generation
- **REST API** – Direct communication with Gemini API endpoints

### Development Tools
- **Vite** – Fast build tool and development server
- **ESLint** – Linting for code quality and consistency
- **Lucide React** – Icon library
- **Recharts** – Data visualization and interactive charts

### Additional Libraries
- **React Hook Form** – Form state management and validation
- **Zod** – Schema validation
- **React Markdown** – Rendering markdown content
- **React Beautiful DnD** – Drag-and-drop support
- **Sonner** – Toast notification system

### Deployment
- **Vercel** – Continuous deployment and hosting with fast global delivery

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account and project setup
- Google Gemini API Key

### Installation
```bash
git clone https://github.com/ymadhumohanreddy/CourseGPT.git
cd CourseGPT
npm install
```

### Environment Setup
Create a `.env.local` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Running Locally
```bash
npm run dev
```

---

## Contact

For questions, feature requests, or contributions, feel free to open an issue or reach out via [LinkedIn](https://www.linkedin.com/in/ymadhumohanreddy).
```
