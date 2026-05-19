#!/bin/bash

# Pi Extensions Installation Script
# Installs all extensions and themes to your Pi setup

set -e

PI_REPO="${HOME}/.pi/pi-extensions"
PI_EXTENSIONS="${HOME}/.pi/agent/extensions"
PI_THEMES="${HOME}/.pi/agent/themes"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Pi Extensions Installer v1.0.0      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if pi-extensions repo exists
if [ ! -d "$PI_REPO" ]; then
    echo -e "${RED}❌ Error: pi-extensions repo not found at $PI_REPO${NC}"
    echo -e "${YELLOW}Please clone it first:${NC}"
    echo "git clone https://github.com/luongnv89/pi-extensions ~/.pi/pi-extensions"
    exit 1
fi

echo -e "${BLUE}📦 Installation Directories:${NC}"
echo "  Extensions: $PI_EXTENSIONS"
echo "  Themes: $PI_THEMES"
echo ""

# Create directories if they don't exist
mkdir -p "$PI_EXTENSIONS"
mkdir -p "$PI_THEMES"

# Menu
echo -e "${BLUE}What would you like to install?${NC}"
echo "1) All extensions and themes"
echo "2) Extensions only"
echo "3) Themes only"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo -e "${YELLOW}Installing extensions...${NC}"
        if [ -d "$PI_REPO/extensions" ] && [ "$(ls -A $PI_REPO/extensions)" ]; then
            cp -r "$PI_REPO/extensions"/* "$PI_EXTENSIONS/"
            echo -e "${GREEN}✅ Extensions installed${NC}"
            # List installed extensions
            echo -e "${BLUE}Installed extensions:${NC}"
            ls -1 "$PI_EXTENSIONS" | sed 's/^/  - /'
        else
            echo -e "${YELLOW}⚠️  No extensions found${NC}"
        fi
        
        echo ""
        echo -e "${YELLOW}Installing themes...${NC}"
        if [ -d "$PI_REPO/themes" ] && [ "$(ls -A $PI_REPO/themes)" ]; then
            cp -r "$PI_REPO/themes"/* "$PI_THEMES/"
            echo -e "${GREEN}✅ Themes installed${NC}"
            # List installed themes
            echo -e "${BLUE}Installed themes:${NC}"
            ls -1 "$PI_THEMES" | sed 's/^/  - /'
        else
            echo -e "${YELLOW}⚠️  No themes found${NC}"
        fi
        ;;
    2)
        echo -e "${YELLOW}Installing extensions...${NC}"
        if [ -d "$PI_REPO/extensions" ] && [ "$(ls -A $PI_REPO/extensions)" ]; then
            cp -r "$PI_REPO/extensions"/* "$PI_EXTENSIONS/"
            echo -e "${GREEN}✅ Extensions installed${NC}"
            # List installed extensions
            echo -e "${BLUE}Installed extensions:${NC}"
            ls -1 "$PI_EXTENSIONS" | sed 's/^/  - /'
        else
            echo -e "${RED}❌ No extensions found${NC}"
            exit 1
        fi
        ;;
    3)
        echo -e "${YELLOW}Installing themes...${NC}"
        if [ -d "$PI_REPO/themes" ] && [ "$(ls -A $PI_REPO/themes)" ]; then
            cp -r "$PI_REPO/themes"/* "$PI_THEMES/"
            echo -e "${GREEN}✅ Themes installed${NC}"
            # List installed themes
            echo -e "${BLUE}Installed themes:${NC}"
            ls -1 "$PI_THEMES" | sed 's/^/  - /'
        else
            echo -e "${RED}❌ No themes found${NC}"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Open Pi"
echo "2. Type: /reload"
echo ""
echo -e "${YELLOW}💡 Tip: Use 'git pull' in $PI_REPO to keep everything updated${NC}"
