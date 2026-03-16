import { isInputFocused, isNativeDialogOpen } from '$lib/utils'
import { shortcuts } from '$lib/shortcuts'

// =============================================================================
// Types
// =============================================================================

export interface KeyboardShortcutHandlers {
	onPlayPause: () => void
	onFocusSearch: () => void
	onClearSelection: () => void
	onSelectAll: () => void
	onOpenSettings: () => void
	onNewPlaylist: () => void
	onNewFolder: () => void
	onImport: () => void
	onDeleteSelected: () => boolean
	onPlaySelected: () => void
	onSeekBackward: () => void
	onSeekForward: () => void
	onFineSeekBackward: () => void
	onFineSeekForward: () => void
	onPreviousTrack: () => void
	onNextTrack: () => void
	onVolumeUp: () => void
	onVolumeDown: () => void
	onToggleMute: () => void
	onSelectPreviousTrack: () => void
	onSelectNextTrack: () => void
	onQuickExport: () => void
	onJumpToPlayingTrack: () => void
	onToggleView: () => void
	onAddRelease: () => void
	onRefreshMetadata: () => void
	onShowKeyboardShortcuts: () => void
	isModalOpen?: () => boolean
}

// =============================================================================
// Handler name mapping — maps shortcut def handler names to KeyboardShortcutHandlers keys
// =============================================================================

const handlerNameMap: Record<string, keyof KeyboardShortcutHandlers> = {
	playPause: 'onPlayPause',
	focusSearch: 'onFocusSearch',
	clearSelection: 'onClearSelection',
	selectAll: 'onSelectAll',
	openSettings: 'onOpenSettings',
	newPlaylist: 'onNewPlaylist',
	newFolder: 'onNewFolder',
	import: 'onImport',
	deleteSelected: 'onDeleteSelected',
	playSelected: 'onPlaySelected',
	seekBackward: 'onSeekBackward',
	seekForward: 'onSeekForward',
	fineSeekBackward: 'onFineSeekBackward',
	fineSeekForward: 'onFineSeekForward',
	previousTrack: 'onPreviousTrack',
	nextTrack: 'onNextTrack',
	volumeUp: 'onVolumeUp',
	volumeDown: 'onVolumeDown',
	toggleMute: 'onToggleMute',
	selectPreviousTrack: 'onSelectPreviousTrack',
	selectNextTrack: 'onSelectNextTrack',
	quickExport: 'onQuickExport',
	jumpToPlayingTrack: 'onJumpToPlayingTrack',
	toggleView: 'onToggleView',
	addRelease: 'onAddRelease',
	refreshMetadata: 'onRefreshMetadata',
	showKeyboardShortcuts: 'onShowKeyboardShortcuts',
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Set up global keyboard shortcuts for the application.
 * Shortcut definitions are driven by the shared `shortcuts` array in `$lib/shortcuts`.
 *
 * @returns Cleanup function to remove the event listener
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): () => void {
	function handleKeydown(e: KeyboardEvent): void {
		if (handlers.isModalOpen?.()) return
		if (isNativeDialogOpen()) return
		const inputFocused = isInputFocused()

		// Cmd/Ctrl+A has special behavior when input is focused (select text)
		if ((e.metaKey || e.ctrlKey) && e.key === 'a' && inputFocused) {
			e.preventDefault()
			const input = document.activeElement as HTMLInputElement | HTMLTextAreaElement
			input.select()
			return
		}

		for (const shortcut of shortcuts) {
			if (shortcut.requiresNoInput && inputFocused) continue

			const needsMod = shortcut.modifiers?.includes('mod') ?? false
			const needsShift = shortcut.modifiers?.includes('shift') ?? false
			const hasMod = e.metaKey || e.ctrlKey

			if (needsMod !== hasMod) continue
			if (needsShift !== e.shiftKey) continue

			// Match key — use e.code for Space, e.key for everything else
			const keyMatches =
				shortcut.key === 'Space' ? e.code === 'Space' : e.key === shortcut.key

			if (!keyMatches) continue

			// Special case: toggleMute should not fire with mod held
			if (shortcut.handler === 'toggleMute' && (e.metaKey || e.ctrlKey)) continue

			const handlerKey = handlerNameMap[shortcut.handler]
			if (!handlerKey) continue

			const handler = handlers[handlerKey] as ((...args: unknown[]) => unknown) | undefined
			if (!handler) continue

			// deleteSelected returns boolean to indicate if preventDefault should happen
			if (shortcut.handler === 'deleteSelected') {
				if (handler()) {
					e.preventDefault()
				}
				return
			}

			e.preventDefault()
			handler()
			return
		}
	}

	window.addEventListener('keydown', handleKeydown)

	return () => {
		window.removeEventListener('keydown', handleKeydown)
	}
}
