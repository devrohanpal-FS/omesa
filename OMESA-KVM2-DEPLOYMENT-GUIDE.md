# production-ready Deployment Guide: Omesa.in on Hostinger KVM2 VPS

This guide provides step-by-step instructions to deploy **Omesa.in** as a separate production project (**Project #2**) on your existing **Hostinger KVM2 VPS**.

> [!WARNING]
> **SAFETY FIRST:** An existing production project (`Cre8tiveCove`) is running on this server. Follow these instructions exactly to ensure `Cre8tiveCove` is not interrupted, modified, or stopped.

---

# SECTION 1 — VPS ARCHITECTURE

Our target environment is a multi-tenant Node.js deployment sharing a single Hostinger KVM2 VPS. Isolation is achieved at the directory, database, network port, process manager, and web server layers.

### Directory & Port Layout
```text
Hostinger KVM2 VPS
│
├── Project 1 (Existing)
│   └── Cre8tiveCove
│       ├── Directory: /home/rohanpal/~apps/cre8tivecove
│       ├── Process: PM2 (cre8tivecove-api)
│       └── Port: :5001
│
└── Project 2 (New)
    └── Omesa.in
        ├── Directory: /home/rohanpal/~apps/omesa
        ├── Process: PM2 (omesa-api)
        └── Port: :5002
```

### Network Topology & Proxy Routing
```text
Internet (Traffic on ports 80/443)
   ↓
Nginx Reverse Proxy
   ├── HTTP/HTTPS for cre8tivecove.com & www.cre8tivecove.com
   │       ↓
   │     Proxy to: http://127.0.0.1:5001 (cre8tivecove-api)
   │
   └── HTTP/HTTPS for omesa.in & www.omesa.in
           ↓
         Proxy to: http://127.0.0.1:5002 (omesa-api)
```

### Why Isolation Layers are Required:
- **Separate Ports**: Port `5001` is bound by the `cre8tivecove-api` process. Binding Omesa to port `5001` will throw an `EADDRINUSE` error. Omesa must use port `5002`.
- **Separate PM2 Processes**: Separating processes allows independent restarts (`pm2 restart omesa-api`) without taking down the other app.
- **Separate Databases**: Ensures database schema changes or user credentials for one project do not overwrite or corrupt data from the other.
- **Separate Directories**: Prevents package collisions and file overwrites.
- **Nginx Server Blocks**: Allows Nginx to inspect the incoming `Host` HTTP header and route the request to the correct port.

---

# SECTION 2 — PRE-DEPLOYMENT SAFETY CHECK

Run the following commands on the VPS before starting the deployment to check the health of existing services and record the baseline state:

```bash
# 1. Check currently active PM2 processes
pm2 status

# 2. Check bound listening ports on the VPS
sudo ss -lntp

# 3. Verify Nginx configuration is fully functional
sudo nginx -t

# 4. Check Nginx system daemon status
sudo systemctl status nginx --no-pager

# 5. Check PostgreSQL database system status
sudo systemctl status postgresql --no-pager

# 6. Verify existing application directories
sudo ls -lah /home/rohanpal/~apps/
```

### Expected Output Checklist:
- `pm2 status` should show `cre8tivecove-api` running online.
- `sudo ss -lntp` should show port `5001` bound by a node process, port `5432` bound by postgresql, and ports `80` and `443` bound by nginx.
- `sudo nginx -t` must output `nginx: configuration file /etc/nginx/nginx.conf test is successful`.

---

# SECTION 3 — CHOOSE SAFE PROJECT DIRECTORY

Deploy the Omesa project to a dedicated workspace.

### Safe Directory:
```text
/home/rohanpal/~apps/omesa
```

> [!CAUTION]
> Do NOT place Omesa files inside `/home/rohanpal/~apps/cre8tivecove`. Mixing directories will corrupt your dependencies and break both applications.

Run the following commands to initialize the directory safely:
```bash
# Create the parent directory if not exists
mkdir -p /home/rohanpal/~apps/omesa

# Set correct ownership for user rohanpal
sudo chown -R rohanpal:rohanpal /home/rohanpal/~apps/omesa
```

---

# SECTION 4 — GITHUB DEPLOYMENT

For secure deployment from GitHub:

```text
GitHub (Source) ──> git clone/pull ──> Hostinger VPS ──> /home/rohanpal/~apps/omesa
```

### Cloning the Repository
Connect to the VPS as `rohanpal` and run:
```bash
cd /home/rohanpal/~apps
git clone <GITHUB_REPOSITORY_URL> omesa
cd /home/rohanpal/~apps/omesa
```

*Note: Replace `<GITHUB_REPOSITORY_URL>` with your repository (e.g. `https://github.com/rohanpaldeveloper-Reactjs/omesa.git`).*

### Private Repositories (SSH Deployment Key)
If your repository is private, configure an SSH Deploy Key:
1. Generate an SSH key pair on the VPS:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/id_omesa_deploy -C "omesa-deploy-key"
   ```
2. Display the public key:
   ```bash
   cat ~/.ssh/id_omesa_deploy.pub
   ```
3. Add this key to **GitHub** -> **Repository Settings** -> **Deploy Keys** (read-only access).
4. Configure SSH on the VPS by editing `~/.ssh/config`:
   ```text
   Host github-omesa
       HostName github.com
       User git
       IdentityFile ~/.ssh/id_omesa_deploy
       IdentitiesOnly yes
   ```
5. Clone using the host alias:
   ```bash
   git clone git@github-omesa:rohanpaldeveloper-Reactjs/omesa.git omesa
   ```

### Future Deployments
For updates, use `git pull` instead of recloning:
```bash
git checkout main
git pull origin main
```

---

# SECTION 5 — IDENTIFY PROJECT STRUCTURE

Inspect the repository layout first to verify folder structures:
```bash
cd /home/rohanpal/~apps/omesa
ls -lah
find . -maxdepth 2 -name package.json -not -path "*/node_modules/*"
```

### Structure Identification:
- **Case A: Single Root Application**: Contains a single `package.json` in the root. The Express server (`server.js`) serves the built React assets (`dist`). This is the layout utilized by this repository.
- **Case B: Monorepo or Separate folders**: Contains subdirectories like `/client` and `/server`.
*Always adapt build and run scripts to match this layout.*

---

# SECTION 6 — NODE / PNPM DEPENDENCIES

Check the versions of your package managers:
```bash
node -v
npm -v
pnpm -v
```

Ensure you install dependencies according to the existing lockfile:
- If `package-lock.json` is present, run:
  ```bash
  npm ci --omit=dev # Installs production dependencies strictly
  ```
- If `pnpm-lock.yaml` is present, run:
  ```bash
  pnpm install --frozen-lockfile --prod
  ```

---

# SECTION 7 — ENVIRONMENT VARIABLES

Create the production environment file:
```bash
nano /home/rohanpal/~apps/omesa/.env
```

Paste and customize the following production variables:
```env
PORT=5002
NODE_ENV=production
DATABASE_URL="postgresql://omesa_user:<STRONG_DATABASE_PASSWORD>@localhost:5432/omesa_db?schema=public"
JWT_SECRET="<SECURE_RANDOM_JWT_SECRET>"

# Add Airtable/NocoDB variables if utilized
VITE_NOCODB_BASE_ID="peeyk4h57zskmpw"
VITE_NOCODB_TABLE_NAME="aboutus"
VITE_NOCODB_ACCESS_TOKEN="gULeQuVZZasDTcnb7qzEKV99yWaV4oPqkLX3CxGY"
VITE_NOCODB_VIEW_ID="vw52ix06tspcuiyw"
```

> [!IMPORTANT]
> Verify that `/home/rohanpal/~apps/omesa/.gitignore` contains `.env` to prevent committing secrets to GitHub.

---

# SECTION 8 — POSTGRESQL DATABASE

Create a separate PostgreSQL database and user to run isolated from Cre8tiveCove.

### 1. Log into PostgreSQL as administrator:
```bash
sudo -i -u postgres psql
```

### 2. Create the Database and User:
Execute the SQL commands (replace `<STRONG_DATABASE_PASSWORD>` with a strong, generated password):
```sql
-- Create user
CREATE USER omesa_user WITH PASSWORD '<STRONG_DATABASE_PASSWORD>';

-- Create database
CREATE DATABASE omesa_db OWNER omesa_user;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE omesa_db TO omesa_user;

-- Quit console
\q
```

---

# SECTION 9 — PRISMA SETUP

Omesa utilizes Prisma for SQLite locally, but we need to configure it for PostgreSQL on production.

### 1. Configure the Prisma Schema for PostgreSQL
Open the schema:
```bash
nano /home/rohanpal/~apps/omesa/prisma/schema.prisma
```
Change the `db` block provider from `sqlite` to `postgresql`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Generate Client and Deploy Migrations
Run the deployment migrations command (does not reset production data):
```bash
# Generate the Javascript Prisma Client
npx prisma generate

# Sync schema state with PostgreSQL
npx prisma db push
```

> [!CAUTION]
> Never run `npx prisma migrate reset` in production, as it deletes all tables and data.

---

# SECTION 10 — BUILD THE APPLICATION

Inspect `package.json` to verify build scripts:
```bash
cat package.json
```

Build the React production bundle:
```bash
# Install all dependencies (including devDependencies required for building)
npm install

# Run Vite build
npm run build

# Clean up dev dependencies to save space
npm prune --production
```

---

# SECTION 11 — TEST WITHOUT PM2 FIRST

Verify the server runs correctly on port `5002` manually before running PM2:
```bash
export PORT=5002
export NODE_ENV=production
node server.js
```

In a second SSH terminal window, verify the health status:
```bash
curl -I http://127.0.0.1:5002
```

Press `Ctrl + C` in the main terminal to stop the manual process once verified.

---

# SECTION 12 — PM2 PRODUCTION CONFIGURATION

Create an isolated PM2 process configuration for Omesa.

### 1. Create a `ecosystem.config.cjs` file:
```bash
nano /home/rohanpal/~apps/omesa/ecosystem.config.cjs
```

Paste the configuration:
```javascript
module.exports = {
  apps: [
    {
      name: "omesa-api",
      script: "./server.js",
      cwd: "/home/rohanpal/~apps/omesa",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        PORT: 5002,
        NODE_ENV: "production",
      }
    }
  ]
};
```

### 2. Start the App using PM2:
```bash
pm2 start /home/rohanpal/~apps/omesa/ecosystem.config.cjs
```

### 3. Verify status:
```bash
pm2 status
pm2 logs omesa-api --lines 50
```

*Note: PM2 daemonizes the app process, ensuring it stays active after you close your SSH connection.*

---

# SECTION 13 — PM2 STARTUP AFTER VPS REBOOT

Ensure both processes boot automatically on server restart.

### Save the PM2 Process List
```bash
pm2 save
```

Verify PM2 is configured to boot on system startup:
```bash
sudo systemctl status pm2-rohanpal
```
*(If not enabled, run `pm2 startup` and execute the command it outputs).*

---

# SECTION 14 — NGINX CONFIGURATION

Create a separate Nginx server block config for Omesa.in.

### 1. Create a new site file:
```bash
sudo nano /etc/nginx/sites-available/omesa
```

### 2. Paste the configuration:
```nginx
server {
    listen 80;
    server_name omesa.in www.omesa.in;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/omesa /etc/nginx/sites-enabled/
```

---

# SECTION 15 — NGINX VALIDATION

Before applying Nginx configuration changes:

```bash
# 1. Verify Nginx syntax configuration
sudo nginx -t
```
If the test passes successfully, reload Nginx:
```bash
# 2. Reload Nginx dynamically without dropping current active connections
sudo systemctl reload nginx
```

Check active configuration rules:
```bash
sudo ls -lah /etc/nginx/sites-enabled/
sudo grep -R "server_name" /etc/nginx/sites-enabled/
```
Both `cre8tivecove` and `omesa` server blocks must show up.

---

# SECTION 16 — DNS CONFIGURATION

Configure the following records on your DNS hosting provider:

| Type | Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| A | @ (Root) | `<VPS_PUBLIC_IP>` | Automatic/1 Hour |
| A | www | `<VPS_PUBLIC_IP>` | Automatic/1 Hour |

Verify the DNS records resolve correctly from your local terminal:
```bash
dig omesa.in +short
dig www.omesa.in +short
```

---

# SECTION 17 — SSL / HTTPS

Install SSL certificates using Certbot.

```bash
# 1. Verify certbot is available
certbot --version

# 2. Request and install certificate for omesa
sudo certbot --nginx -d omesa.in -d www.omesa.in
```

### Verify SSL Auto-renewal
Certbot automatically registers a systemd timer. Verify dry-run functionality:
```bash
sudo certbot renew --dry-run
```

---

# SECTION 18 — FIREWALL

Verify firewall rules:
```bash
sudo ufw status
```

Do NOT expose port `5002` publicly. The port should block public connections and only be accessible locally by Nginx.
`ufw` rules should only open:
- `Nginx Full` (Ports 80 & 443)
- `OpenSSH` (Port 22)

---

# SECTION 19 — PRODUCTION VERIFICATION

Perform the final verification checklist on the VPS:

```bash
# 1. Check PM2 status
pm2 status

# 2. Verify port 5002 binding
sudo ss -lntp | grep 5002

# 3. Test local Nginx routing
curl -I http://127.0.0.1:5002

# 4. Check external HTTPS routing
curl -I https://omesa.in
```

---

# SECTION 20 — REBOOT TEST

Verify the PM2 startup persistence works:
```bash
sudo reboot
```

After VPS finishes booting up, log back in and check:
```bash
pm2 status
sudo ss -lntp
```
Confirm `cre8tivecove-api` and `omesa-api` are running online and listening on ports `5001` and `5002` respectively.

---

# SECTION 21 — ROLLBACK PROCEDURE

If a deployment fails, run these commands to roll back to a stable commit:

```bash
cd /home/rohanpal/~apps/omesa

# 1. Find previous stable commit hash
git log --oneline -n 10

# 2. Reset workspace state to target commit
git reset --hard <STABLE_COMMIT_HASH>

# 3. Reinstall dependencies
npm install

# 4. Rebuild production bundle
npm run build

# 5. Sync client
npx prisma generate

# 6. Restart PM2 application
pm2 restart omesa-api

# 7. Reload Nginx
sudo systemctl reload nginx
```

---

# SECTION 22 — FUTURE MANUAL DEPLOYMENT

To deploy manually, execute the following script:

```bash
cd /home/rohanpal/~apps/omesa
git checkout main
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart omesa-api --update-env
```

---

# SECTION 23 — GITHUB ──> JENKINS ──> VPS CI/CD

```text
Developer ──> Git Push ──> GitHub ──> Webhook ──> Jenkins (Hostinger) ──> SSH deploy script ──> Live
```

### Safety Rules:
- Jenkins scripts must never run wildcard commands like `pm2 restart all`, `pm2 stop all`, or `pm2 delete all` as it takes down `Cre8tiveCove`.
- Run commands targeting only `omesa-api`.

---

# SECTION 24 — JENKINS SAFETY

Create a separate build job in Jenkins:
- **Job Name**: `omesa-production` (Do NOT mix build histories or logs with `cre8tivecove-production`).
- **Configuration**:
  - Secure SSH Keys within **Credentials Provider** in Jenkins (do not output SSH private keys in console logs).
  - Setup webhook triggers securely via payload secrets.

---

# SECTION 25 — RECOMMENDED JENKINS PIPELINE

Create a `Jenkinsfile` in your repository root:

```groovy
pipeline {
    agent any

    environment {
        APP_DIR = '/home/rohanpal/~apps/omesa'
        PM2_APP = 'omesa-api'
    }

    stages {
        stage('Deploy to KVM VPS') {
            steps {
                sshagent(credentials: ['hostinger-vps-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no rohanpal@200.141.11.83 """
                            cd ${APP_DIR}
                            git fetch --all
                            git reset --hard origin/main
                            npm install
                            npx prisma generate
                            npx prisma db push
                            npm run build
                            pm2 restart ${PM2_APP} --update-env
                        """
                    '''
                }
            }
        }
    }
}
```

---

# SECTION 26 — MONITORING & DIAGNOSTICS

### Useful Diagnostics Commands
- **PM2 Dashboard**: `pm2 monit`
- **PM2 logs**: `pm2 logs omesa-api`
- **Nginx Access logs**: `sudo tail -f /var/log/nginx/access.log`
- **Nginx Error logs**: `sudo tail -f /var/log/nginx/error.log`

### Resolving common status codes:
- **502 Bad Gateway**: Means Nginx is running but the Express backend is offline. Run `pm2 status` to check if `omesa-api` is stopped or crashing, and check `pm2 logs omesa-api`.
- **Database Connection Failure**: Verify that `DATABASE_URL` credentials are correct and PostgreSQL is running (`sudo systemctl status postgresql`).

---

# SECTION 27 — COMMON ERRORS & SOLUTIONS

| Problem | Cause | Check | Fix |
| :--- | :--- | :--- | :--- |
| **EADDRINUSE** | Port `5002` is bound | `sudo ss -lntp` | Kill conflicting process or change port |
| **502 Bad Gateway** | Node server stopped | `pm2 status` | Run `pm2 restart omesa-api` |
| **Prisma Error** | Schema connection failed | `.env` settings | Update `DATABASE_URL` in `.env` |
| **SSL failure** | DNS propagation delayed | `dig` domain check | Wait for DNS updates before running certbot |

---

# SECTION 28 — FINAL VPS STRUCTURE

```text
/home/rohanpal/~apps/
├── cre8tivecove/ (Project 1 - Port 5001)
│   ├── server/
│   └── ...
└── omesa/        (Project 2 - Port 5002)
    ├── server.js
    ├── prisma/
    └── dist/
```

- **PM2 processes list**:
  - `cre8tivecove-api` -> Port 5001
  - `omesa-api` -> Port 5002
- **Nginx Config files**:
  - `/etc/nginx/sites-enabled/cre8tivecove`
  - `/etc/nginx/sites-enabled/omesa`
- **PostgreSQL databases**:
  - `cre8tivecove`
  - `omesa_db`

---

# SECTION 29 — SECURITY CHECKLIST

- [ ] SSH key authentication enabled; Password auth disabled.
- [ ] No database passwords committed to GitHub repositories.
- [ ] Local environment variables protected via `.gitignore` rules.
- [ ] PostgreSQL and Express ports blocked from public web (UFW blocks all port access except `22`, `80`, `443`).
- [ ] Database backups configured (cronjob dumps for `omesa_db`).
- [ ] Jenkins dashboard console credentials hidden.

---

# SECTION 30 — FINAL DEPLOYMENT CHECKLIST

- [ ] GitHub repository verified
- [ ] VPS project directory created
- [ ] Existing project untouched
- [ ] Dependencies installed
- [ ] Production `.env` configured
- [ ] PostgreSQL database created
- [ ] Prisma configured
- [ ] Prisma migrations deployed
- [ ] Application built
- [ ] API tested locally
- [ ] Port `5002` verified
- [ ] PM2 process created
- [ ] PM2 save completed
- [ ] PM2 startup verified
- [ ] Nginx configuration created
- [ ] `nginx -t` successful
- [ ] DNS configured
- [ ] DNS resolved
- [ ] SSL installed
- [ ] HTTPS working
- [ ] Firewall checked
- [ ] Reboot test completed
- [ ] Cre8tiveCove still working
- [ ] Omesa.in working
- [ ] Jenkins pipeline ready
