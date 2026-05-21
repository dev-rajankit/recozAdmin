# Recoz Library Admin

This is a Next.js dashboard application for managing a small library, co-working space, or any membership-based business.

It provides functionality for tracking members, their payment status, and logging business expenses.

## Getting Started

To run this project locally, you will need to have Node.js and npm installed.

### 1. Set Up Environment Variables

This project requires a connection to a MongoDB database.

1.  Create a copy of the example environment file. In your terminal, run:
    ```bash
    cp .env.example .env
    ```
2.  Open the newly created `.env` file in your editor.
3.  Add your full MongoDB connection string as the value for `MONGO_URI`. It should look like this:
    ```
    MONGO_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority"
    ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Tech Stack

*   **Framework:** Next.js (with App Router)
*   **Styling:** Tailwind CSS
*   **UI Components:** ShadCN
*   **Database:** MongoDB with Mongoose
*   **Authentication:** Custom email/password auth
