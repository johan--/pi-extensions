# context-stats-pi: Pi Extension for Context Window Monitoring

## Overview

I've created a complete Pi extension that brings the real-time context monitoring functionality from `context-stats` to Pi (the coding agent). This extension provides live ASCII graphs, Model Intelligence metrics, zone indicators, and session state persistence—all integrated into Pi's UI.

## What Was Created

### Files Structure
```
~/.pi/agent/extensions/context-stats-pi/
├── index.ts              # Main extension with event handlers & commands
├── types.ts              # TypeScript interfaces
├── state-manager.ts      # CSV persistence & state management
├── statusline.ts         # ASCII graph & metric rendering
├── package.json          # Extension metadata
└── README.md            # Complete documentation
```

### Key Components

#### 1. **Main Extension (index.ts)** - 200+ lines
- **Event Handlers:**
  - `session_start` - Initialize state manager and periodic updates
  - `message_end` - Capture token usage from assistant responses
  - `tool_result` - Update on tool execution
  - `session_shutdown` - Clean up and persist state

- **Commands:**
  - `/context-stats` - Full context usage report
  - `/context-compact` - Compaction recommendations

- **Widget & Status:**
  - Live widget above editor (updates every 5 seconds)
  - Status footer showing MI, zone, and token count

#### 2. **State Manager (state-manager.ts)** - 150+ lines
- CSV-based persistence (compatible with context-stats format)
- Entry rotation (10,000 line threshold, keeps 5,000 recent)
- Duplicate detection
- Report generation
- Stored at: `~/.pi-context-stats/session-<ID>.csv`

#### 3. **Statusline Rendering (statusline.ts)** - 140+ lines
- ASCII token usage bar
- Model Intelligence score with visual bar
- Zone indicator (🟢 Plan / 🟡 Code / 🟠 Dump / 🔴 ExDump / ⚫ Dead)
- Mini sparkline trend graph
- Delta tracking (change since last)
- Boxed layout with borders

#### 4. **Type Definitions (types.ts)**
- `ContextSnapshot` - Current context state
- `StateEntry` - Persistent CSV entry
- `Report` - Summary metrics

## Features

### 📊 Live Context Monitoring
```
┌─ Context Stats ─────────────────────────────────────────────┐
│ Tokens: [██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 35%
│         45,000 / 128,000 tokens
│ Model Intelligence: [●●●●●●●●●●○○○○○○○○○○○○○○○○○○○○] 76.5%
│ Zone: 🟡 Code
│ Trend: ▁▂▃▄▅▆▇█
│ Delta: ▲ +2,500
│ Model: claude-3-5-sonnet
└─────────────────────────────────────────────────────────────┘
```

### 🧠 Model Intelligence (MI)
- Measures model capability as context fills
- Model-specific degradation curves:
  - **Opus**: Retains quality longer (β=1.8)
  - **Sonnet**: Baseline (β=1.5)
  - **Haiku**: Degrades faster (β=1.2)
- Formula: `MI = max(0, 1 - usage_ratio^β)`

### 🎯 Zone Indicators
Guidance for workflow decisions:

| Zone | Standard | 1M-Class | Action |
|------|----------|----------|--------|
| 🟢 Plan | < 40% | < 150k | New tasks safe |
| 🟡 Code | 40-70% | 150k-250k | Finish current |
| 🟠 Dump | 70-75% | 250k-400k | Prepare compaction |
| 🔴 ExDump | 75-80% | 400k-450k | Compact now |
| ⚫ Dead | ≥ 80% | ≥ 450k | New session |

### 📈 Data Tracking
- Token consumption snapshots
- Usage trends and deltas
- Peak usage metrics
- Model and session metadata
- Historical analysis via CSV files

### 💾 State Persistence
- CSV format at `~/.pi-context-stats/`
- Auto-rotation at 10,000 lines (keeps 5,000)
- Compatible with existing context-stats tools
- Session-based file naming

## Installation

### Global (All Projects)
```bash
# Already installed at:
~/.pi/agent/extensions/context-stats-pi/

# Pi will auto-discover it on startup
```

### Use in Specific Project
```bash
# Copy to project .pi folder:
cp -r ~/.pi/agent/extensions/context-stats-pi .pi/extensions/

# Or manually create:
mkdir -p .pi/extensions/context-stats-pi
cp ~/.pi/agent/extensions/context-stats-pi/* .pi/extensions/context-stats-pi/
```

## Usage

### Automatic Display
The widget appears automatically above the editor once loaded:
1. Look for "context-stats initialized" notification on session start
2. Widget refreshes every 5 seconds when Pi is idle
3. Status footer shows real-time MI and zone

### Commands

**View current metrics:**
```
/context-stats
```

Output:
```
Context Stats Report
━━━━━━━━━━━━━━━━━━━━━
Current: 45,000 / 128,000 tokens
Peak: 52,000 tokens
Average: 38,000 tokens
Trend: increasing
Model: claude-3-5-sonnet
Entries: 42
```

**Get compaction guidance:**
```
/context-compact
```

