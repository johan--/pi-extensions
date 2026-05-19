/**
 * context-stats-pi Extension
 *
 * Real-time context window monitoring for Pi with live ASCII graphs,
 * Model Intelligence metrics, and zone indicators.
 *
 * Features:
 * - Live ASCII graph showing token consumption over time
 * - Model Intelligence (MI) score with color coding
 * - Zone indicators (Plan/Code/Dump/ExDump/Dead)
 * - Cost tracking and estimations
 * - Session state persistence
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import { renderStatusline } from "./statusline";
import { StateManager } from "./state-manager";
import type { ContextSnapshot } from "./types";

const STATE_DIR = path.join(process.env.HOME || "/tmp", ".pi-context-stats");

export default function contextStatsPiExtension(pi: ExtensionAPI) {
	let stateManager: StateManager;
	let lastSnapshot: ContextSnapshot | null = null;
	let updateInterval: NodeJS.Timeout | undefined;

	// Initialize state directory
	if (!fs.existsSync(STATE_DIR)) {
		fs.mkdirSync(STATE_DIR, { recursive: true });
	}

	pi.on("session_start", async (event, ctx) => {
		if (!ctx.hasUI) return;

		// Initialize state manager for this session
		const sessionFile = ctx.sessionManager.getSessionFile();
		const sessionId = sessionFile
			? path.basename(sessionFile, ".jsonl").replace("session-", "")
			: "ephemeral-" + Date.now();

		stateManager = new StateManager(STATE_DIR, sessionId, ctx.cwd);

		// Initial update
		updateStatusline(ctx);

		// Set up periodic updates (every 5 seconds)
		if (updateInterval) clearInterval(updateInterval);
		updateInterval = setInterval(() => {
			if (!ctx.isIdle?.()) {
				updateStatusline(ctx);
			}
		}, 5000);

		ctx.ui.notify("context-stats initialized", "info");
	});

	pi.on("message_end", async (event, ctx) => {
		if (!ctx.hasUI || !stateManager) return;

		const message = event.message;

		// Track message-level metrics
		if (message.role === "assistant" && message.usage) {
			const snapshot = captureSnapshot(ctx, message.usage);
			stateManager.recordSnapshot(snapshot);
			lastSnapshot = snapshot;
			updateStatusline(ctx);
		}
	});

	pi.on("tool_result", async (event, ctx) => {
		if (!ctx.hasUI || !stateManager) return;

		// Update on tool results to capture incremental usage
		updateStatusline(ctx);
	});

	pi.on("session_shutdown", async (event, ctx) => {
		if (updateInterval) clearInterval(updateInterval);
		if (stateManager) {
			stateManager.flush();
		}
	});

	pi.registerCommand("context-stats", {
		description: "Show context usage statistics and metrics",
		handler: async (args, ctx) => {
			if (!stateManager) {
				ctx.ui.notify("No session data available", "error");
				return;
			}

			const snapshot = captureSnapshot(ctx, ctx.getContextUsage?.());
			if (snapshot) {
				stateManager.recordSnapshot(snapshot);
				const report = stateManager.generateReport();
				ctx.ui.notify(report, "info");
			}
		},
	});

	pi.registerCommand("context-compact", {
		description: "Show when compaction might be needed",
		handler: async (args, ctx) => {
			const usage = ctx.getContextUsage?.();
			if (!usage || !ctx.model) {
				ctx.ui.notify("Unable to determine context metrics", "error");
				return;
			}

			const contextUsageRatio = usage.tokens / (ctx.model.contextWindow || 200000);
			const recommendation = getZoneRecommendation(contextUsageRatio, ctx.model.contextWindow || 200000);

			ctx.ui.notify(recommendation, contextUsageRatio > 0.7 ? "warning" : "info");
		},
	});

	// Helper functions
	function updateStatusline(ctx: ExtensionContext) {
		try {
			const snapshot = captureSnapshot(ctx, ctx.getContextUsage?.());
			if (!snapshot) return;

			// Update status line only (no widget above editor)
			const zone = getZone(snapshot.contextUsageRatio, snapshot.contextWindow);
			const zoneColor = snapshot.contextUsageRatio > 0.7 ? "warning" : "success";
			const guidelines = getZoneGuidelines(zone);
			ctx.ui.setStatus(
				"context-stats",
				ctx.ui.theme.fg(zoneColor, `${getZoneEmoji(zone)} ${zone} Zone — ${guidelines}`),
			);
		} catch (error) {
			console.error("Error updating statusline:", error);
		}
	}

	function captureSnapshot(ctx: ExtensionContext, usage?: { tokens: number }): ContextSnapshot | null {
		if (!ctx.model) return null;

		const tokensUsed = usage?.tokens ?? 0;
		const contextWindow = ctx.model.contextWindow || 200000;
		const contextUsageRatio = contextWindow > 0 ? tokensUsed / contextWindow : 0;

		return {
			timestamp: Date.now(),
			tokensUsed,
			contextWindow,
			contextUsageRatio,
			model: ctx.model.id,
			sessionId: ctx.sessionManager.getSessionFile?.()
				? path.basename(ctx.sessionManager.getSessionFile?.() || "", ".jsonl")
				: "ephemeral",
			cwd: ctx.cwd,
		};
	}

	function calculateMI(snapshot: ContextSnapshot): number {
		const beta = getModelProfile(snapshot.model);
		const mi = Math.max(0, 1 - Math.pow(snapshot.contextUsageRatio, beta));
		return mi;
	}

	function getModelProfile(modelId: string): number {
		const lower = modelId.toLowerCase();
		if (lower.includes("opus")) return 1.8;
		if (lower.includes("sonnet")) return 1.5;
		if (lower.includes("haiku")) return 1.2;
		return 1.5; // default
	}

	function getZone(contextUsageRatio: number, contextWindow: number): string {
		if (contextWindow >= 500_000) {
			// 1M-class model zones
			const used = contextWindow * contextUsageRatio;
			if (used < 150_000) return "Plan";
			if (used < 250_000) return "Code";
			if (used < 400_000) return "Dump";
			if (used < 450_000) return "ExDump";
			return "Dead";
		} else {
			// Standard model zones
			if (contextUsageRatio < 0.4) return "Plan";
			if (contextUsageRatio < 0.7) return "Code";
			if (contextUsageRatio < 0.75) return "Dump";
			if (contextUsageRatio < 0.8) return "ExDump";
			return "Dead";
		}
	}

	function getZoneRecommendation(contextUsageRatio: number, contextWindow: number): string {
		const zone = getZone(contextUsageRatio, contextWindow);

		if (zone.includes("Plan")) return "✅ Safe to plan and code";
		if (zone.includes("Code")) return "⚠️ Avoid starting new tasks; finish current one";
		if (zone.includes("Dump")) return "🟠 Consider `/compact focus on X` or delegate to subagent";
		if (zone.includes("ExDump")) return "🔴 Run `/compact` now before quality degrades further";
		return "⚫ Start a new session with `/clear`";
	}

	function getZoneEmoji(zone: string): string {
		switch (zone) {
			case "Plan":
				return "🟢";
			case "Code":
				return "🟡";
			case "Dump":
				return "🟠";
			case "ExDump":
				return "🔴";
			case "Dead":
				return "⚫";
			default:
				return "◻";
		}
	}

	function getZoneGuidelines(zone: string): string {
		switch (zone) {
			case "Plan":
				return "Safe to plan and code";
			case "Code":
				return "Finish current task";
			case "Dump":
				return "Consider `/compact` or subagent";
			case "ExDump":
				return "Run `/compact` now";
			case "Dead":
				return "Start new session with `/clear`";
			default:
				return "Unknown zone state";
		}
	}
}
