# FlockRL Webapp Frontend

Next.js frontend for the FlockRL drone flight submission gallery and visualization platform.

## 🚀 Deployment Status

**Latest Deployment:** https://75d86473.flockrl-webapp.pages.dev

## 🛠️ Backend Configuration

### Current Status
The frontend is currently deployed **without** a backend API. When you visit the site, you'll see helpful banners explaining:
- **"Backend Not Configured"** - Instructions on how to set up the API URL
- **"Backend Service Unavailable"** - If the backend is configured but not responding

### Setting Up the Backend API

#### For Local Development
1. Create a `.env.local` file in the `frontend` directory:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8787
   ```

2. Start your backend server (Cloudflare Workers):
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```
   The backend runs on port 8787

3. Run the frontend:
   ```bash
   npm run dev
   ```

#### For Production (Cloudflare Pages)

1. **Deploy your backend API** to a publicly accessible URL

2. **Configure environment variable in Cloudflare Pages:**
   - Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
   - Select your `flockrl-webapp` project
   - Navigate to **Settings → Environment variables**
   - Add a new variable:
     - **Variable name:** `NEXT_PUBLIC_API_URL`
     - **Value:** `https://your-backend-api.com` (your actual backend URL)
     - **Environment:** Production (or Preview for testing)

3. **Redeploy the frontend:**
   ```bash
   npm run deploy
   ```

   Or trigger a redeploy from the Cloudflare Pages dashboard.

### Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.flockrl.com` | Yes |

> **Note:** `NEXT_PUBLIC_*` variables are **build-time** variables. They get compiled into your JavaScript bundle during the build process. You must redeploy after changing them.

## 📦 Installation

```bash
npm install
```

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production (static export)
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Preview deployment locally
npm run preview
```

## 🏗️ Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Gallery/Home page
│   ├── submit/            # Submission upload page
│   └── submissions/[id]/  # Submission detail page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── backend-status-banner.tsx  # Backend error banners
│   └── ...               # Feature components
├── lib/
│   ├── api.ts            # API client with error handling
│   └── types.ts          # TypeScript types
└── wrangler.toml         # Cloudflare Pages configuration
```

## 🔑 Key Features

- **Graceful Backend Error Handling** - Shows helpful messages when backend is unavailable
- **TypeScript Strict Mode** - Full type safety
- **Cloudflare Pages Optimized** - Fast edge deployment
- **Static Asset Routing** - Proper `_routes.json` for CSS/JS serving
- **Modern UI** - Built with Tailwind CSS and shadcn/ui

## 📚 Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4.1.9
- **UI Components:** Radix UI + shadcn/ui
- **Deployment:** Cloudflare Pages
- **Build Tool:** Turbopack

## 🐛 Troubleshooting

### CSS Not Loading
If you see unstyled content, check that static assets are being served correctly. Verify the build output in `out/` directory.

### Backend Connection Issues
1. Check browser console for API errors
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. Ensure backend CORS allows your frontend domain
4. Test backend URL directly in browser

### Build Errors
```bash
# Clean build directories
rm -rf .next out node_modules

# Reinstall and rebuild
npm install
npm run build
```

## 📝 License

[Your License Here]
