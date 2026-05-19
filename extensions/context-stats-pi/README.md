# context-stats-pi Extension

Minimal context window monitoring for Pi with zone indicators and actionable guidance. Displays zone status in the status line at the bottom of your editor.

## Features

- **Zone Indicators** - Color-coded zones (🟢 Plan / 🟡 Code / 🟠 Dump / 🔴 ExDump / ⚫ Dead) 
- **Actionable Guidance** - Each zone shows what you should do next
- **No Clutter** - Single-line display in status bar (below editor)
- **Auto-Updates** - Refreshes every 5 seconds during work
- **Session Persistence** - State saved to `~/.pi-context-stats/` for analysis

## Installation

### Via Installation Command (Easiest)

```bash
npx skills add https://github.com/YOUR_USERNAME/context-stats-pi --skill context-stats
```

### Manual Installation

#### Global
```bash
git clone https://github.com/YOUR_USERNAME/context-stats-pi ~/.pi/agent/extensions/context-stats-pi
```

#### Project-Local
```bash
git clone https://github.com/YOUR_USERNAME/context-stats-pi .pi/extensions/context-stats-pi
```

Then reload Pi with `/reload`.

## Usage

Once installed, the extension automatically displays in your Pi status line:

```
🟢 Plan Zone — Safe to plan and code
🟡 Code Zone — Finish current task
🟠 Dump Zone — Consider `/compact` or subagent
🔴 ExDump Zone — Run `/compact` now
⚫ Dead Zone — Start new session with `/clear`
```

### Commands

#### `/context-stats`
Shows a full context usage report with historical data.

#### `/context-compact`
Displays zone-specific recommendations for your current context state.

## Understanding the Zones

### Standard Models (≤ 500k context window)
- **🟢 Plan** (< 40% used) - Safe to plan and code. Plenty of space for new context.
- **🟡 Code** (40-70% used) - Finish current task. Avoid starting new tasks.
- **🟠 Dump** (70-75% used) - Getting tight. Consider `/compact` or delegate to subagent.
- **🔴 ExDump** (75-80% used) - Critical. Run `/compact` now before quality degrades.
- **⚫ Dead** (≥ 80% used) - Start a new session with `/clear` to continue working.

### 1M+ Context Models
- **🟢 Plan** (< 150k tokens) - Safe to plan and code.
- **🟡 Code** (150k-250k tokens) - Finish current task.
- **🟠 Dump** (250k-400k tokens) - Consider compaction.
- **🔴 ExDump** (400k-450k tokens) - Compact now.
- **⚫ Dead** (≥ 450k tokens) - New session needed.

## Data Storage

### CSV State Files
Located at `~/.pi-context-stats/session-<SESSION_ID>.csv`

Format:
```
timestamp,tokensUsed,contextWindow,model,sessionId,cwd
1710288000,45000,128000,claude-3-5-sonnet,abc-123-def,/path/to/project
```

## How It Works

1. **Session Start**: Extension initializes state manager
2. **Message End**: Captures token usage from assistant responses
3. **Periodic Updates**: Refreshes zone display every 5 seconds
4. **State Persistence**: Snapshots saved to CSV for historical analysis
5. **Session Shutdown**: Flushes remaining data

## Troubleshooting

### Status line not showing
1. Verify extension loaded: look for "context-stats initialized" notification
2. Try `/reload` to reinitialize the extension
3. Check that Pi is running in UI mode (not print-only)

### No data in CSV
1. Verify `~/.pi-context-stats/` directory exists
2. Check file permissions: `ls -la ~/.pi-context-stats/`
3. Look for error messages in Pi logs

## Project Structure

```
context-stats-pi/
├── package.json          # Extension metadata
├── index.ts              # Main extension logic
├── types.ts              # TypeScript interfaces
├── state-manager.ts      # CSV persistence & state
├── statusline.ts         # Status line rendering
└── README.md             # This file
```

## Hot Reload

Make changes and press `/reload` in Pi to refresh without restarting.

## License

MIT

## Contributing

Issues and PRs welcome! Ideas:
- Custom zone boundaries
- Cost estimation features
- Multi-session comparison
- Performance optimizations

## Related

- [context-stats](https://github.com/luongnv89/context-stats) - Original project for Claude Code
- [Pi Documentation](https://github.com/earendil-works/pi-coding-agent) - Extension API reference
