# CGPC Placement CRM

A college placement management CRM built with **React, TypeScript, Vite, and Supabase**.

The application manages placement-related CRM data such as companies, contacts, deals/pipeline, tasks, follow-ups, activities, and other placement workflows.

> **Architecture:** React/Vite → Supabase Client → Supabase REST/Auth/Edge Functions → PostgreSQL

GitHub is used for source control. Local development uses a local Supabase instance.

---

## Tech Stack

* React 19
* TypeScript
* Vite
* Supabase
* PostgreSQL
* React Router
* React Query
* React Admin (`ra-core`)
* `ra-supabase-core`
* Tailwind CSS
* Lucide React
* Vitest

Important files:

```text
src/
├── App.tsx
├── components/
│   ├── atomic-crm/
│   │   ├── root/
│   │   ├── providers/
│   │   └── ...
│   ├── admin/
│   └── supabase/
│
supabase/
├── config.toml
├── migrations/
└── functions/
```

---

# 1. Requirements

Install:

* Node.js 22 LTS
* npm
* Git
* Docker-compatible container runtime
* Supabase CLI

Check:

```bash
node --version
npm --version
git --version
npx supabase --version
```

---

# 2. Clone the Repository

```bash
git clone https://github.com/abhi-s-aji/CGPC.git
cd CGPC
```

Install dependencies:

```bash
npm install
```

---

# 3. Local Supabase

This project is designed to run against a local Supabase instance during development.

Start Supabase:

```bash
npx supabase start
```

Check the services:

```bash
npx supabase status
```

Important local services:

| Service         | URL                    |
| --------------- | ---------------------- |
| Frontend        | http://localhost:5173  |
| Supabase API    | http://127.0.0.1:54321 |
| PostgreSQL      | localhost:54322        |
| Supabase Studio | http://localhost:54323 |
| Local email     | http://localhost:54324 |

Open Supabase Studio:

```text
http://localhost:54323
```

Apply database migrations when required:

```bash
npx supabase db push
```

> The repository currently contains Supabase migrations under `supabase/migrations`.

Stop Supabase:

```bash
npx supabase stop
```

---

# 4. Environment Variables

The frontend requires the Supabase URL and publishable key.

Create your local environment file according to the project's existing Vite configuration.

Example:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SB_PUBLISHABLE_KEY=YOUR_LOCAL_SUPABASE_PUBLISHABLE_KEY
```

Get the local keys from:

```bash
npx supabase status
```

Do **not** put these in the repository:

```text
.env
.env.*
SUPABASE_SERVICE_ROLE_KEY
```

The service-role key must never be placed in browser/frontend code.

---

# 5. Start the Application

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Build the application:

```bash
npm run build
```

---

# 6. Authentication

Authentication is handled by Supabase Auth.

Main implementation:

```text
src/components/atomic-crm/providers/supabase/authProvider.ts
src/components/atomic-crm/providers/supabase/supabase.ts
```

Authentication pages:

```text
src/components/atomic-crm/login/StartPage.tsx
src/components/supabase/forgot-password-page.tsx
src/components/supabase/set-password-page.tsx
src/components/supabase/oauth-consent-page.tsx
```

Supported flows include:

* Login
* Signup
* Logout
* Password reset
* Session handling
* OAuth consent
* Admin/user access control

Local authentication confirmation is disabled in the current Supabase configuration.

After starting the application, create/use a local account through the application's authentication flow.

---

# 7. Data Architecture

The application does **not** use a traditional Node/Express backend.

Most CRM data is accessed directly through the Supabase JavaScript client.

Main data layer:

```text
src/components/atomic-crm/providers/supabase/dataProvider.ts
```

Supabase client:

```text
src/components/atomic-crm/providers/supabase/supabase.ts
```

Authentication provider:

```text
src/components/atomic-crm/providers/supabase/authProvider.ts
```

The general flow is:

```text
React Component
      ↓
React Admin / Data Provider
      ↓
Supabase JavaScript Client
      ↓
Supabase REST API
      ↓
