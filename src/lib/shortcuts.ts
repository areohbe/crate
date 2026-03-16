// =============================================================================
// Keyboard shortcut definitions — single source of truth
// =============================================================================

export type ShortcutModifier = 'mod' | 'shift'

export type ShortcutKey =
	| 'Space'
	| 'Enter'
	| 'Escape'
	| 'Tab'
	| 'Delete'
	| 'ArrowLeft'
	| 'ArrowRight'
	| 'ArrowUp'
	| 'ArrowDown'
	| (string & {}) // allow arbitrary key strings

export type ShortcutDef = {
	key: ShortcutKey
	modifiers?: ShortcutModifier[]
	/** Handler name on KeyboardShortcutHandlers (without 'on' prefix) */
	handler: string
	description: string
	group: 'Playback' | 'Volume' | 'Navigation & Selection' | 'Actions'
	/** If true, shortcut is suppressed when an input is focused */
	requiresNoInput?: boolean
	/** Display-only label for the key (e.g. '←' instead of 'ArrowLeft') */
	displayKey?: string
}

// prettier-ignore
export const shortcuts: ShortcutDef[] = [
	// Playback
	{ key: 'Space',      handler: 'playPause',        description: 'Play / Pause',        group: 'Playback', requiresNoInput: true },
	{ key: 'ArrowLeft',  handler: 'seekBackward',     description: 'Seek backward 10s',   group: 'Playback', requiresNoInput: true, displayKey: '←' },
	{ key: 'ArrowRight', handler: 'seekForward',      description: 'Seek forward 10s',    group: 'Playback', requiresNoInput: true, displayKey: '→' },
	{ key: 'ArrowLeft',  handler: 'fineSeekBackward', description: 'Seek backward 1s',    group: 'Playback', requiresNoInput: true, modifiers: ['mod'], displayKey: '←' },
	{ key: 'ArrowRight', handler: 'fineSeekForward',  description: 'Seek forward 1s',     group: 'Playback', requiresNoInput: true, modifiers: ['mod'], displayKey: '→' },
	{ key: 'ArrowLeft',  handler: 'previousTrack',    description: 'Previous track',       group: 'Playback', requiresNoInput: true, modifiers: ['shift'], displayKey: '←' },
	{ key: 'ArrowRight', handler: 'nextTrack',        description: 'Next track',           group: 'Playback', requiresNoInput: true, modifiers: ['shift'], displayKey: '→' },
	{ key: 'Enter',      handler: 'playSelected',     description: 'Play selected track',  group: 'Playback', requiresNoInput: true },

	// Volume
	{ key: 'ArrowUp',   handler: 'volumeUp',   description: 'Volume up',    group: 'Volume', requiresNoInput: true, displayKey: '↑' },
	{ key: 'ArrowDown', handler: 'volumeDown', description: 'Volume down',  group: 'Volume', requiresNoInput: true, displayKey: '↓' },
	{ key: 'm',         handler: 'toggleMute', description: 'Toggle mute',  group: 'Volume', requiresNoInput: true },

	// Navigation & Selection
	{ key: 'f',        handler: 'focusSearch',        description: 'Search',                group: 'Navigation & Selection', modifiers: ['mod'] },
	{ key: 'a',        handler: 'selectAll',          description: 'Select all',            group: 'Navigation & Selection', modifiers: ['mod'] },
	{ key: 'ArrowUp',  handler: 'selectPreviousTrack', description: 'Select previous track', group: 'Navigation & Selection', requiresNoInput: true, modifiers: ['mod'], displayKey: '↑' },
	{ key: 'ArrowDown', handler: 'selectNextTrack',    description: 'Select next track',     group: 'Navigation & Selection', requiresNoInput: true, modifiers: ['mod'], displayKey: '↓' },
	{ key: 'j',        handler: 'jumpToPlayingTrack', description: 'Jump to playing track', group: 'Navigation & Selection', modifiers: ['mod'] },
	{ key: 'Tab',      handler: 'toggleView',         description: 'Toggle view',           group: 'Navigation & Selection', requiresNoInput: true, modifiers: ['shift'] },
	{ key: 'Escape',   handler: 'clearSelection',     description: 'Clear selection',       group: 'Navigation & Selection' },

	// Actions
	{ key: 'n', handler: 'newPlaylist',           description: 'New playlist',      group: 'Actions', modifiers: ['mod'] },
	{ key: 'N', handler: 'newFolder',             description: 'New folder',        group: 'Actions', modifiers: ['mod', 'shift'] },
	{ key: 'd', handler: 'addRelease',            description: 'Add release',       group: 'Actions', modifiers: ['mod'] },
	{ key: 'l', handler: 'import',                description: 'Import files',      group: 'Actions', modifiers: ['mod'] },
	{ key: 'e', handler: 'quickExport',           description: 'Quick export',      group: 'Actions', modifiers: ['mod'] },
	{ key: 'r', handler: 'refreshMetadata',       description: 'Refresh metadata',  group: 'Actions', modifiers: ['mod'], requiresNoInput: true },
	{ key: ',', handler: 'openSettings',          description: 'Settings',          group: 'Actions', modifiers: ['mod'] },
	{ key: 'Delete', handler: 'deleteSelected',   description: 'Remove selected',   group: 'Actions', requiresNoInput: true },
	{ key: '/', handler: 'showKeyboardShortcuts', description: 'Show shortcuts',    group: 'Actions', modifiers: ['mod'] },
]

// =============================================================================
// Helpers
// =============================================================================

export type ShortcutGroup = {
	title: string
	shortcuts: { keys: string[]; description: string }[]
}

const GROUP_ORDER: ShortcutDef['group'][] = ['Playback', 'Volume', 'Navigation & Selection', 'Actions']

const DISPLAY_KEY_MAP: Record<string, string> = {
	ArrowLeft: '←',
	ArrowRight: '→',
	ArrowUp: '↑',
	ArrowDown: '↓',
	Space: 'Space',
	Enter: 'Enter',
	Escape: 'Esc',
	Tab: 'Tab',
	Delete: 'Delete',
}

/**
 * Get grouped shortcut definitions formatted for display.
 * Pass `isMac` to control modifier label (⌘ vs Ctrl).
 */
export function getShortcutGroups(isMac: boolean): ShortcutGroup[] {
	const mod = isMac ? '⌘' : 'Ctrl'
	const grouped = new Map<string, ShortcutGroup>()

	for (const group of GROUP_ORDER) {
		grouped.set(group, { title: group, shortcuts: [] })
	}

	for (const s of shortcuts) {
		const keys: string[] = []
		if (s.modifiers?.includes('mod')) keys.push(mod)
		if (s.modifiers?.includes('shift')) keys.push('Shift')
		keys.push(s.displayKey ?? DISPLAY_KEY_MAP[s.key] ?? s.key.toUpperCase())

		grouped.get(s.group)!.shortcuts.push({ keys, description: s.description })
	}

	return GROUP_ORDER.map((g) => grouped.get(g)!).filter((g) => g.shortcuts.length > 0)
}