Output varies by zone:
- 🟢 Plan: "Safe to plan and code"
- 🟡 Code: "Avoid starting new tasks; finish current one"
- 🟠 Dump: "Consider `/compact focus on X` or delegate to subagent"
- 🔴 ExDump: "Run `/compact` now before quality degrades further"
- ⚫ Dead: "Start a new session with `/clear`"

### Reload Extension
```
/reload
```

Refreshes the extension without restarting Pi.

## Architecture

### Data Flow
```
Pi Session Starts
    ↓
StateManager initializes (loads prior CSV)
    ↓
message_end event fires (when assistant responds)
    ↓
Capture ContextSnapshot (tokens, model, usage%)
    ↓
Record to StateManager
    ↓
Render statusline widget (ASCII graphs + metrics)
    ↓
Update widget above editor
    ↓
Periodic refresh every 5 seconds (if idle)
    ↓
Session ends → Flush CSV to disk
```

### State Persistence
```
Message event → StateManager.recordSnapshot()
    ↓
StateEntry added to in-memory array
    ↓
Auto-rotate if entries > 10,000
    ↓
session_shutdown → StateManager.flush()
    ↓
CSV written to ~/.pi-context-stats/session-<ID>.csv
```

## CSV Format

**Location:** `~/.pi-context-stats/session-<SESSION_ID>.csv`

**Format:**
```
timestamp,tokensUsed,contextWindow,model,sessionId,cwd
1710288000,45000,128000,claude-3-5-sonnet,abc-123-def,/home/user/project
```

**Example Analysis:**
```bash
# View all sessions
ls ~/.pi-context-stats/

# Extract peak usage
awk -F, '{print $2}' ~/.pi-context-stats/session-*.csv | sort -n | tail -1

# Track model performance
grep "opus" ~/.pi-context-stats/*.csv | wc -l
```

## Differences from context-stats

### context-stats (Claude Code)
- Reads from Claude Code statusline pipe
- Stores at `~/.claude/statusline/statusline.<ID>.state`
- 14-field CSV format (includes costs, git info)
- Inline statusline rendering

### context-stats-pi (Pi Agent)
- Reads from Pi event system (`message_end`, `getContextUsage()`)
- Stores at `~/.pi-context-stats/session-<ID>.csv`
- 6-field CSV format (core metrics only)
- Widget + status footer rendering
- Commands: `/context-stats`, `/context-compact`

## Customization

The extension uses sensible defaults but can be customized:

### To Modify Zone Thresholds
Edit `index.ts` in the `getZone()` function:
```typescript
function getZone(contextUsageRatio: number, contextWindow: number): string {
  // Adjust thresholds here
  if (contextUsageRatio < 0.35) return "🟢 Plan"; // Changed from 0.40
  // ...
}
```

### To Change Widget Placement
Edit `index.ts` in `updateStatusline()`:
```typescript
// Change placement: "aboveEditor" | "belowEditor"
ctx.ui.setWidget("context-stats", lines, { placement: "belowEditor" });
```

### To Adjust Update Frequency
Edit `index.ts` session_start:
```typescript
// Change from 5000ms (5 seconds)
updateInterval = setInterval(() => { ... }, 3000); // 3 seconds
```

## Troubleshooting

### Widget not showing
1. Ensure you're in interactive mode (not print mode `-p`)
2. Check notification: should see "context-stats initialized"
3. Verify extension loaded: run `/reload`

### No data in CSV files
1. Check directory: `ls ~/.pi-context-stats/`
2. Check permissions: `ls -la ~/.pi-context-stats/`
3. Look for errors: watch Pi console output

### Token counts seem wrong
- Token counts come from model's `usage` field
- May be approximate or use cache estimates
- Run `/context-stats` to see full metrics

### Extension not loading
1. Verify file permissions: `chmod +x ~/.pi/agent/extensions/context-stats-pi/*`
2. Check TypeScript syntax: run `/reload` twice
3. Delete state files and retry: `rm ~/.pi-context-stats/*`

## Next Steps / Future Enhancements

Potential improvements:
- 📊 Cost estimation with pricing tiers
- 📈 Multi-session comparison
- 🚨 Auto-compaction triggers at thresholds
- 🎨 Customizable colors and themes
- 📱 Mobile-friendly views
- 🔄 Integration with compaction events
- 💹 Performance trend analysis
- 🎯 Dynamic MI recalibration

## Related Resources

- **Original Project**: [context-stats GitHub](https://github.com/luongnv89/context-stats)
- **Pi Extensions Guide**: `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md`
- **Session Format**: `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/session-format.md`

## License

MIT - Same as context-stats project

---

## Quick Start

1. **Extension is already installed** at `~/.pi/agent/extensions/context-stats-pi/`
2. **Start Pi** - You'll see "context-stats initialized"
3. **Watch the widget** appear above the editor
4. **Use commands**:
   - `/context-stats` - View full report
   - `/context-compact` - Get compaction advice
5. **Check CSV files** at `~/.pi-context-stats/`

Enjoy real-time context monitoring! 🎉