PostgreSQL
```

Some operations use Supabase Edge Functions:

```text
React
 ↓
Supabase Client
 ↓
Edge Function
 ↓
PostgreSQL / Supabase services
```

---

# 8. API Architecture

## Important

There is currently **no custom `/api` backend** such as:

```text
/api/v1/companies
/api/v1/tasks
/api/v1/calendar
```

and there is no separate Express/Fastify/Node API server.

The actual API layer is Supabase.

The frontend communicates with Supabase using:

```text
REST API
Auth API
Storage API
Edge Functions
```

---

# 9. Supabase API

The local Supabase API is:

```text
http://127.0.0.1:54321
```

Supabase automatically exposes database REST endpoints.

For example, conceptually:

```text
GET    /rest/v1/companies
POST   /rest/v1/companies
PATCH  /rest/v1/companies?id=eq.<id>
DELETE /rest/v1/companies?id=eq.<id>
```

The exact available tables and permissions are determined by the current PostgreSQL schema and RLS policies.

The frontend normally does not manually construct these URLs. It uses:

```ts
supabase.from("table_name")
```

For example:

```ts
const { data, error } = await supabase
  .from("companies")
  .select("*");
```

The implementation can be found primarily in:

```text
src/components/atomic-crm/providers/supabase/dataProvider.ts
```

---

# 10. Authentication API

Supabase Auth provides the authentication endpoints.

The application uses the Supabase JavaScript client instead of manually implementing authentication HTTP requests.

Example:

```ts
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

The client manages the authentication session and JWT.

For another application, the normal architecture is:

```text
Admin App
   ↓
Supabase Client
   ↓
Supabase Auth
   ↓
Authenticated Session/JWT
   ↓
Supabase Database
```

---

# 11. Edge Functions

Supabase Edge Functions are located at:

```text
supabase/functions/
```

The repository contains functions including:

```text
users
postmark
update_password
delete_note_attachments
merge_contacts
mcp
```

One confirmed frontend invocation is:

```text
POST /functions/v1/users
```

The frontend calls it through:

```ts
supabase.functions.invoke("users", ...)
```

Implementation/caller:

```text
src/components/atomic-crm/providers/supabase/dataProvider.ts
```

For local Supabase, the equivalent base URL is:

```text
http://127.0.0.1:54321
```

Therefore an Edge Function is accessed through:

```text
http://127.0.0.1:54321/functions/v1/<function-name>
```

Do not assume every function accepts the same request body. Check its implementation under:

```text
supabase/functions/<function-name>/
```

---

# 12. Connecting Another Application

If a separate Admin application needs to work with this CRM, there are currently two approaches.

## Recommended current approach

Connect the Admin application directly to the same Supabase project.

Install:

```bash
npm install @supabase/supabase-js
```

Create the client:

```ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SB_PUBLISHABLE_KEY
);
```

Then authenticate:

```ts
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

Then access permitted data:

```ts
const { data, error } = await supabase
  .from("companies")
  .select("*");
```

The Admin application must obey the same authentication and RLS rules as the CRM.

### Important

Do **not** put:

```text
SUPABASE_SERVICE_ROLE_KEY
```

in the Admin application's frontend.

The service-role key is privileged and must remain server-side.

---

# 13. If a Real REST API Is Required

If the architecture eventually requires:

```text
Admin App
      ↓
CGPC API
      ↓
