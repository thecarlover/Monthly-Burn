---
description: How to deploy the application to production
---

1. Build the frontend
// turbo
cd frontend && npm run build

2. Ensure your backend is ready for production by setting the following environment variables on your host:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `CORS_ORIGIN` (Your production frontend URL)

3. Deploy the backend
Push the `backend` folder to your choice of Node.js hosting (e.g., Render, Railway).

4. Deploy the frontend
Upload the `frontend/dist` folder or connect your repo to Vercel/Netlify pointing to the `frontend` directory.
