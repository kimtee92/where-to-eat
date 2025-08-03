# CI/CD Setup Guide for Heroku Deployment

## 🎉 Current Status: READY TO DEPLOY!

✅ **Build**: Successful (✓ Compiled successfully in 3.0s)  
✅ **Linting**: Passing (warnings only, non-blocking)  
✅ **CI/CD**: Configured and ready  
✅ **Config**: All environment variables ready  

## 🚀 Automated Deployment with GitHub Actions

This setup automatically deploys your app to Heroku whenever you push to the `main` branch.

## 📋 Prerequisites

1. **Heroku Account** (verified with payment method)
2. **GitHub Repository** (your current repo)
3. **API Keys** ready

## 🔧 Setup Steps

### 1. Create Heroku App
```bash
# Login to Heroku CLI
heroku login

# Create your app (replace with your desired name)
heroku create your-app-name
```

### 2. Get Heroku API Key
```bash
# Get your API key
heroku auth:token
```

### 3. Setup GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these **Repository Secrets**:

| Secret Name | Value | Example |
|-------------|--------|---------|
| `HEROKU_API_KEY` | Your Heroku API token | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `HEROKU_APP_NAME` | Your Heroku app name | `where-to-eat-finder` |
| `HEROKU_EMAIL` | Your Heroku account email | `your-email@example.com` |
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://...` |
| `CLAUDE_API_KEY` | Your Claude API key | `sk-ant-api03-...` |
| `GOOGLE_PLACES_API_KEY` | Your Google Places API key | `AIzaSy...` |

### 4. Push to Main Branch
```bash
# Commit and push your changes
git add .
git commit -m "Setup CI/CD for Heroku deployment"
git push origin main
```

## 🔄 How It Works

### Continuous Integration (CI)
1. **Trigger**: Push to `main` branch or PR
2. **Test Job**: 
   - Install dependencies
   - Run linter
   - Build application
   - Verify no errors

### Continuous Deployment (CD)
1. **Trigger**: Successful CI on `main` branch
2. **Deploy Job**:
   - Deploy code to Heroku
   - Set all config vars automatically
   - Run health check
   - Verify deployment

## 📊 Workflow Features

- ✅ **Automated Testing** - Runs lint and build checks
- ✅ **Config Vars Management** - Automatically sets Heroku environment variables
- ✅ **Health Checks** - Verifies deployment success
- ✅ **Branch Protection** - Only deploys from `main` branch
- ✅ **PR Testing** - Tests pull requests without deploying

## 🌐 Environment Variables

The workflow automatically sets these Heroku config vars:

```env
NODE_ENV=production
MONGODB_URI=<from-github-secrets>
CLAUDE_API_KEY=<from-github-secrets>
CLAUDE_MODEL=claude-3-5-haiku-20241022
CLAUDE_MAX_TOKENS=1000
GOOGLE_PLACES_API_KEY=<from-github-secrets>
GOOGLE_MAPS_API_KEY=<from-github-secrets>
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=<from-github-secrets>
```

## 📝 Development Workflow

### For Feature Development:
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... code changes ...

# Push feature branch
git push origin feature/new-feature

# Create PR → GitHub Actions runs tests
# Merge PR → Automatic deployment to Heroku
```

### For Hotfixes:
```bash
# Push directly to main for urgent fixes
git checkout main
git add .
git commit -m "hotfix: urgent fix"
git push origin main
# → Automatic deployment
```

## 🔍 Monitoring

### Check Deployment Status:
- **GitHub**: Actions tab in your repository
- **Heroku**: Dashboard or `heroku logs --tail --app your-app-name`

### Deployment URLs:
- **App**: `https://your-app-name.herokuapp.com`
- **Health Check**: `https://your-app-name.herokuapp.com/api/health/claude`

## 🛠️ Manual Commands (if needed)

```bash
# View Heroku config
heroku config --app your-app-name

# Set config var manually
heroku config:set KEY=value --app your-app-name

# View logs
heroku logs --tail --app your-app-name

# Restart app
heroku restart --app your-app-name
```

## 🔒 Security Best Practices

- ✅ **Secrets Management** - All sensitive data in GitHub Secrets
- ✅ **No Hardcoded Keys** - Environment variables only
- ✅ **Branch Protection** - Deploy only from protected main branch
- ✅ **PR Reviews** - Test changes before deployment

## 🎉 Benefits

- **Zero Downtime**: Automatic deployments
- **Quality Assurance**: Every change is tested
- **Fast Feedback**: Immediate deployment status
- **Easy Rollbacks**: Git-based versioning
- **Team Collaboration**: PR-based workflow

Your restaurant finder now has enterprise-grade CI/CD! 🚀
