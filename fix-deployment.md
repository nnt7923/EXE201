# Fix Deployment Issue - Frontend & Backend Configuration

## Problem Identified
1. ✅ **FIXED**: Frontend was trying to connect to `localhost:5000` instead of production API
2. ❌ **CURRENT**: Backend returning "Internal Server Error" (HTTP 500)

## Root Causes
1. ✅ **FIXED**: Missing `NEXT_PUBLIC_API_URL` environment variable in frontend
2. ❌ **CURRENT**: Missing critical environment variables in backend service, especially `MONGODB_URI`

## Solution Applied
Updated the CORS configuration in `api/server.js` to:
1. Explicitly allow the production frontend domain: `https://an-gi-o-dau-frontend-64eh.onrender.com`
2. Handle preflight OPTIONS requests properly
3. Include proper headers and methods
4. Support credentials for authenticated requests

## Steps to Redeploy

### Option 1: Automatic Redeploy (Recommended)
If your Render service is connected to GitHub:
1. Commit and push the changes:
   ```bash
   git add .
   git commit -m "Fix CORS configuration for production deployment"
   git push origin main
   ```
2. Render will automatically redeploy the API service

### Option 2: Manual Redeploy
1. Go to your Render dashboard: https://dashboard.render.com
2. Find your API service: `an-gi-o-dau-api-64eh`
3. Click "Manual Deploy" → "Deploy latest commit"

### Option 3: Environment Variables Check

#### API Service (`an-gi-o-dau-api-64eh`)
Make sure these environment variables are set:
- `MONGODB_URI=your_mongodb_atlas_connection_string`
- `JWT_SECRET=your_jwt_secret`
- `FRONTEND_URL=https://an-gi-o-dau-frontend-64eh.onrender.com`
- `NODE_ENV=production`
- Other required variables from `.env.example`

#### Frontend Service (`an-gi-o-dau-frontend-64eh`) ✅ COMPLETED
**CRITICAL**: Make sure this environment variable is set:
- `NEXT_PUBLIC_API_URL=https://an-gi-o-dau-api-64eh.onrender.com/api`

**This was the root cause of the "Failed to fetch" error!** The frontend was trying to connect to `localhost:5000` instead of the production API.

### ⚠️ URGENT: Set Backend Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select the backend service: `an-gi-o-dau-api-64eh`
3. Go to **Environment** tab
4. Add these CRITICAL environment variables:

```
JWT_SECRET=your_strong_jwt_secret_here_minimum_32_characters
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=production
FRONTEND_URL=https://an-gi-o-dau-frontend-64eh.onrender.com
```

5. Click **Save Changes**
6. **Manual Redeploy**: Click "Manual Deploy" → "Deploy latest commit"

## Testing After Deployment
1. Check API health: `https://an-gi-o-dau-api-64eh.onrender.com/api/health`
2. Test CORS: Open browser console on `https://an-gi-o-dau-frontend-64eh.onrender.com` and check for CORS errors
3. Verify data loading: Check if places and plans load properly on the frontend

## Expected Results
- ✅ No more "Service Suspended" messages
- ✅ No more CORS errors in browser console
- ✅ Frontend can successfully fetch data from API
- ✅ All API endpoints respond correctly

## If Issues Persist
1. Check Render service logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure MongoDB Atlas allows connections from Render's IP ranges
4. Check if any rate limiting or security policies are blocking requests