<script lang="ts">
	import ColorPicker, { ChromeVariant } from 'svelte-awesome-color-picker';
	import { Gradient, GradientColor } from './gradient.svelte';
	import { clamp, lerp } from '../utils';
	import { Slider } from 'svelte-awesome-slider';
	import Button from '../button.svelte';
	import Input from '../input.svelte';

	interface Props {
		gradient: Gradient;
	}

	let { gradient = $bindable() }: Props = $props();
	let activeColor = $state(gradient.colors[0]);
	// this is intentional, it's handeled in activateColor
	// svelte-ignore state_referenced_locally
	let activePosition = $state(activeColor.position);
	let dragging = $state(false);
	let gradientContainerWidth = $state(0);
	let thumbWidth = $state(0);
	let thumbOffset = $derived(gradientContainerWidth - thumbWidth);

	function drag(event: PointerEvent) {
		if (event.buttons !== 1 || !dragging) {
			return;
		}

		activePosition += event.movementX / thumbOffset;
		activeColor.position = clamp(activePosition, 0, 1);
		event.preventDefault();
		event.stopPropagation();
	}

	function stopDragging() {
		dragging = false;
	}

	function startDragging(event: PointerEvent, color: GradientColor) {
		if (event.buttons !== 1) {
			return;
		}

		dragging = true;
		activePosition = color.position;
		activeColor = color;
	}

	function activateColor(color: GradientColor) {
		activeColor = color;
	}

	function colorKeyDown(event: KeyboardEvent, color: GradientColor) {
		switch (event.code) {
			case 'ArrowLeft':
				color.position = clamp(color.position - 0.01, 0, 1);
				break;
			case 'ArrowRight':
				color.position = clamp(color.position + 0.01, 0, 1);
				break;
			case 'Enter':
			case ' ':
			case 'Space':
				activateColor(color);
				break;
		}
	}

	function removeColor() {
		const index = gradient.removeColor(activeColor);

		if (index) {
			activeColor = gradient.colors[index + 1] ?? gradient.colors[index - 1];
		}
	}
</script>

<svelte:window onpointermove={drag} onpointerup={stopDragging} />

<div class="grid grid-cols-3 gap-x-2 gap-y-4 rounded-md bg-mist-100 p-4 dark:bg-mist-950">
	<div
		class="relative col-span-3 mb-4 h-3 w-full rounded-full border border-mist-300 select-none dark:border-mist-700"
		style:background={gradient.getCssString(90)}
		bind:clientWidth={gradientContainerWidth}
	>
		{#each gradient.colors as color, i (color.id)}
			<div
				class={[
					'absolute -top-2 h-6 w-6 cursor-pointer rounded-full border border-mist-300 outline-mist-200 transition-transform duration-150 ease-in-out select-none hover:scale-115 focus:outline-2 dark:border-mist-700 dark:outline-indigo-800',
					{ 'scale-115': activeColor === color }
				]}
				style:background={color.cssColor}
				style:left={`${lerp(-1, thumbOffset, color.position)}px`}
				role="button"
				bind:clientWidth={thumbWidth}
				tabindex={i + 1}
				onpointerdown={(event) => startDragging(event, color)}
				onclick={() => activateColor(color)}
				onkeydown={(event) => colorKeyDown(event, color)}
			></div>
		{/each}
	</div>

	<Button onclick={() => gradient.addColor()}>Randomize</Button>
	<Button onclick={() => gradient.addColor()}>Add color</Button>
	<Button theme="danger" onclick={removeColor} disabled={gradient.colors.length < 3}>
		Remove color
	</Button>

	<label class="relative col-span-2">
		Selected color
		<Input type="text" bind:value={activeColor.hexColor} />

		<span class="color-picker absolute right-1 bottom-1">
			<ColorPicker
				label=""
				bind:rgb={activeColor.rgb}
				components={ChromeVariant}
				sliderDirection="horizontal"
			/>
		</span>
	</label>

	<label>
		Gradient position
		<Input type="number" min="0" max="100" bind:value={activeColor.positionPercent} />
	</label>

	<div class="slider col-span-2">
		<p class="mb-2" id="angle">Gradient angle</p>
		<Slider bind:value={gradient.angle} min="0" max="360" step="1" ariaLabelledBy="angle" />
	</div>
	<Input
		bind:value={gradient.angle}
		type="number"
		min="0"
		max="360"
		step="1"
		aria-labelledby="angle"
	/>
	<div
		class="col-span-3 h-30 rounded-md border border-mist-300 dark:border-mist-700"
		style:background={gradient.getCssString()}
	></div>
</div>

<style>
	.color-picker {
		--cp-bg-color: var(--color-mist-100);
		--cp-border-color: transparent;
		--cp-text-color: black;
		--cp-input-color: var(--color-mist-200);
		--cp-button-hover-color: var(--color-mist-300);
		--focus-color: var(--color-indigo-800);

		@media (prefers-color-scheme: dark) {
			--cp-bg-color: var(--color-mist-950);
			--cp-border-color: transparent;
			--cp-text-color: white;
			--cp-input-color: var(--color-mist-900);
			--cp-button-hover-color: var(--color-mist-700);
		}
	}

	.slider {
		--thumb-background: var(--color-indigo-700);
		--track-background: var(--color-indigo-100);
		--focus-color: var(--color-indigo-800);
	}
</style>
