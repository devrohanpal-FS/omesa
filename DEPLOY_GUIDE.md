# Hostinger KVM 2 VPS Deployment & CI/CD Pipeline Guide

This guide explains how to deploy your React (Vite) + Node.js (Express) + SQLite (Prisma) application on a **Hostinger KVM 2 VPS (running Ubuntu 22.04 or 24.04 LTS)** using GitHub Actions for automated CI/CD.

---

## 🏗 System Architecture Overview

- **Frontend**: Built statically into React files (`dist`) using Vite.
- **Backend**: Express server running on port `5001`, which serves the React static files and handles API endpoints.
- **Database**: SQLite file (`prisma/dev.db`), managed by Prisma ORM.
- **Process Manager**: PM2 (keeps the Node.js server running in the background and restarts it if it crashes).
- **Web Server / Reverse Proxy**: Nginx (receives traffic on port 80/443 and forwards it to port 5001, handles SSL certificate encryption).

---

## 🛠 Step 1: Initial Server Setup (Hostinger VPS)

### 1. Connect to your VPS via SSH
Open your local terminal and connect as the root user:
```bash
ssh root@your_server_ip
```

### 2. Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Node.js (Node 20+) and Git
We will install Node.js using NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
```
Verify installations:
```bash
node -v
npm -v
git --version
```

### 4. Install PM2 (Process Manager) Globally
```bash
sudo npm install -g pm2
```

---

## 🌐 Step 2: Nginx Web Server & SSL Setup

### 1. Install Nginx
```bash
sudo apt install nginx -y
```

### 2. Configure Nginx Server Block
Create a new configuration file for your site:
```bash
sudo nano /etc/nginx/sites-available/omesa.in
```

Paste the following configuration (replace `omesa.in` and `your_server_ip` with your actual domain/IP):
```nginx
server {
    listen 80;
    server_name omesa.in www.omesa.in;

    location / {
        proxy_pass http://127.0.0.1:5001; # Node backend port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/omesa.in /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default # Remove default site
sudo nginx -t # Test configuration syntax
sudo systemctl restart nginx
```

### 3. Setup SSL Certificate (HTTPS) using Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d omesa.in -d www.omesa.in
```
Follow the interactive prompts to secure your traffic and automatically redirect HTTP to HTTPS.

---

## 🔑 Step 3: Deploy SSH Key Configuration for GitHub

To allow GitHub Actions to securely deploy code onto your Hostinger VPS:

### 1. Generate SSH Key on your VPS
If you do not have an SSH key pair already:
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
```
Press Enter to accept defaults (leave passphrase empty).

### 2. Add Key to Authorized Keys
Append the public key to the server's authorized list:
```bash
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 3. Copy the Private Key
Display the private key and copy it:
```bash
cat ~/.ssh/id_ed25519
```
*Keep this safe, you will add it to GitHub Secrets in the next step.*

---

## 🛠 Step 4: GitHub Repository Secrets Configuration

1. Go to your repository on GitHub.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Add the following **Repository Secrets**:
   - `HOST`: Your Hostinger VPS IP Address.
   - `USERNAME`: `root`
   - `SSH_KEY`: Paste the entire contents of the private key (starting with `-----BEGIN OPENSSH PRIVATE KEY-----` and ending with `-----END OPENSSH PRIVATE KEY-----`).

---

## 🚀 Step 5: Configure GitHub Actions CI/CD Pipeline

Create a GitHub Actions workflow file in your project under `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hostinger KVM VPS

on:
  push:
    branches:
      - main # Trigger deploy on pushes to main branch

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Deploy to VPS via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            # Navigate to the app directory
            cd /var/www/omesa.in || {
              echo "Directory does not exist. Creating..."
              mkdir -p /var/www/omesa.in
              cd /var/www/omesa.in
              git clone https://github.com/your-username/your-repo.git .
            }

            # Pull latest changes
            git fetch --all
            git reset --hard origin/main

            # Install dependencies
            npm install

            # Generate Prisma Client & Run DB updates
            npx prisma generate
            npx prisma db push --accept-data-loss # Safe for development, syncs schema directly to SQLite

            # Build React frontend
            npm run build

            # Check if PM2 process is running, else start it
            pm2 describe omesa > /dev/null 2>&1
            if [ $? -eq 0 ]; then
              echo "Restarting omesa application process..."
              pm2 reload omesa
            else
              echo "Starting omesa application process for the first time..."
              pm2 start server.js --name "omesa" --env production
            fi

            # Save PM2 state
            pm2 save
```

---

## ⚙️ Step 6: Initial Manual Setup on the VPS

Before triggering the first automatic deployment, perform this setup on the VPS once:

### 1. Clone the project to `/var/www/omesa.in`
```bash
mkdir -p /var/www/omesa.in
cd /var/www/omesa.in
git clone <your_github_repo_url> .
```

### 2. Create the Production `.env` File
Create a `.env` file in the folder:
```bash
nano .env
```
Paste your production environment variables (update values appropriately):
```env
PORT=5001
NODE_ENV=production
DATABASE_URL="file:./dev.db"
JWT_SECRET="generate-a-secure-random-string-here"

# Airtable / NocoDB Keys (Copy from local .env)
VITE_NOCODB_BASE_ID=peeyk4h57zskmpw
VITE_NOCODB_TABLE_NAME=aboutus
VITE_NOCODB_ACCESS_TOKEN=gULeQuVZZasDTcnb7qzEKV99yWaV4oPqkLX3CxGY
VITE_NOCODB_VIEW_ID=vw52ix06tspcuiyw
```

### 3. Initialize & Seed Database
```bash
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js # Optional: Seeds the database with admin@omesa.in / AdminPassword123
```

### 4. Build and Start Server
```bash
npm run build
pm2 start server.js --name "omesa"
pm2 save
pm2 startup # Enables PM2 to start on system boot
```

Now, every time you push code changes to the `main` branch on GitHub, the pipeline will build the code and reload the application on the VPS in less than a minute!
