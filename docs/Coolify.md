# 🐳 Deploying & Testing La-Minks on Coolify (Local & VPS Setup)

Here is the exact step-by-step procedure to get **Coolify** running on your local computer, connected to your GitHub account, and hosting your full-stack applications.

---

## 🏗️ Architecture Overview

```mermaid
graph LR
    User([Browser: localhost:8080]) -->|Traefik Proxy / Standalone| Frontend[Next.js 15 App]
    Frontend -->|NEXT_PUBLIC_API_URL| Backend[Express API: localhost:8081]
    Backend -->|Mongoose Pool| MongoAtlas[(MongoDB Atlas)]
    CoolifyUI[Coolify Dashboard: localhost:8000] -->|Manage Containers| DockerEngine[Docker Desktop Engine]
    CoolifyUI -->|Manual Pull / Git| GitHub[GitHub: Malopex7/la-minks]
```

---

## 📋 Step 1: Install Docker Desktop
Coolify requires [Docker](https://www.docker.com/) to build and run your applications.
1. Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for your specific operating system (Windows, Mac, or Linux).
2. Open Docker Desktop and ensure the engine is fully running (the small whale icon in the corner should turn green).

---

## 💻 Step 2: Install Coolify via Terminal
You will download and launch Coolify with a single terminal command:

### On Windows (via WSL / Ubuntu or Git Bash):
Open your terminal (**Ubuntu** or **Git Bash**) and run:
```bash
curl -fsSL https://cdn.coolify.io/coolify/install.sh | bash
```

### On Mac / Linux:
Open the Terminal app and paste:
```bash
curl -fsSL https://cdn.coolify.io/coolify/install.sh | bash
```

1. Wait 2 to 3 minutes for Docker to download the necessary Coolify packages.
2. Once finished, open your web browser and navigate to: **`http://localhost:8000`**
3. Create your initial admin account by entering an email and password.

---

## 🔗 Step 3: Create a GitHub App Integration
To pull code automatically like Render and Vercel do, Coolify needs a secure connection to your GitHub profile:

1. Inside your Coolify dashboard, navigate to **Sources** on the left menu and click **Add New Source**.
2. Select **GitHub App**.
3. Give your source a recognizable name (e.g., `Local-GitHub`).
4. Click **Register GitHub App**. This will redirect you straight to GitHub.
5. Choose your personal profile or organization, name the app, and click **Save**.
6. GitHub will automatically redirect you back to Coolify with the connection established.

---

## 🚀 Step 4: Deploy Your Project

Now that GitHub is connected, deploying the full-stack app is straightforward:

1. On the Coolify dashboard home page, click **Keys & Sources** or go straight to **Projects** and click **Add New Project**.
2. Click **+ Add Environment** (such as `production`).
3. Click **+ Add New Resource** and select **Public/Private Repository (GitHub)**.
4. Select your newly connected GitHub source, pick your code repository (`Malopex7/la-minks`), and select your target deployment branch (`master`).
5. Coolify will auto-detect your project type via [`docker-compose.yml`](file:///f:/cursor-dev/la-minks/docker-compose.yml) or Dockerfiles and display a **Deploy** button.

---

## 🔐 Step 5: Environment Variables Reference

In Coolify's **Environment Variables** tab for the project, add the following variables:

### Backend Variables:
```env
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://bxmalope_db_user:XBEsOAvF6R0bEgCO@laminks.8wnmsnz.mongodb.net/la-minks-db?retryWrites=true&w=majority
JWT_SECRET=79a9d3735e8ed21832ff5a3f02ce3855a0e8185266b04cd00d80f5d337785e34a71712c1
JWT_REFRESH_SECRET=79a9d3735e8ed21832ff5a3f02ce3855a0e8185266b04cd00d80f5d337785e34a71712c1_refresh
FRONTEND_URL=http://localhost:8080

# Paystack Payment Gateway
PAYSTACK_PUBLIC_KEY=pk_test_2c295861bffdb0881573eaa45bfa882bd12b9f09
PAYSTACK_SECRET_KEY=sk_test_9cd91a43be741ac05502a32cd8a8860fae846bd5

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Nodemailer / SMTP Email Delivery
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=malopex.dev@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="La-Minks Cleaning Services <info@laminks.co.za>"
```

### Frontend Build & Runtime Variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api
NEXT_PUBLIC_PAYSTACK_KEY=pk_test_2c295861bffdb0881573eaa45bfa882bd12b9f09

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDWnjm6rzaX8tPLPh_mHB0TnIzkxXedS7c
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=la-minks.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=la-minks
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=la-minks.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=245034365588
NEXT_PUBLIC_FIREBASE_APP_ID=1:245034365588:web:65afc6ac082afc0e59ba81
```

---

## 💡 Local Testing Pro-Tip: Manual Triggers

Because your computer sits securely behind a home router firewall, GitHub cannot send automated "webhook" network pings back to your machine when you run a `git push`.

To deploy your latest updates locally:
1. Open your Coolify web browser panel at **`http://localhost:8000`**.
2. Open your project.
3. Click the manual **Deploy** button. It will instantly pull your fresh GitHub changes and rebuild your application.

---

## 🌐 Moving from Local to a Production VPS (When Ready)

When you are ready to subscribe to a VPS (e.g., Hetzner, DigitalOcean, Linode):
1. Run the same install command on your VPS:
   ```bash
   curl -fsSL https://cdn.coolify.io/coolify/install.sh | bash
   ```
2. Point your domain's DNS `A Record` to your VPS IP (`laminks.co.za` &rarr; `VPS_IP`).
3. Set your domains in Coolify (`https://laminks.co.za` and `https://api.laminks.co.za`).
4. Traefik inside Coolify will automatically generate free Let's Encrypt SSL certificates!
