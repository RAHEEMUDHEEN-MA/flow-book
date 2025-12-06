# Flow Book - Deployment Guide

Complete guide for deploying Flow Book to your VPS server with automated deployment.

## 🎯 Overview

This setup allows you to deploy with a single command:
```bash
npm run deploy
```

**How it works:**
1. Builds your app locally (no build process on VPS)
2. Pushes only the `dist` folder to a `production` branch
3. VPS automatically pulls updates every 5 minutes
4. Nginx serves the static files

---

## 📋 Prerequisites

### On Your Local Machine
- Git installed
- Node.js and npm installed
- This repository cloned

### On Your VPS
- Ubuntu/Debian Linux (or similar)
- Root/sudo access
- Public IP address or domain name

---

## 🚀 Setup Instructions

### Step 1: Prepare Your Repository

1. **Push your code to GitHub/GitLab** (if not already done):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/flow_book.git
   git push -u origin main
   ```

2. **Update VPS setup script** - Edit `vps-setup.sh` and change:
   ```bash
   REPO_URL="https://github.com/YOUR_USERNAME/flow_book.git"
   DOMAIN="your-domain.com"  # or your VPS IP address
   ```

### Step 2: Setup Your VPS

1. **Upload the setup script to your VPS:**
   ```bash
   scp vps-setup.sh root@YOUR_VPS_IP:/root/
   ```

2. **SSH into your VPS:**
   ```bash
   ssh root@YOUR_VPS_IP
   ```

3. **Run the setup script:**
   ```bash
   chmod +x /root/vps-setup.sh
   sudo bash /root/vps-setup.sh
   ```

   This will:
   - ✅ Install Nginx web server
   - ✅ Clone your repository (production branch)
   - ✅ Configure Nginx to serve your app
   - ✅ Set up auto-update every 5 minutes
   - ✅ Enable gzip compression and caching

### Step 3: Deploy Your App

From your local machine, run:

```bash
npm run deploy
```

This will:
1. Build your app (`npm run build`)
2. Create/update the `production` branch
3. Push only the `dist` folder to GitHub
4. VPS will auto-pull within 5 minutes

---

## 🔧 Configuration

### Environment Variables

Your VPS needs the Firebase configuration. Create `/var/www/flow-book/.env.production`:

```bash
ssh root@YOUR_VPS_IP
nano /var/www/flow-book/.env.production
```

Add your Firebase config (copy from your local `.env` file):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note:** Since we're building locally, environment variables are baked into the build. You don't need `.env` on the VPS unless you're building there.

### Custom Domain

If you have a domain, update the Nginx config:

```bash
sudo nano /etc/nginx/sites-available/flow-book
```

Change `server_name` to your domain:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

### SSL/HTTPS Setup

Install Certbot for free SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically configure HTTPS and set up auto-renewal.

---

## 📝 Usage

### Deploy New Changes

```bash
npm run deploy
```

Your VPS will automatically pull the changes within 5 minutes.

### Manual Update on VPS

If you want immediate update:

```bash
ssh root@YOUR_VPS_IP
sudo /var/www/flow-book/update.sh
```

### Check Deployment Status

```bash
# Check auto-update timer
systemctl status flow-book-update.timer

# View update logs
journalctl -u flow-book-update.service -f

# Check Nginx status
systemctl status nginx

# View website access logs
tail -f /var/log/nginx/access.log
```

---

## 🔍 Troubleshooting

### Deployment script fails

**Error: "Not a git repository"**
- Make sure you're in the project directory
- Run `git init` if needed

**Error: "Build directory not found"**
- Check if `npm run build` completes successfully
- Verify `dist` folder exists after build

### VPS not updating

**Check if timer is running:**
```bash
systemctl status flow-book-update.timer
```

**Manually trigger update:**
```bash
sudo systemctl start flow-book-update.service
```

**Check Git status:**
```bash
cd /var/www/flow-book
git status
git log -1
```

### Website not loading

**Check Nginx status:**
```bash
systemctl status nginx
nginx -t  # Test configuration
```

**Check Nginx error logs:**
```bash
tail -f /var/log/nginx/error.log
```

**Verify files exist:**
```bash
ls -la /var/www/flow-book/
```

### 404 errors on routes

This is a React Router issue. Make sure your Nginx config has:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 🎨 Customization

### Change Update Frequency

Edit the timer (default is 5 minutes):

```bash
sudo nano /etc/systemd/system/flow-book-update.timer
```

Change `OnUnitActiveSec=5min` to your preferred interval (e.g., `10min`, `1h`).

Reload:
```bash
sudo systemctl daemon-reload
sudo systemctl restart flow-book-update.timer
```

### Disable Auto-Update

```bash
sudo systemctl stop flow-book-update.timer
sudo systemctl disable flow-book-update.timer
```

Update manually with:
```bash
sudo /var/www/flow-book/update.sh
```

---

## 📊 Architecture

```
┌─────────────────┐
│ Your Computer   │
│                 │
│ npm run deploy  │
└────────┬────────┘
         │
         │ 1. Build locally
         │ 2. Push to GitHub
         ▼
┌─────────────────┐
│ GitHub          │
│                 │
│ production      │
│ branch          │
└────────┬────────┘
         │
         │ 3. VPS pulls every 5min
         ▼
┌─────────────────┐
│ VPS Server      │
│                 │
│ Nginx serves    │
│ static files    │
└─────────────────┘
```

---

## 🔐 Security Best Practices

1. **Use SSH keys** instead of passwords
2. **Enable firewall:**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

3. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Use HTTPS** with Let's Encrypt (free)

5. **Never commit `.env` files** to Git

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Nginx logs: `/var/log/nginx/error.log`
3. Check systemd logs: `journalctl -u flow-book-update.service`

---

## 📄 Files Created

- `deploy.sh` - Bash deployment script (Linux/Mac)
- `deploy.ps1` - PowerShell deployment script (Windows)
- `vps-setup.sh` - VPS initial setup script
- `DEPLOYMENT.md` - This documentation

---

**Happy Deploying! 🚀**
