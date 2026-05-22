# Pi Extensions & Themes

A curated collection of extensions and themes for [Pi Coding Agent](https://github.com/earendil-works/pi-coding-agent). Share your Pi setup across different environments with ease.

## Contents

### Extensions

- **statusline-pi** — Compact custom footer with current directory, git branch/change count/PR, remaining context window plus zone, and provider/model.

### Themes

- **neon-green** — Futuristic neon green theme for Pi.
- **neon-green-light** — Softer light variant of the neon green theme.

## Quick Start

### One-liner install (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/luongnv89/pi-extensions/main/install.sh | bash -s -- --auto
```

### From cloned repo

```bash
git clone https://github.com/luongnv89/pi-extensions ~/.pi/pi-extensions
~/.pi/pi-extensions/install.sh --auto
```

### Interactive install (legacy)

```bash
~/.pi/pi-extensions/install.sh
```

Then reload Pi → open Pi and type `/reload`

## License statusline-pi

`statusline-pi` replaces Pi's default footer with a compact project statusline.

Format:

```text
current-dir │ branch [changed files] PR #x │ remaining context tokens (percentage) context zone │ provider/model
```

Example:

```text
pi-extensions │ main [2] PR #12 │ 840,037 (84.0%) Plan │ openai-codex/gpt-5.5
```

### Git section

The git section groups all git-related status in one place:

- current branch
- number of changed files from `git status --porcelain`
- related GitHub PR number when `gh pr view` can resolve one for the branch

### Context section

The remaining context window is shown as exact tokens plus percentage, followed by a simple zone value:

```text
840,037 (84.0%) Plan
```

The entire context section is colored by the active zone:

- **Plan** / **Code** — success color
- **Dump** — warning color
- **ExDump** / **Dead** — error color

### Commands

```text
/statusline-pi       # Toggle the custom footer on/off
/statusline-refresh  # Force refresh git and PR data
```

## Themes

Themes are automatically discovered from `~/.pi/agent/themes/`.

Available themes:

- `neon-green`
- `neon-green-light`

Install manually:

```bash
cp ~/.pi/pi-extensions/themes/neon-green.json ~/.pi/agent/themes/
cp ~/.pi/pi-extensions/themes/neon-green-light.json ~/.pi/agent/themes/
```

Select a theme from Pi's `/settings`, then reload if needed.

## Install Flags

| Flag        | Effect                                          |     |
|-------------|-------------------------------------------------|-----|
| `--auto`    | Skip prompts, install everything automatically  |     |
| `--keep`    | Keep the cloned repo after installation         |
| `--dry-run` | Show what would be installed without copying    |     |
| `--repo-url URL` | Use a custom repo URL (default: GitHub)  |     |
| `--branch BRANCH` | Use a custom branch (default: `main`)   |     |

## Directory Structure

```text
pi-extensions/
├── README.md
├── install.sh
├── extensions/
│   └── statusline-pi/
│       ├── package.json
│       ├── index.ts
│       └── README.md
└── themes/
    ├── neon-green.json
    └── neon-green-light.json
```

## Updating

```bash
cd ~/.pi/pi-extensions
git pull origin main
~/.pi/pi-extensions/install.sh --auto
```

Then run `/reload` in Pi.

## Contributing

1. Create a fork.
2. Add your extension/theme to the appropriate directory.
3. Update this README with documentation.
4. Submit a pull request.

## License

MIT — feel free to use and modify for your own setup.
