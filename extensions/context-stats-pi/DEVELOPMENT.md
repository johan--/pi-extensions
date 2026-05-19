# Development Guide: context-stats-pi Extension

## Project Structure

```
~/.pi/agent/extensions/context-stats-pi/
├── package.json                 # npm metadata & pi extension config
├── index.ts                     # Main extension (650 lines)
├── types.ts                     # TypeScript interfaces
├── state-manager.ts             # CSV persistence layer
├── statusline.ts                # ASCII rendering & metrics
├── README.md                    # User documentation
├── EXTENSION_SUMMARY.md        # Feature overview
└── DEVELOPMENT.md              # This file
```

## Architecture Overview

### Extension Entry Point (index.ts)

The extension is loaded by Pi's extension system as a default export factory:

```typescript
export default function contextStatsPiExtension(pi: ExtensionAPI) {
  // Register event handlers, commands, and initialize state
}
```

**Key Responsibilities:**
1. Initialize `StateManager` on session start
2. Subscribe to message lifecycle events
3. Render widget on each update
4. Provide CLI commands
5. Cleanup on session shutdown

### Event Lifecycle

```
session_start
  ├─ Create StateManager
  ├─ Load prior CSV state
  └─ Start 5-second update interval

message_end (repeats)
  ├─ Capture ContextSnapshot
  ├─ Record to StateManager
  └─ Update widget

session_shutdown
  └─ Flush StateManager to CSV
```

### State Management

The `StateManager` class handles:
- **Loading**: Reads existing CSV files on init
- **Recording**: Appends snapshots to in-memory entries
- **Rotation**: Auto-rotates when > 10,000 entries (keeps 5,000)
- **Persistence**: Flushes entries to CSV on demand
- **Reporting**: Generates summary metrics

CSV Format (6 fields):
```
timestamp,tokensUsed,contextWindow,model,sessionId,cwd
```

### Rendering

The `renderStatusline()` function creates ASCII widget lines:

```
┌─ Context Stats ─────────────────────────────────────────────┐
│ Tokens: [██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 35%
│         45,000 / 128,000 tokens
│ Model Intelligence: [●●●●●●●●●●○○○○○○○○○○○○○○○○○○○○] 76.5%
│ Zone: 🟡 Code
│ Trend: ▁▂▃▄▅▆▇█
│ Delta: ▲ +2,500
│ Model: claude-3-5-sonnet
└─────────────────────────────────────────────────────────────┘
```

Each element is independently calculated and updates on each render.

## Key Calculations

### Model Intelligence (MI)

```typescript
function calculateMI(snapshot: ContextSnapshot): number {
  const beta = getModelProfile(snapshot.model);
  const mi = Math.max(0, 1 - Math.pow(snapshot.contextUsageRatio, beta));
  return mi;
}
```

**Formula:** `MI = max(0, 1 - u^β)`
- `u` = context usage ratio (0-1)
- `β` = model-specific parameter

**Profiles:**
- Opus: 1.8 (high quality retention)
- Sonnet: 1.5 (baseline)
- Haiku: 1.2 (lower retention)

**Color Thresholds:**
- ≥ 80%: 🟢 Green (excellent)
- 60-80%: 🟡 Yellow (good)
- < 60%: 🔴 Red (degraded)

### Zone Calculation

```typescript
function getZone(contextUsageRatio: number, contextWindow: number): string {
  if (contextWindow >= 500_000) {
    // 1M-class thresholds (in absolute tokens)
    const used = contextWindow * contextUsageRatio;
    if (used < 150_000) return "Plan";
    // ...
  } else {
    // Standard model thresholds (as percentage)
    if (contextUsageRatio < 0.4) return "Plan";
    // ...
  }
}
```

**Standard Models (< 500k window):**
- Plan: < 40%
- Code: 40-70%
- Dump: 70-75%
- ExDump: 75-80%
- Dead: ≥ 80%

**1M-Class Models (≥ 500k window):**
- Plan: < 150k tokens
- Code: 150k-250k
- Dump: 250k-400k
- ExDump: 400k-450k
- Dead: ≥ 450k

## Extension API Usage

### Event Subscriptions

```typescript
pi.on("session_start", async (event, ctx) => {
  // Initialize state manager
  const sessionId = ctx.sessionManager.getSessionFile?.()
    ? path.basename(sessionFile, ".jsonl")
    : "ephemeral";
  stateManager = new StateManager(STATE_DIR, sessionId, ctx.cwd);
});

pi.on("message_end", async (event, ctx) => {
  // Capture metrics after assistant response
  if (message.usage) {
    const snapshot = captureSnapshot(ctx, message.usage);
    stateManager.recordSnapshot(snapshot);
  }
});
```

### Context Usage API

```typescript
// Get current context usage
const usage = ctx.getContextUsage?.();
// Returns: { tokens: number } or undefined

// Get model information
const model = ctx.model;
// Fields: id, provider, contextWindow, ...
```

### Widget Rendering

```typescript
// Set widget above editor (default)
ctx.ui.setWidget("context-stats", lines, { placement: "aboveEditor" });

// Set footer status
ctx.ui.setStatus(
  "context-stats",
  ctx.ui.theme.fg("success", "MI: 80% | Zone: Code | 45k/128k tokens")
);

// Show notifications
ctx.ui.notify("context-stats initialized", "info");
```

## Modifying the Extension

### Add a New Command

```typescript
pi.registerCommand("my-command", {
  description: "What this does",
  handler: async (args, ctx) => {
    const data = stateManager.getEntries();
    // Process and display results
    ctx.ui.notify(`Result: ${data.length} entries`, "info");
  },
});
```

### Change Zone Thresholds

