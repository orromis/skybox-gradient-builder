<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let { class: klass, value = $bindable(), ...props }: HTMLInputAttributes = $props();
</script>

<input
	class={[
		'form-input w-full rounded-md border border-transparent bg-mist-200 text-black focus:border-indigo-800 focus:outline-0 dark:bg-mist-900 dark:text-white',
		klass
	]}
	bind:value
	{...props}
/>
