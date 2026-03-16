<script lang="ts">
	import Modal from './Modal.svelte'
	import Text from './Text.svelte'
	import { getShortcutGroups } from '$lib/shortcuts'

	type Props = {
		open: boolean
		onClose: () => void
	}

	let { open, onClose }: Props = $props()

	const isMac = navigator.userAgent.toUpperCase().includes('MAC')
	const groups = getShortcutGroups(isMac)
</script>

<Modal {open} title="Keyboard Shortcuts" size="lg" {onClose}>
	<div class="grid grid-cols-2 gap-10">
		{#each groups as group (group.title)}
			<div>
				<Text variant="header-4" color="secondary" as="div" class="tracking-wide uppercase">{group.title}</Text>
				<div class="flex flex-col gap-1.5">
					{#each group.shortcuts as shortcut (shortcut.description)}
						<div class="flex items-center justify-between gap-3">
							<span class="text-sm text-text-secondary">{shortcut.description}</span>
							<div class="flex shrink-0 items-center gap-0.5">
								{#each shortcut.keys as key (key)}
									<kbd
										class="inline-flex h-5 min-w-5 items-center justify-center rounded border border-stroke bg-surface-2 px-1.5 font-mono text-xs text-text-secondary"
									>
										{key}
									</kbd>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</Modal>
