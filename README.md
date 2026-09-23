```markdown
# Vendor Verification Workspace

A compliance-focused internal portal for onboarding, inspecting, and verifying vendor records using automated AI document processing, external registry cross-checking, and workflow management.

```

---

## Features

* **Vendor Management:** Full CRUD operations for vendor profiles with automated version tracking and audit history.
* **AI-Powered Document Extraction:** Uses **Google Gemini AI** (`gemini-3.6-flash`) to extract structured business details (Company Name, Tax ID, Bank Info, IFSC) from uploaded PDFs, images, and `.txt` documents.
* **Automated Mismatch Detection:** Automatically compares AI-extracted document metadata against saved vendor details to flag discrepancies (`ACTION_REQUIRED`).
* **External Registry Verification:** Integrates with an external MockAPI corporate registry (`/api/compaines/details`) to validate company existence and jurisdiction.
* **Task & Workflow Management:** Interactive stage tracking (`DRAFT` → `UNDER_REVIEW` → `ACTION_REQUIRED` → `APPROVED`/`REJECTED`) with automated action item generation for compliance teams.
* **Email Notifications:** Built-in email integration via **Resend** to send automated missing document requests directly to vendors.

---

## Tech Stack

### Frontend

* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS
* **HTTP Client:** Axios
* **Form Handling:** React Hook Form
* **UI Feedback:** React Hot Toast

### Backend

* **Runtime:** Node.js & Express.js
* **Database & ORM:** PostgreSQL & Prisma ORM
* **File Uploads:** Multer
* **AI Processing:** `@google/genai` (Gemini API)
* **Email Service:** Resend API
* **External Mock Registry:** MockAPI.io

---

## Getting Started

### Prerequisites

* **Node.js:** v18.x or higher
* **PostgreSQL:** Installed and running locally or via cloud DB (e.g., Supabase/Neon)
* **API Keys:** Google Gemini API Key & Resend API Key

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/khushramgaria/Vendor-Verification-Workspace.git
cd vendor-verification-workspace

```

---

### 2. Backend Setup

Navigate to the server directory:

```bash
cd server
npm install

```

Create a `.env` file in the `server` directory:

```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/vendor_verification_db?schema=public"
GEMINI_API_KEY="your_gemini_api_key_here"
RESEND_API_KEY="re_123456789_your_resend_key"
MOCK_API_ENDPOINT="[https://6ab4122f217e4365883196ae.mockapi.io/api/compaines/details](https://6ab4122f217e4365883196ae.mockapi.io/api/compaines/details)"

```

Run Prisma Database Migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate

```

Start the Backend Server:

```bash
npm run dev

```

---

### 3. Frontend Setup

Navigate to the client directory:

```bash
cd ../client
npm install

```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL="http://localhost:5000"

```

Start the Frontend Development Server:

```bash
npm run dev

```

---

## API Endpoints Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/vendors` | List all vendor records |
| `POST` | `/api/vendors` | Create a new vendor record |
| `GET` | `/api/vendors/:id` | Get vendor details and history |
| `POST` | `/api/documents/upload/:vendorId` | Upload document & trigger Gemini AI extraction |
| `POST` | `/api/documents/send-missing-email/:vendorId` | Send missing document request via Resend |
| `POST` | `/api/verification/external/:vendorId` | Verify company against MockAPI external registry |
| `PATCH` | `/api/verification/status/:vendorId` | Update workflow status (`APPROVED`, `REJECTED`, etc.) |
| `POST` | `/api/verification/tasks` | Create compliance action item task |
| `PATCH` | `/api/verification/tasks/:taskId/status` | Mark compliance task as `COMPLETED`/`PENDING` |

---

## Testing Workflow

1. **Clean Matching Verification (`VERIFIED`):**
* Create a vendor named `Murray Group` with Registration Number `(798) 866-3276 x159`.
* Upload a document containing `Murray Group` details.
* Run External Verification to confirm a `VERIFIED` status against the external registry.


2. **Mismatch Detection (`ACTION_REQUIRED`):**
* Create a vendor named `Upton Group`.
* Upload a document containing `Upton LLC`.
* The AI extractor will identify the string mismatch, set `mismatchFound: true`, and transition the workflow status to `ACTION_REQUIRED`.



```

```
