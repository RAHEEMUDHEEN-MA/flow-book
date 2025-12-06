#!/bin/bash

# VPS Setup Script for Flow Book
# Run this script on your VPS server to set up automatic deployment

set -e

echo "🚀 Flow Book VPS Setup Script"
echo "================================"

# Configuration - UPDATE THESE VALUES
REPO_URL="https://github.com/YOUR_USERNAME/flow_book.git"  # Your Git repository URL
DEPLOY_BRANCH="production"
APP_DIR="/var/www/flow-book"
DOMAIN="your-domain.com"  # Optional: your domain name

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script should be run as root or with sudo"
    echo "Run: sudo bash vps-setup.sh"
    exit 1
fi

echo ""
echo "📋 Configuration:"
echo "   Repository: $REPO_URL"
echo "   Branch: $DEPLOY_BRANCH"
echo "   Install Directory: $APP_DIR"
echo ""
read -p "Is this correct? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled. Please edit the script and update the configuration."
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx

# Install Git
echo "📥 Installing Git..."
apt install -y git

# Create application directory
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone the repository
echo "📥 Cloning repository..."
if [ -d ".git" ]; then
    echo "Repository already exists, pulling latest changes..."
    git fetch origin
    git checkout $DEPLOY_BRANCH
    git pull origin $DEPLOY_BRANCH
else
    git clone -b $DEPLOY_BRANCH $REPO_URL .
fi

# Create Nginx configuration
echo "⚙️  Configuring Nginx..."
cat > /etc/nginx/sites-available/flow-book << EOF
server {
    listen 80;
    server_name $DOMAIN;

    root $APP_DIR;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/flow-book /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx
systemctl enable nginx

# Create update script
echo "📝 Creating update script..."
cat > $APP_DIR/update.sh << 'EOF'
#!/bin/bash
set -e
echo "🔄 Updating Flow Book..."
cd /var/www/flow-book
git fetch origin
git reset --hard origin/production
echo "✅ Update complete!"
systemctl reload nginx
EOF

chmod +x $APP_DIR/update.sh

# Create systemd service for auto-update (optional)
echo "⚙️  Creating auto-update service..."
cat > /etc/systemd/system/flow-book-update.service << EOF
[Unit]
Description=Flow Book Update Service
After=network.target

[Service]
Type=oneshot
ExecStart=$APP_DIR/update.sh
User=root

[Install]
WantedBy=multi-user.target
EOF

# Create timer for auto-update (checks every 5 minutes)
cat > /etc/systemd/system/flow-book-update.timer << EOF
[Unit]
Description=Flow Book Auto-Update Timer
Requires=flow-book-update.service

[Timer]
OnBootSec=5min
OnUnitActiveSec=5min

[Install]
WantedBy=timers.target
EOF

# Enable the timer
systemctl daemon-reload
systemctl enable flow-book-update.timer
systemctl start flow-book-update.timer

echo ""
echo "✅ Setup complete!"
echo ""
echo "📌 Next Steps:"
echo "   1. Update the REPO_URL in this script if you haven't already"
echo "   2. Run 'npm run deploy' from your local machine"
echo "   3. Your VPS will auto-update every 5 minutes"
echo ""
echo "🌐 Your site should be accessible at: http://$DOMAIN"
echo ""
echo "📝 Useful commands:"
echo "   - Manual update: sudo $APP_DIR/update.sh"
echo "   - Check update status: systemctl status flow-book-update.timer"
echo "   - View Nginx logs: tail -f /var/log/nginx/access.log"
echo "   - Restart Nginx: systemctl restart nginx"
echo ""
echo "🔒 For HTTPS/SSL, install certbot:"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $DOMAIN"
echo ""
