<script lang="ts">
	import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';
	import { Gradient } from './gradient.svelte';

	interface Props {
		gradient: Gradient;
	}

	let { gradient = $bindable() }: Props = $props();
</script>

<div class="flex">
	<div
		class="mr-4 h-30 w-30 rounded-md border border-mist-300 dark:border-mist-700"
		style:background={gradient.getCssString()}
	></div>
	<div>
		{#each gradient.colors as color (color.id)}
			<div class="flex">
				<span class="color-picker mr-2">
					<ColorPicker label="" bind:rgb={color.rgb} />
				</span>

				<label class="flex items-center justify-center">
					Color strength
					<input
						class="ml-2"
						type="range"
						bind:value={color.position}
						step="0.0001"
						min="0"
						max="1"
					/>
				</label>
			</div>
		{/each}
		<div class="flex items-center justify-center">
			<button
				class="color-mist-200 my-2 rounded-lg bg-indigo-300 px-4 py-2 hover:cursor-pointer dark:bg-indigo-700"
				onclick={() => gradient.addColor()}>Add color</button
			>
		</div>
		<label>
			Gradient angle
			<input type="number" bind:value={gradient.angle} min="0" max="360" />
		</label>
		<input class="w-full" type="range" bind:value={gradient.angle} min="0" max="360" />
	</div>
</div>

<style>
	.color-picker {
		--cp-bg-color: var(--color-mist-300);
		--cp-border-color: var(--color-mist-200);
		--cp-text-color: black;
		--cp-input-color: var(--color-mist-400);
		--cp-button-hover-color: var(--color-mist-200);
		--focus-color: var(--color-mist-800);

		@media (prefers-color-scheme: dark) {
			--cp-bg-color: var(--color-mist-700);
			--cp-border-color: var(--color-mist-800);
			--cp-text-color: white;
			--cp-input-color: var(--color-mist-600);
			--cp-button-hover-color: var(--color-mist-800);
			--focus-color: var(--color-mist-200);
		}
	}
</style>
