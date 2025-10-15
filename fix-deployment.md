# Fix Deployment Issue - CORS Configuration

## Problem Identified
The API service was suspended/blocked due to improper CORS configuration. The original configuration used `app.use(cors())` which allows all origins, but doesn't properly handle preflight requests in production.

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
Make sure these environment variables are set in your Render API service:
- `FRONTEND_URL=https://an-gi-o-dau-frontend-64eh.onrender.com`
- `NODE_ENV=production`
- `MONGODB_URI=your_mongodb_atlas_connection_string`
- `JWT_SECRET=your_jwt_secret`
- Other required variables from `.env.example`

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