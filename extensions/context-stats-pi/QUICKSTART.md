# Quick Start: context-stats-pi Extension

## ✅ Installation Confirmed

The extension is installed at:
```
~/.pi/agent/extensions/context-stats-pi/
```

Pi will auto-discover it on the next startup.

## 🚀 Getting Started (< 2 minutes)

### 1. Start Pi
```bash
pi
```

You should see:
```
✓ context-stats initialized
```

### 2. Watch the Widget
The extension displays a widget above the editor showing:
- **Token usage** as a visual bar (🟢 green to 🔴 red)
- **Model Intelligence (MI)** score (0-100%)
- **Zone indicator** guiding your workflow (Plan/Code/Dump/ExDump/Dead)
- **Token delta** showing change since last refresh

### 3. Try Commands
```
/context-stats
```
Shows a full report of your context usage.

```
/context-compact
```
Recommends whether you should compact based on current zone.

## 📊 Understanding the Display

### Widget Example
```
┌─ Context Stats ─────────────────────────────────────────────┐
│ Tokens: [██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 45%
│         58,000 / 128,000 tokens
│ Model Intelligence: [●●●●●●●●●●●○○○○○○○○○○○○○○○○] 70.0%
│ Zone: 🟡 Code
│ Trend: ▁▂▂▃▄▅▆▇
│ Delta: ▲ +5,200
│ Model: claude-3-5-sonnet
└─────────────────────────────────────────────────────────────┘
```

### What It Means

- **Tokens bar**: Shows how much of your context window is filled
- **MI (70%)**: Model still has 70% capability remaining
- **Zone (Code)**: You're in the "Code" zone - finish current tasks
- **Trend**: Sparkline shows token growth pattern
- **Delta**: +5,200 tokens added since last refresh

## 🎯 Zone Guide

Your workflow changes based on zone:

| Zone | 🟢 Plan | 🟡 Code | 🟠 Dump | 🔴 ExDump | ⚫ Dead |
|------|---------|---------|---------|-----------|--------|
| Action | Plan new tasks | Finish current | Prepare for compact | Compact NOW | New session |
| Context | < 40% | 40-70% | 70-75% | 75-80% | > 80% |

**Current zone tells you:** What should you do right now?

## 💾 Your Data

Context stats are saved to:
```
~/.pi-context-stats/session-<SESSION_ID>.csv
```

This is a CSV file you can analyze:
```bash
# View your latest session
cat ~/.pi-context-stats/*.csv

# Find peak token usage
awk -F, '{print $2}' ~/.pi-context-stats/*.csv | sort -n | tail -1

# Count total snapshots captured
wc -l ~/.pi-context-stats/*.csv
```

## ⚙️ Commands Summary

| Command | Purpose |
|---------|---------|
| `/context-stats` | Full metrics report |
| `/context-compact` | Compaction recommendations |
| `/reload` | Refresh extension if modified |

## 🛠️ Configuration

The extension works out-of-the-box with sensible defaults.

To customize (advanced):
- Edit `~/.pi/agent/extensions/context-stats-pi/index.ts`
- Change zone thresholds in `getZone()` function
- Run `/reload` to apply changes

See [DEVELOPMENT.md](DEVELOPMENT.md) for customization guide.

## ❓ Troubleshooting

**Widget not showing?**
1. Ensure you're in interactive mode (not `pi -p`)
2. Check for "context-stats initialized" notification
3. Run `/reload` to refresh

**No data appearing?**
1. Check `ls ~/.pi-context-stats/`
2. Run `/context-stats` command to trigger data capture
3. Wait 5 seconds for widget to update

**Numbers seem wrong?**
1. Token counts come from the model's response
2. May be approximate due to caching
3. Run `/context-stats` for precise values

## 📚 Learn More

- **Features**: See [README.md](README.md)
- **Full Overview**: See [EXTENSION_SUMMARY.md](EXTENSION_SUMMARY.md)
- **Development**: See [DEVELOPMENT.md](DEVELOPMENT.md)
- **Original Project**: https://github.com/luongnv89/context-stats

## 💡 Pro Tips

1. **Watch the trend line** - Quick visual of token growth pattern
2. **Zone shift = action needed** - When zone changes from Green→Yellow, finish tasks
3. **Delta > 0** - You're adding tokens, monitor growth
4. **Export data** - Use CSV files for analysis in Excel/sheets
5. **Multiple sessions** - Each session gets its own CSV file

## 🎉 Ready?

Start Pi and watch your context window in real-time:
```bash
pi
```

Your context metrics will appear above the editor automatically!

---

**Need help?** Check [DEVELOPMENT.md](DEVELOPMENT.md) or edit the extension files directly.
