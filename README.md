# Pi Extensions & Themes

A curated collection of extensions and themes for [Pi Coding Agent](https://github.com/earendil-works/pi-coding-agent). Share your Pi setup across different environments with ease.

## 📦 Contents

### Extensions

- **context-stats-pi** - Minimal context window monitoring with zone indicators and actionable guidance

### Themes

- **neon-green** - Futuristic neon green theme for Pi

## 🚀 Quick Start

### One-Line Installation

```bash
# Clone the repo
git clone https://github.com/luongnv89/pi-extensions ~/.pi/pi-extensions

# Install all extensions
cp -r ~/.pi/pi-extensions/extensions/* ~/.pi/agent/extensions/

# Install all themes
cp -r ~/.pi/pi-extensions/themes/* ~/.pi/agent/themes/

# Reload Pi
# Open Pi and type: /reload
```

## 📋 Detailed Setup Guide

### Prerequisites

- Pi Coding Agent installed
- Git (for cloning)
- Basic shell/terminal knowledge

### Step 1: Clone the Repository

```bash
# Clone to a convenient location
git clone https://github.com/luongnv89/pi-extensions ~/.pi/pi-extensions

# Or clone elsewhere and reference it
git clone https://github.com/luongnv89/pi-extensions ~/my-pi-setup
```

### Step 2: Install Extensions

Each extension goes into `~/.pi/agent/extensions/`

```bash
# Install a specific extension
cp -r ~/.pi/pi-extensions/extensions/context-stats-pi ~/.pi/agent/extensions/

# Or install all extensions at once
cp -r ~/.pi/pi-extensions/extensions/* ~/.pi/agent/extensions/
```

**Verify installation:**
```bash
ls -la ~/.pi/agent/extensions/
```

### Step 3: Install Themes

Each theme goes into `~/.pi/agent/themes/`

```bash
# Install a specific theme
cp ~/.pi/pi-extensions/themes/neon-green.json ~/.pi/agent/themes/

# Or install all themes at once
cp -r ~/.pi/pi-extensions/themes/* ~/.pi/agent/themes/
```

**Verify installation:**
```bash
ls -la ~/.pi/agent/themes/
```

### Step 4: Reload Pi

Open Pi and reload the configuration:

```
/reload
```

Or restart Pi completely for a clean load.

### Step 5: Verify Everything Works

Check that extensions and themes are loaded:

```
/context-stats    # Test the context-stats extension
```

You should see context usage metrics in your status line.

## 🎨 Theme Configuration

### Using a Theme

Themes are automatically discovered from `~/.pi/agent/themes/`.

To set your preferred theme, check Pi's configuration. Most Pi setups load themes alphabetically or by preference order.

### Available Themes

#### neon-green
- **Style**: Futuristic, cyberpunk-inspired
- **Colors**: Bright neon green accents on dark background
- **Best For**: Long coding sessions, high contrast reading
- **File**: `themes/neon-green.json`

## 🔌 Extension Guide

### context-stats-pi

Real-time context window monitoring with zone indicators.

**Installation:**
```bash
cp -r ~/.pi/pi-extensions/extensions/context-stats-pi ~/.pi/agent/extensions/
```

**What it does:**
- Displays zone indicator (🟢 Plan / 🟡 Code / 🟠 Dump / 🔴 ExDump / ⚫ Dead)
- Shows actionable guidance for each zone
- Updates automatically every 5 seconds
- Saves session data to `~/.pi-context-stats/`

**Zones explained:**
- 🟢 **Plan Zone** - Safe to plan and code (< 40% usage)
- 🟡 **Code Zone** - Finish current task (40-70% usage)
- 🟠 **Dump Zone** - Consider `/compact` (70-75% usage)
- 🔴 **ExDump Zone** - Run `/compact` now (75-80% usage)
- ⚫ **Dead Zone** - Start new session (> 80% usage)

**Available commands:**
```
/context-stats      # Show full usage report
/context-compact    # Get zone-specific recommendations
```

## 📱 Syncing Across Environments

### Setup Script (Recommended)

Create a sync script to manage your setup across machines:

```bash
#!/bin/bash
# save-pi-setup.sh

PI_REPO="$HOME/.pi/pi-extensions"

# Update repo with any local changes
cd "$PI_REPO"
git add .
git commit -m "Sync Pi setup: $(date)"
git push origin main

echo "✅ Pi setup synced to GitHub"
```

### Restore on New Machine

```bash
# 1. Clone the repo
git clone https://github.com/luongnv89/pi-extensions ~/.pi/pi-extensions

# 2. Install all extensions and themes
~/.pi/pi-extensions/install.sh

# 3. Or manually:
cp -r ~/.pi/pi-extensions/extensions/* ~/.pi/agent/extensions/
cp -r ~/.pi/pi-extensions/themes/* ~/.pi/agent/themes/

# 4. Reload Pi
# Open Pi and type: /reload
```

## 🛠️ Manual Installation

If you prefer not to use the copy method, you can create symlinks:

```bash
# Link extensions
ln -s ~/.pi/pi-extensions/extensions/context-stats-pi ~/.pi/agent/extensions/

# Link themes
ln -s ~/.pi/pi-extensions/themes/neon-green.json ~/.pi/agent/themes/
```

Then reload Pi.

## 🐛 Troubleshooting

### Extensions not loading

**Symptom:** Extension doesn't appear after reload

**Solution:**
1. Verify the extension is in `~/.pi/agent/extensions/`:
   ```bash
   ls -la ~/.pi/agent/extensions/
   ```

2. Check for errors:
   ```bash
   /reload
   # Look for error messages
   ```

3. Try manual installation path:
   ```bash
   cp -r ~/.pi/pi-extensions/extensions/context-stats-pi ~/.pi/agent/extensions/context-stats-pi
   /reload
   ```

### Themes not appearing

**Symptom:** Theme doesn't show in Pi theme selection

**Solution:**
1. Verify theme file exists:
   ```bash
   ls -la ~/.pi/agent/themes/neon-green.json
   ```

2. Check file format (should be valid JSON):
   ```bash
   cat ~/.pi/agent/themes/neon-green.json
   ```

3. Restart Pi completely (not just `/reload`)

### Status line not updating

**Symptom:** context-stats extension shows "Unknown zone state"

**Solution:**
1. Reload the extension:
   ```
   /reload
   ```

2. Check notification for "context-stats initialized"

3. Verify Pi is in UI mode (not print-only)

### Permission denied when installing

**Solution:**
```bash
# Ensure pi-extensions directory is readable
chmod -R 755 ~/.pi/pi-extensions

# Ensure target directories are writable
chmod -R 755 ~/.pi/agent/extensions/
chmod -R 755 ~/.pi/agent/themes/
```

## 📝 Directory Structure

```
pi-extensions/
├── README.md                          # This file
├── extensions/
│   └── context-stats-pi/
│       ├── package.json               # Extension metadata
│       ├── index.ts                   # Main logic
│       ├── types.ts                   # TypeScript types
│       ├── state-manager.ts           # State persistence
│       ├── statusline.ts              # Status rendering
│       └── README.md                  # Extension docs
└── themes/
    └── neon-green.json                # Neon green theme
```

## 🔄 Updating

### Pull Latest Changes

```bash
cd ~/.pi/pi-extensions
git pull origin main
```

### Update Extensions

```bash
# Backup current extensions
cp -r ~/.pi/agent/extensions ~/.pi/agent/extensions.backup

# Install latest
cp -r ~/.pi/pi-extensions/extensions/* ~/.pi/agent/extensions/

# Reload Pi
# Open Pi and type: /reload
```

## 🤝 Contributing

Have ideas for new extensions or themes?

1. Create a fork
2. Add your extension/theme to the appropriate directory
3. Update this README with documentation
4. Submit a pull request

## 📦 Adding Your Own Extensions

### Structure

```
extensions/my-extension/
├── package.json
├── index.ts
├── types.ts (if needed)
└── README.md
```

### Steps

1. Create directory in `extensions/`
2. Add your extension files
3. Update main README with description
4. Commit and push

### Example

```bash
# Create new extension
mkdir -p extensions/my-awesome-extension
cd extensions/my-awesome-extension

# Add files...
cat > package.json << 'EOF'
{
  "name": "my-awesome-extension",
  "version": "1.0.0",
  "description": "My awesome Pi extension",
  "type": "module",
  "main": "./index.ts",
  "pi": {
    "extensions": ["./index.ts"]
  }
}
EOF

# Commit
git add .
git commit -m "Add my-awesome-extension"
git push origin main
```

## 📄 License

MIT - Feel free to use and modify for your own setup

## 🔗 Resources

- [Pi Coding Agent](https://github.com/earendil-works/pi-coding-agent)
- [Pi Extensions Documentation](https://github.com/earendil-works/pi-coding-agent/docs/extensions.md)
- [Pi Themes Documentation](https://github.com/earendil-works/pi-coding-agent/docs/themes.md)

## 💡 Tips for Success

1. **Keep it synced** - Run `git pull` regularly to stay updated
2. **Backup before updating** - Copy old extensions before replacing
3. **One reload at a time** - Test extensions individually before adding more
4. **Check logs** - Look for error messages when troubleshooting
5. **Join the community** - Share your setup with other Pi users

## 📧 Support

- Found a bug? Create an issue
- Have questions? Check the troubleshooting section
- Want to contribute? See Contributing section

---

**Happy coding with Pi!** 🚀
