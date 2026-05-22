# 🚀 Push to GitHub - Step by Step

Your pi-extensions repository is ready locally! Follow these steps to push it to GitHub.

## Step 1: Create a New Repository on GitHub

1. Go to https://github.com/new
2. **Repository name**: `pi-extensions`
3. **Description**: "Collection of extensions and themes for Pi Coding Agent"
4. **Visibility**: Choose Public (so others can use it) or Private
5. **Initialize**: Leave unchecked (we already have commits)
6. Click **Create repository**

## Step 2: Add Remote and Push

After creating the repo on GitHub, you'll see instructions. Run these commands:

```bash
cd ~/pi-extensions

# Add the remote (replace USERNAME if different)
git remote add origin https://github.com/luongnv89/pi-extensions.git

# Verify the remote was added
git remote -v
# Should show:
# origin  https://github.com/luongnv89/pi-extensions.git (fetch)
# origin  https://github.com/luongnv89/pi-extensions.git (push)

# Push the main branch
git branch -M main
git push -u origin main
```

## Step 3: Verify on GitHub

1. Go to https://github.com/luongnv89/pi-extensions
2. You should see all your files and the initial commit
3. Check the README displays correctly

## 🎉 Done!

Your repository is now public and ready for others to use!

### Share the repo:

**Installation command for others (one-liner):**
```bash
curl -fsSL https://raw.githubusercontent.com/luongnv89/pi-extensions/main/install.sh | bash -s -- --auto
```

**Or point them to:** https://github.com/luongnv89/pi-extensions

## 📝 Quick Commands Reference

```bash
# One-liner install (recommended)
curl -fsSL https://raw.githubusercontent.com/luongnv89/pi-extensions/main/install.sh | bash -s -- --auto

# Or clone and install
mkdir -p ~/.pi && cd ~/.pi
git clone https://github.com/luongnv89/pi-extensions pi-extensions
cd pi-extensions
./install.sh --auto

# Update to latest
cd ~/.pi/pi-extensions
git pull origin main
./install.sh --auto

# Add a new extension
mkdir -p extensions/my-extension
# ... add files ...
git add extensions/my-extension/
git commit -m "Add my-extension"
git push origin main

# Add a new theme
cp my-theme.json themes/
git add themes/my-theme.json
git commit -m "Add my-theme"
git push origin main
```

---

Need help? Check the README.md in the repository!
