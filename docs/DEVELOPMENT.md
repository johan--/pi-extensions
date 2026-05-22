# Developer Guide

## Architecture

Pi Extensions is a collection of side-loadable extensions and themes for Pi Coding Agent. Extensions hook into Pi's event system and UI rendering pipeline; themes provide color tokens consumed by the TUI renderer.

```
pi-extensions/
├── extensions/
│   └── statusline-pi/
│       ├── package.json          # Extension metadata, pi entry point
│       └── index.ts              # Default export → ExtensionAPI handler
├── themes/
│   ├── neon-green.json           # Dark theme
│   └── neon-green-light.json     # Light variant
├── install.sh                    # Interactive/automated installer
└── package.json                  # npm convenience scripts
```

## Extension API

Extensions export a default function receiving an `ExtensionAPI` instance:

```ts
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

export default function myExtension(pi: ExtensionAPI) {
  // ...
}
```

### Key Types

| Import                    | Description                            |
|---------------------------|----------------------------------------|
| `ExtensionAPI`            | API surface for registering commands, events |
| `ExtensionContext`        | Session context passed to event handlers     |

### ExtensionContext Properties

| Property       | Type   | Description                              |
|----------------|--------|------------------------------------------|
| `ctx.cwd`      | string | Current working directory                |
| `ctx.model`    | object | Current model info (id, provider, contextWindow, reasoning) |
| `ctx.hasUI`    | boolean | Whether TUI mode is active              |
| `ctx.ui.theme` | object | Theme token resolver (fg, bg methods)    |

### ExtensionContext Methods

| Method                          | Description                          |
|---------------------------------|--------------------------------------|
| `ctx.ui.setFooter(footer)`      | Register a custom footer renderer    |
| `ctx.ui.notify(msg, level)`     | Show a notification to the user      |
| `ctx.getContextUsage()`         | Returns `{ tokens }` usage info      |

### ExtensionAPI Methods

| Method                          | Description                          |
|---------------------------------|--------------------------------------|
| `pi.registerCommand(name, opts)` | Register a `/command`               |
| `pi.getThinkingLevel()`          | Get current thinking level string    |

### Events

| Event               | Callback signature                          |
|----------------------|---------------------------------------------|
| `session_start`      | `(event, ctx: ExtensionContext) => void`    |
| `session_shutdown`   | `() => void`                                |
| `model_select`       | `(event, ctx: ExtensionContext) => void`    |
| `thinking_level_select` | `(event, ctx: ExtensionContext) => void` |
| `message_end`        | `(event, ctx: ExtensionContext) => void`    |
| `tool_result`        | `(event, ctx: ExtensionContext) => void`    |

### Footer Renderer

`ctx.ui.setFooter()` accepts a factory: `(tui, theme, footerData) => Footer`. Footers implement:

```ts
interface Footer {
  dispose(): void;
  invalidate(): void;
  render(width: number): string[];
}
```

Use `tui.requestRender()` to trigger a re-render. `theme.fg(colorName, text)` applies a color token to text.

## Theme Schema

Themes define a `colors` map and optional `vars`:

| Field         | Description                                |
|---------------|--------------------------------------------|
| `name`        | Unique theme identifier                    |
| `displayName` | Human-readable label                       |
| `colors`      | Token → color-value map                    |
| `vars`        | CSS-like variable definitions              |

### Color Tokens

Core tokens used by extensions:

| Token         | Example          |
|---------------|------------------|
| `accent`      | `"#5eeb8d"`      |
| `borderMuted` | `"#6b7280"`      |
| `error`       | `"#f06078"`      |
| `fg`          | `"#e8ecf2"`      |
| `mdHeading`   | `"#d48ee0"`      |
| `mdLink`      | `"#6fd4e0"`      |
| `success`     | `"#5eeb8d"`      |
| `warning`     | `"#e8a84c"`      |

### Vars

| Token               | Example            |
|----------------------|--------------------|
| `cursorColor`        | `"#5eeb8d"`        |
| `selectionBackground`| `"#1e3028"`        |

## npm Scripts

| Script                 | Effect                                              |
|------------------------|-----------------------------------------------------|
| `npm run install-all`  | Copy all extensions + themes to Pi directories      |
| `npm run install-extensions` | Copy only extensions                          |
| `npm run install-themes`     | Copy only themes                              |

All scripts copy artifacts to `~/.pi/agent/extensions/` and `~/.pi/agent/themes/`.

## Install Script Flags

The `install.sh` script supports these flags:

| Flag              | Description                              |
|-------------------|------------------------------------------|
| `--auto`          | Skip prompts, install silently           |
| `--keep`          | Keep cloned repo after install           |
| `--dry-run`       | Show what would install without copying  |
| `--repo-url URL`  | Custom repository URL                    |
| `--branch BRANCH` | Custom branch (default: main)            |

## Adding a New Extension

1. Create `extensions/<name>/package.json` with `pi.extensions` entry.
2. Create `extensions/<name>/index.ts` exporting a default function.
3. Wire into events and/or register commands using `pi.registerCommand()`.
4. Test with `npm run install-extensions && /reload` in Pi.
5. Update README.md with extension docs.

## Adding a New Theme

1. Create `themes/<name>.json` following the schema.
2. Define `name`, `colors`, and `vars`.
3. Test with `npm run install-themes && /reload` in Pi.
4. Theme appears in Pi's `/settings` theme picker.
