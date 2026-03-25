# Deployment Guide

## Backend Deployment (Render)

1. **Create a new Web Service on Render**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your Git repository

2. **Configure the service**
   - Name: `proxyra-backend` (or your preferred name)
   - Region: Choose your preferred region
   - Branch: `main` (or your default branch)
   - Root Directory: Leave empty
   - Runtime: `Docker`
   - Instance Type: Free or paid tier

3. **Environment Variables**
   No additional environment variables needed - the Dockerfile handles everything.

4. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete
   - Copy your backend URL (e.g., `https://proxyra-backend.onrender.com`)

## Frontend Deployment (Vercel)

1. **Update Backend URL**
   - Edit `frontend/.env.production`
   - Replace `https://your-app-name.onrender.com` with your actual Render backend URL

2. **Deploy to Vercel**
   
   Option A: Using Vercel CLI
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

   Option B: Using Vercel Dashboard
   - Go to https://vercel.com/
   - Click "Add New..." → "Project"
   - Import your Git repository
   - Vercel will auto-detect the configuration from `vercel.json`
   - Add environment variable:
     - Key: `VITE_BACKEND_URL`
     - Value: Your Render backend URL (e.g., `https://proxyra-backend.onrender.com`)
   - Click "Deploy"

3. **Verify Deployment**
   - Visit your Vercel URL
   - The app should load and connect to your backend

## Testing

1. **Test Backend Health**
   ```bash
   curl https://your-backend.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

2. **Test Proxy Endpoint**
   ```bash
   curl "https://your-backend.onrender.com/proxy?url=https://example.com"
   ```

3. **Test Frontend**
   - Open your Vercel URL in a browser
   - The dashboard should display mock data
   - Check browser console for any CORS or connection errors

## Important Notes

- **Render Free Tier**: Services spin down after 15 minutes of inactivity. First request may take 30-60 seconds.
- **CORS**: Backend is configured to accept requests from any origin. For production, consider restricting to your Vercel domain.
- **Environment Variables**: Make sure `VITE_BACKEND_URL` in Vercel matches your Render backend URL exactly (no trailing slash).

## Troubleshooting

### CORS Errors
- Verify backend is deployed and accessible
- Check that `VITE_BACKEND_URL` is set correctly in Vercel
- Ensure backend has `rocket_cors` dependency

### Backend Not Responding
- Check Render logs for errors
- Verify the service is running (not sleeping)
- Test the `/health` endpoint directly

### Frontend Build Errors
- Ensure all dependencies are in `package.json`
- Check Vercel build logs
- Verify `vercel.json` configuration is correct
