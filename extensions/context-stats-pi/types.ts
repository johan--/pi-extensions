/**
 * Type definitions for context-stats-pi extension
 */

export interface ContextSnapshot {
	timestamp: number;
	tokensUsed: number;
	contextWindow: number;
	contextUsageRatio: number;
	model: string;
	sessionId: string;
	cwd: string;
}

export interface StateEntry {
	timestamp: number;
	tokensUsed: number;
	contextWindow: number;
	model: string;
	sessionId: string;
	cwd: string;
}

export interface Report {
	totalTokens: number;
	averageUsage: number;
	peakUsage: number;
	currentUsage: number;
	zone: string;
	mi: number;
	trend: "increasing" | "stable" | "decreasing";
}
