# NIT Delhi – Club Management System

A Next.js 16 web app for managing NIT Delhi student clubs.

## Features
- Google OAuth login gated by MongoDB ClubAccess allowlist
- Club profile page: GS, DGS, Executives, Volunteers, Faculty Coordinators
- Edit mode — only the GS of a club can edit
- Photo upload for GS/DGS/Executive roles (stored in /public/Photos)
- Add/Edit/Delete members and teachers via modal forms

## Setup

### 1. Install dependencies
npm install

### 2. Configure environment variables
cp .env.local.example .env.local
# Fill in MONGODB_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL

### 3. Seed club access
# Edit scripts/seedClubAccess.js with your GS emails and club codes, then:
node scripts/seedClubAccess.js

### 4. Run
npm run dev
# Open http://localhost:3000

## How it works
1. Visit / → redirected to /login if not authenticated
2. Sign in with Google → NextAuth checks ClubAccess table
3. If allowed, land on /club?code=<clubCode>
4. If logged-in user's email matches a GS student record → Edit Club button appears
5. GS adds/edits/deletes members and teachers via modal forms

## API Routes
GET  /api/students?clubCode=tc   — list students
POST /api/students               — add student (multipart)
PUT  /api/students/:id           — update student
DEL  /api/students/:id           — remove student
GET  /api/teachers?clubCode=tc   — list teachers
POST /api/teachers               — add teacher (JSON)
PUT  /api/teachers/:id           — update teacher
DEL  /api/teachers/:id           — remove teacher
