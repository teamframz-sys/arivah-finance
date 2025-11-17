# Deployment Guide

This guide walks you through deploying the Arivah Finance Manager to production.

## Deployment Options

We recommend **Vercel** for the easiest deployment, but you can also use:
- Netlify
- Railway
- Render
- Your own VPS

## Option 1: Vercel (Recommended)

Vercel is the easiest option as it's made by the creators of Next.js.

### Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase project already set up

### Steps

1. **Push your code to GitHub**

   ```bash
   # Initialize git if you haven't
   git init

   # Add all files
   git add .

   # Commit
   git commit -m "Initial commit: Arivah Finance Manager"

   # Create a new repository on GitHub, then:
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/arivah-finance.git
   git push -u origin main
   ```

2. **Import to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

   In the Vercel project settings, add these environment variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_APP_NAME=Arivah Finance Manager
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   ```

4. **Deploy**

   Click "Deploy" - your app will be live in ~2 minutes!

5. **Update Supabase Auth Settings**

   - Go to Supabase Dashboard
   - Navigate to **Authentication** > **URL Configuration**
   - Set **Site URL**: `https://your-project.vercel.app`
   - Add to **Redirect URLs**: `https://your-project.vercel.app/**`

6. **Test Your Deployment**

   - Visit your Vercel URL
   - Try signing up and logging in
   - Create a test transaction

### Custom Domain (Optional)

1. In Vercel, go to **Settings** > **Domains**
2. Add your custom domain (e.g., `finance.arivah.com`)
3. Follow Vercel's instructions to configure DNS
4. Update Supabase redirect URLs with your custom domain

## Option 2: Netlify

1. **Push code to GitHub** (same as Vercel)

2. **Import to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect to GitHub and select your repository

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Environment Variables**
   Add the same environment variables as Vercel

5. **Deploy and Update Supabase**
   Same process as Vercel

## Option 3: Self-Hosted (VPS)

If you want to host on your own server:

### Requirements

- Ubuntu 20.04+ or similar Linux server
- Node.js 18+ installed
- Nginx (recommended)
- SSL certificate (Let's Encrypt recommended)

### Steps

1. **Install Node.js**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and Build**

   ```bash
   git clone https://github.com/YOUR_USERNAME/arivah-finance.git
   cd arivah-finance
   npm install
   npm run build
   ```

3. **Set Environment Variables**

   Create a `.env.local` file with your production values

4. **Run with PM2**

   ```bash
   # Install PM2
   sudo npm install -g pm2

   # Start the app
   pm2 start npm --name "arivah-finance" -- start

   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**

   Create `/etc/nginx/sites-available/arivah-finance`:

   ```nginx
   server {
       listen 80;
       server_name finance.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/arivah-finance /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**

   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d finance.yourdomain.com
   ```

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Can you access the login page?
- [ ] Can you create a new account?
- [ ] Can you login with credentials?
- [ ] Can you add a transaction?
- [ ] Can you create a transfer?
- [ ] Do the charts display correctly?
- [ ] Is the mobile layout responsive?
- [ ] Test password reset flow
- [ ] Update partner names in Settings

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to git
   - Use strong, unique values for production
   - Rotate keys periodically

2. **Supabase Security**
   - Enable RLS (already done in schema)
   - Use strong database password
   - Regularly backup your database
   - Monitor auth logs for suspicious activity

3. **HTTPS**
   - Always use HTTPS in production
   - Enable HSTS headers
   - Use secure cookies

4. **Updates**
   - Keep dependencies updated: `npm audit`
   - Update Next.js regularly
   - Monitor Supabase announcements

## Monitoring

### Vercel Analytics (Recommended)

1. In Vercel dashboard, enable Analytics
2. View real-time metrics and errors

### Supabase Monitoring

1. Go to Supabase Dashboard
2. Check **Database** > **Logs** for errors
3. Monitor **Authentication** > **Logs** for login issues

## Backup Strategy

### Database Backups

Supabase automatically backs up your database daily. For additional security:

1. **Manual Backups**
   - In Supabase, go to **Database** > **Backups**
   - Click "Create backup"

2. **Export Data**
   ```sql
   -- Run in Supabase SQL Editor
   COPY (SELECT * FROM transactions) TO '/tmp/transactions.csv' CSV HEADER;
   ```

### Code Backups

- Keep code in GitHub (already done)
- Tag releases: `git tag v1.0.0 && git push --tags`

## Rollback Procedure

If something goes wrong:

### Vercel Rollback

1. Go to Vercel Dashboard > Deployments
2. Find the last working deployment
3. Click "..." > "Promote to Production"

### Database Rollback

1. Go to Supabase Dashboard > Database > Backups
2. Select a backup point
3. Click "Restore"

## Scaling Considerations

As your usage grows:

1. **Supabase**
   - Free tier: Up to 500MB database, 2GB bandwidth
   - Pro tier ($25/mo): 8GB database, 100GB bandwidth
   - Upgrade when needed

2. **Vercel**
   - Free tier: Unlimited deployments, 100GB bandwidth
   - Pro tier ($20/mo): More bandwidth and features

3. **Performance**
   - Add database indexes if queries slow down
   - Use Vercel Edge caching
   - Optimize images

## Troubleshooting Deployment Issues

### Build Fails

- Check Node.js version matches local (18+)
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

### Runtime Errors

- Verify environment variables are set
- Check Supabase connection
- Review application logs

### Authentication Not Working

- Check Supabase redirect URLs
- Verify Site URL is correct
- Ensure HTTPS is being used

## Getting Help

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Review this guide
4. Check Next.js documentation
5. Check Supabase documentation

---

Good luck with your deployment! 🚀