Supabase
```

then a dedicated API layer should be added.

For example:

```text
/api/v1/companies
/api/v1/contacts
/api/v1/tasks
/api/v1/followups
/api/v1/calendar
/api/v1/placement-drives
```

That API could handle:

```text
Authentication
Authorization
Validation
Business rules
Database operations
Audit logging
```

The current repository does **not** implement this custom API layer, so these endpoints should not be documented as existing APIs until they are actually implemented.

---

# 14. Local API Testing

First start Supabase:

```bash
npx supabase start
```

Then start the application:

```bash
npm run dev
```

Check Supabase:

```bash
npx supabase status
```

Open Studio:

```text
http://localhost:54323
```

You can inspect:

* Tables
* Rows
* Authentication
* Storage
* Database policies
* Functions

For direct REST testing, use the local API:

```text
http://127.0.0.1:54321/rest/v1/
```

Authenticated database requests require the appropriate Supabase authentication/public key headers.

The easiest way to verify the application's real requests is to use the browser's:

```text
Developer Tools → Network
```

and inspect requests generated by the application.

---

# 15. Functional Test Checklist

After starting the project, verify:

```text
[ ] Supabase starts successfully
[ ] Frontend opens on port 5173
[ ] User can sign up/login
[ ] Session survives page refresh
[ ] User can logout
[ ] Companies load/create/edit correctly
[ ] Contacts load/create/edit correctly
[ ] Pipeline loads correctly
[ ] Tasks work
[ ] Follow-ups work
[ ] Calendar works
[ ] Activities are recorded
[ ] Placement workflows work
[ ] Search works
[ ] Filters work
[ ] Dashboard loads
[ ] Data remains after browser refresh
[ ] Database changes appear in Supabase Studio
```

For CRM synchronization, test the same record from multiple relevant screens.

For example:

```text
Create record
    ↓
Check database
    ↓
Check related CRM page
    ↓
Refresh browser
    ↓
Confirm data still exists
```

---

# 16. Useful Commands

Start everything:

```bash
npx supabase start
npm run dev
```

Check Supabase:

```bash
npx supabase status
```

Apply migrations:

```bash
npx supabase db push
```

Build:

```bash
npm run build
```

Stop Supabase:

```bash
npx supabase stop
```

Check Git:

```bash
git status
```

---

# 17. Development Workflow

Create a branch:

```bash
git checkout -b feature/my-change
```

Make changes and test locally:

```bash
npm run dev
npm run build
```

Check changes:

```bash
git status
git diff
```

Commit:

```bash
git add .
git commit -m "feat: describe change"
```

Push:

```bash
git push origin feature/my-change
```

Never commit:

```text
.env*
service-role keys
private credentials
local secrets
```

---

# 18. Important Files

| Purpose                | File                                                           |
| ---------------------- | -------------------------------------------------------------- |
| Application entry      | `src/App.tsx`                                                  |
| CRM root               | `src/components/atomic-crm/root/CRM.tsx`                       |
| Supabase client        | `src/components/atomic-crm/providers/supabase/supabase.ts`     |
| Authentication         | `src/components/atomic-crm/providers/supabase/authProvider.ts` |
| Data provider          | `src/components/atomic-crm/providers/supabase/dataProvider.ts` |
| Access control         | `src/components/atomic-crm/providers/commons/canAccess.ts`     |
| Login                  | `src/components/atomic-crm/login/StartPage.tsx`                |
| Supabase configuration | `supabase/config.toml`                                         |
| Database migrations    | `supabase/migrations/`                                         |
| Edge Functions         | `supabase/functions/`                                          |

---

# 19. Security

The frontend uses a Supabase publishable key.

That key is **not equivalent to a service-role key**.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

in:

* React code
* Vite environment variables prefixed with `VITE_`
* GitHub
* Browser DevTools
* Public documentation

Database access must remain protected by Supabase Auth and Row Level Security.

---

# 20. Current API Limitation

The current project is **Supabase-backed rather than API-server-backed**.

Therefore:

```text
There is no custom CGPC REST API server currently implemented.
```

Most data operations are:

```text
React
 ↓
Supabase JavaScript Client
 ↓
Supabase REST/Postgres
```

and some operations use:

```text
React
 ↓
Supabase Edge Function
```

If the project later requires a dedicated Admin API, implement a versioned API layer instead of assuming that `/api/v1/...` endpoints already exist.

---

## Quick Start

For an experienced developer:

```bash
git clone https://github.com/abhi-s-aji/CGPC.git
cd CGPC

npm install

npx supabase start
npx supabase db push

npm run dev
```

Then open:

```text
http://localhost:5173
```

Supabase Studio:

```text
http://localhost:54323
```

Local Supabase API:

```text
http://127.0.0.1:54321
```

This is the complete local development stack.
