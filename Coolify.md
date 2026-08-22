# 🐳 Deploying La-Minks on Coolify (Self-Hosted Docker)

This guide walks you through deploying the full **La-Minks** platform (Frontend & Backend) onto your own server or VPS using **[Coolify](https://coolify.io/)** — the open-source, self-hosted alternative to Vercel and Heroku.

---

## 🌟 Why Coolify?
- **Self-Hosted & Cost-Effective**: Run everything on a single VPS (Hetzner, DigitalOcean, AWS EC2, Linode) or local Linux server.
- **Automatic SSL**: Free Let's Encrypt SSL certificates automatically provisioned for all custom domains.
- **Git Push Auto-Deploy**: Automatically builds and restarts containers on every `git push origin master`.
- **Integrated Traefik Proxy**: Built-in reverse proxy with zero-downtime rolling updates.

---

## 🛠️ Step 1: Install Coolify on Your Linux Server / VPS

Connect to your Linux server (Ubuntu 22.04/24.04 or Debian recommended) via SSH and run:

```bash
curl -fsSL https://cdn.coolify.io/coolify/install.sh | bash
```

> [!NOTE]
> Ensure your VPS firewall allows the following inbound ports:
> - **`80`** (HTTP & Let's Encrypt verification)
> - **`443`** (HTTPS Traffic)
> - **`8000`** (Coolify Dashboard Admin UI)
> - **`22`** (SSH Management)

Once the installer finishes, open your browser and navigate to:
```
http://<your-server-ip>:8000
```
Create your root admin account to access the dashboard.

---

## 🚀 Step 2: Deploying La-Minks in Coolify

### Option A: 1-Click Docker Compose Deployment (Recommended)

Because the repository includes a root [`docker-compose.yml`](file:///f:/cursor-dev/la-minks/docker-compose.yml), you can deploy both frontend and backend together:

1. Inside Coolify, go to **Projects** &rarr; **+ Add Project**.
2. Select your environment (e.g., `Production`).
3. Click **+ New Resource** &rarr; **Git Repository**.
4. Choose **Public Repository** (or connect your GitHub account) and enter:
   ```
   https://github.com/Malopex7/la-minks.git
   ```
5. Set **Branch** to `master`.
6. Set **Build Pack** to **`Docker Compose`**.
7. Coolify will detect [`docker-compose.yml`](file:///f:/cursor-dev/la-minks/docker-compose.yml) automatically.

---

### Option B: Deploy as 2 Separate Services (Frontend & Backend)

If you prefer managing frontend and backend independently in Coolify:

#### 1. Backend Service:
- **Resource Type**: Application (Docker)
- **Base Directory**: `/backend`
- **Dockerfile**: `Dockerfile`
- **Port Exposed**: `5001`
- **Domain**: `https://api.yourdomain.com` (or `http://<server-ip>:5001`)

#### 2. Frontend Service:
- **Resource Type**: Application (Docker)
- **Base Directory**: `/frontend`
- **Dockerfile**: `Dockerfile`
- **Port Exposed**: `3000`
- **Domain**: `https://yourdomain.com` (or `http://<server-ip>:3000`)

---

## 🔐 Step 3: Configure Environment Variables in Coolify

In Coolify's **Environment Variables** panel for the project, add the following:

### Backend Variables:
```env
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://bxmalope_db_user:XBEsOAvF6R0bEgCO@laminks.8wnmsnz.mongodb.net/la-minks-db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_64_character_hex_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_64_character_hex_key
FRONTEND_URL=https://yourdomain.com

# Paystack Gateway
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email Delivery (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="La-Minks Cleaning Services <info@laminks.co.za>"
```

### Frontend Build & Runtime Variables:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_PAYSTACK_KEY=your_paystack_public_key

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=la-minks.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=la-minks
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=la-minks.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

---

## 🌐 Step 4: Domain & Auto-SSL Configuration

1. In your DNS manager (Cloudflare, Namecheap, GoDaddy, etc.), create two **A Records**:
   - `yourdomain.com` &rarr; `YOUR_SERVER_IP`
   - `api.yourdomain.com` &rarr; `YOUR_SERVER_IP`
2. In Coolify, enter the domain in the **Domains** field:
   - For Frontend: `https://yourdomain.com`
   - For Backend: `https://api.yourdomain.com`
3. Click **Deploy**. Coolify will automatically request and install **Let's Encrypt SSL certificates** via Traefik.

---

## 💳 Step 5: Update Paystack Webhooks

In your [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer):
- **Live Webhook URL**: `https://api.yourdomain.com/api/payments/paystack/webhook`
- **Live Callback URL**: `https://yourdomain.com/pay/callback`

---

## 🧪 Step 6: Testing Locally with Docker Desktop

To test the containerized deployment locally on your machine before running on a remote VPS:

```bash
# 1. Build and run all services in background
docker compose up -d --build

# 2. View running containers and logs
docker compose ps
docker compose logs -f

# 3. Access your local deployment
# Frontend: http://localhost:3000
# Backend:  http://localhost:5001/api/test

# 4. Stop containers
docker compose down
```