Edit the `getZone()` function in `index.ts`:

```typescript
function getZone(contextUsageRatio: number, contextWindow: number): string {
  if (contextUsageRatio < 0.35) return "🟢 Plan";  // Lower threshold
  if (contextUsageRatio < 0.65) return "🟡 Code";  // Adjusted
  // ...
}
```

### Customize Widget Appearance

Edit `renderStatusline()` in `statusline.ts`:

```typescript
// Change box style
lines.push("╭─ Context Stats ─────────────────────────────╮"); // Curved corners
lines.push("│ ...");
lines.push("╰─────────────────────────────────────────────╯");
```

### Add Cost Estimation

```typescript
function estimateCost(tokens: number, modelId: string): number {
  const PRICING = {
    "opus": { input: 0.015, output: 0.075 },
    "sonnet": { input: 0.003, output: 0.015 },
  };
  // Calculate and return cost
}
```

### Change Update Frequency

In `session_start` event:
```typescript
// Change from 5000ms
updateInterval = setInterval(() => {
  updateStatusline(ctx);
}, 2000); // Update every 2 seconds instead
```

## Testing

### Test with Explicit Extension

```bash
pi -e ~/.pi/agent/extensions/context-stats-pi/index.ts
```

### Test After Changes

1. Edit files in `~/.pi/agent/extensions/context-stats-pi/`
2. Run `/reload` in Pi to refresh extension
3. Watch for errors in Pi output
4. Check widget updates appear

### Debug CSV Writing

```bash
# Watch for new entries
tail -f ~/.pi-context-stats/session-*.csv

# Parse and count entries
wc -l ~/.pi-context-stats/session-*.csv

# Extract specific fields
awk -F, '{print $2, $3}' ~/.pi-context-stats/session-*.csv | head -10
```

### Verify State Manager

Add temporary logging in `state-manager.ts`:

```typescript
recordSnapshot(snapshot: ContextSnapshot): void {
  console.error(`[StateManager] Recording: ${snapshot.tokensUsed} tokens`);
  // ...
}
```

## Common Customizations

### Adjust MI Color Thresholds

In `renderStatusline()`:
```typescript
function createMIBar(mi: number): string {
  // Current: 80% green, 60% yellow
  // To change: modify color logic in component
  if (mi > 0.75) color = "green";  // Was 0.80
  else if (mi > 0.50) color = "yellow";  // Was 0.60
  // ...
}
```

### Change Widget Placement

```typescript
// Currently: "aboveEditor" (default)
ctx.ui.setWidget("context-stats", lines, { placement: "belowEditor" });
```

### Disable Auto-Updates

In `session_start`:
```typescript
// Comment out interval setup
// if (updateInterval) clearInterval(updateInterval);
// updateInterval = setInterval(...);
```

### Add Session Persistence

```typescript
pi.on("session_shutdown", async (event, ctx) => {
  stateManager.flush();
  
  // Also save extension state
  pi.appendEntry("context-stats-metadata", {
    lastUpdate: Date.now(),
    entriesCount: stateManager.getEntries().length,
  });
});
```

## Type Safety

The extension uses TypeScript for runtime safety:

```typescript
// Types are checked at extension load time
const snapshot: ContextSnapshot = {
  timestamp: Date.now(),
  tokensUsed: 45000,
  contextWindow: 128000,
  contextUsageRatio: 0.35,
  model: "claude-3-5-sonnet",
  sessionId: "session-abc",
  cwd: "/project",
};
```

## Performance Considerations

### CSV Rotation
- Triggers at 10,000 entries (≈ 8 hours of 5-second updates)
- Keeps 5,000 most recent entries
- Prevents unbounded memory growth

### Widget Updates
- Only rendered when not idle
- 5-second debounce interval
- Minimal DOM updates (widget replacement)

### Event Handling
- Message events are async but don't block
- Snapshot capture is O(1)
- CSV append is buffered in-memory

## Debugging

### Enable Verbose Logging

```typescript
// Add to index.ts
pi.on("message_end", async (event, ctx) => {
  console.error(`[context-stats] Message end:`, {
    tokens: event.message.usage?.input_tokens,
    output: event.message.usage?.output_tokens,
  });
  // ...
});
```

### Monitor CSV Writes

```bash
# Watch real-time writes
tail -f ~/.pi-context-stats/*.csv | grep -E "^[0-9]"

# Check file rotation
ls -lh ~/.pi-context-stats/
```

### Inspect State Manager

```typescript
// In any handler
console.error(`[StateManager] entries:`, stateManager.getEntries().length);
console.error(`[StateManager] latest:`, stateManager.getEntries().slice(-1));
```

## Contributing

To improve the extension:

1. **Fork or branch** the extension directory
2. **Make changes** to relevant files
3. **Test thoroughly** with `/reload`
4. **Document changes** in code comments
5. **Update README.md** if user-facing
6. **Submit PR** or share improvements

## Known Limitations

- ⚠️ Token counts rely on model's `usage` field (may be approximate)
- ⚠️ Context usage API only available during active turns
- ⚠️ CSV format is Pi-specific (not compatible with context-stats Python format)
- ⚠️ No cost calculation (requires API pricing config)
- ⚠️ Widget doesn't appear in print mode (`-p` flag)

## Future Roadmap

- [ ] Cost estimation with pricing data
- [ ] Multi-session comparison dashboard
- [ ] Auto-compaction triggers
- [ ] Custom theme support
- [ ] Integration with Pi compaction events
- [ ] Performance trend analysis
- [ ] Historical graph view
- [ ] Export to different formats (JSON, SQL)

---

**Happy coding!** 🚀 Feel free to customize and improve the extension.
