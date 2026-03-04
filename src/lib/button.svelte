<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		theme = 'primary',
		children,
		class: klass,
		...props
	}: HTMLButtonAttributes & { theme?: 'primary' | 'danger' } = $props();

	let colorClasses = $derived.by(() => {
		switch (theme) {
			case 'primary':
				return 'bg-indigo-700 hover:bg-indigo-800 focus:shadow-indigo-800/80 disabled:bg-indigo-950';
			case 'danger':
				return 'bg-rose-700 hover:bg-rose-800 focus:shadow-rose-800/80 disabled:bg-rose-950';
			default:
				return 'bg-indigo-700 hover:bg-indigo-800 focus:shadow-indigo-800/80 disabled:bg-indigo-950';
		}
	});
</script>

<button
	class={[
		'rounded-md px-4 py-2 text-white hover:cursor-pointer focus:shadow-md focus:outline-0 disabled:cursor-not-allowed',
		colorClasses,
		klass
	]}
	{...props}
>
	{#if children}
		{@render children()}
	{/if}
</button>
