# 🚀 Monthly Burn Deployment Guide

This guide provides full steps to deploy your application, safeguard your environment variables, and manage production changes.

## 1. Environment Variables Safeguarding

> [!IMPORTANT]
> **NEVER** commit your `.env` files to git. They are already in `.gitignore`, but ensure they stay that way.

### Backend Variables (`backend/.env`)
| Variable | Description | Production Value Example |
| :--- | :--- | :--- |
| `PORT` | The port the server runs on. | `10000` (Managed by host) |
| `MONGODB_URI` | Connection string for MongoDB. | `mongodb+srv://...` (MongoDB Atlas) |
| `GOOGLE_CLIENT_ID` | OAuth2 Client ID from Google Console. | `12345-abcde.apps.googleusercontent.com` |
| `JWT_SECRET` | A long, random string for signing tokens. | *Generate a random 64-char string* |
| `CORS_ORIGIN` | The URL of your deployed frontend. | `https://monthly-burn.vercel.app` |
| `NODE_ENV` | Set to `production` to enable security features. | `production` |

### Frontend Variables (`frontend/.env`)
| Variable | Description | Production Value Example |
| :--- | :--- | :--- |
| `VITE_GOOGLE_CLIENT_ID` | Same as backend Client ID. | `12345-abcde.apps.googleusercontent.com` |
| `VITE_API_URL` | The URL of your deployed backend. | `https://monthly-burn-api.onrender.com/api` |

---

## 2. Step-by-Step Deployment

### Step A: Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under "Network Access", add `0.0.0.0/0` (or specific IPs of your host).
3. Create a Database User and save the password.
4. Get your connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/monthly-burn`.

### Step B: Backend (e.g., Render or Railway)
1. Connect your GitHub repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. **CRITICAL:** Go to Environment Variables and add all variables listed in the table above.

### Step C: Frontend (e.g., Vercel)
1. Connect your GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Set **Build Command** to `npm run build`.
5. Set **Output Directory** to `dist`.
6. **CRITICAL:** Add `VITE_GOOGLE_CLIENT_ID` and `VITE_API_URL` in the Vercel dashboard.

---

## 3. Security Checklist
- [x] **CORS set?** Ensure `CORS_ORIGIN` in backend points to your Vercel URL.
- [x] **Mock Token disabled?** Setting `NODE_ENV=production` automatically disables the demo mock token.
- [x] **Rate Limiting?** Backend now limits to 100 requests every 15 mins per IP.
- [x] **Helmet?** Protection headers are automatically added.

## 4. How to Update
If you change code:
1. Push to GitHub.
2. Render/Vercel will automatically redeploy.
3. If you add a new environment variable, you **MUST** add it in the host's dashboard before pushing.
