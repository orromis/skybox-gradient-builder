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

	function drag(movementX: number) {
		if (!dragging) {
			return;
		}

		activePosition += movementX / thumbOffset;
		activeColor.position = clamp(activePosition, 0, 1);
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

	function colorKeyActivate(event: KeyboardEvent, color: GradientColor) {
		switch (event.key) {
			case 'Enter':
			case ' ':
			case 'Spacebar':
				activeColor = color;
				return;
		}

		colorKeyMove(event, color);
		event.stopPropagation();
	}

	function colorKeyMove(event: KeyboardEvent, color = activeColor) {
		switch (event.key) {
			case 'ArrowLeft':
				color.position = clamp(color.position - 0.01, 0, 1);
				break;
			case 'ArrowRight':
				color.position = clamp(color.position + 0.01, 0, 1);
				break;
		}
	}

	let lastTouch: Touch | null = null;
	function touch(e: TouchEvent) {
		if (lastTouch) {
			drag(e.changedTouches[0].pageX - lastTouch.pageX);
		}
		lastTouch = e.changedTouches[0];
	}

	function removeColor() {
		const index = gradient.removeColor(activeColor);
		if (index) {
			activeColor = gradient.colors[index] ?? gradient.colors[index - 1];
		}
	}
</script>

<svelte:window onmousemove={(event) => drag(event.movementX)} onpointerup={stopDragging} />

<h2 class="mb-4 text-xl">Texture and gradient settings</h2>
<div class="grid grid-cols-4 gap-x-2 gap-y-4 rounded-md bg-mist-100 p-4 dark:bg-mist-950">
	<div
		class="relative col-span-4 h-3 w-full rounded-full border border-mist-300 outline-indigo-800 select-none focus:outline-2 dark:border-mist-700"
		style:background={gradient.getCssString(90)}
		bind:clientWidth={gradientContainerWidth}
		ontouchmove={touch}
		ontouchend={() => (lastTouch = null)}
		role="slider"
		aria-valuenow={activeColor.position}
		aria-valuemin="0"
		aria-valuemax="1"
		tabindex="0"
		onkeydown={(event) => colorKeyMove(event)}
	>
		{#each gradient.colors as color (color.id)}
			<div
				class={[
					'absolute -top-2 h-6 w-6 cursor-pointer rounded-full border border-mist-300 outline-indigo-800 transition-transform duration-150 ease-in-out select-none hover:scale-115 focus:outline-2 dark:border-mist-700',
					{ 'scale-115': activeColor === color }
				]}
				style:background={color.cssColor}
				style:left={`${lerp(-1, thumbOffset, color.position)}px`}
				role="button"
				bind:clientWidth={thumbWidth}
				tabindex="0"
				onpointerdown={(event) => startDragging(event, color)}
				onclick={() => (activeColor = color)}
				onkeydown={(event) => colorKeyActivate(event, color)}
			></div>
		{/each}
	</div>
	<div class="col-span-4 -mt-2 text-right text-sm">{gradient.limit}</div>

	<!-- <Button class="col-span-4 sm:col-span-1" onclick={() => gradient.addColor()}>Randomize</Button> -->
	<Button
		class="col-span-4 sm:col-span-2"
		onclick={() => gradient.addColor()}
		disabled={!gradient.canAddColor()}>Add color</Button
	>
	<Button
		class="col-span-4 sm:col-span-2"
		theme="danger"
		onclick={removeColor}
		disabled={gradient.colors.length < 3}
	>
		Remove color
	</Button>

	<label class="relative col-span-3">
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
		Position
		<Input type="number" min="0" max="100" bind:value={activeColor.positionPercent} />
	</label>

	<div class="slider col-span-3">
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
		class="col-span-4 h-30 rounded-md border border-mist-300 dark:border-mist-700"
		style:background={gradient.getCssString()}
	></div>
</div>

<style>
	.color-picker {
		--cp-bg-color: var(--color-mist-100);
		--cp-border-color: var(--color-transpar);
		--cp-text-color: var(--color-black);
		--cp-input-color: var(--color-mist-200);
		--cp-button-hover-color: var(--color-mist-300);
		--focus-color: var(--color-indigo-800);

		@media (prefers-color-scheme: dark) {
			--cp-bg-color: var(--color-mist-950);
			--cp-border-color: transparent;
			--cp-text-color: var(--color-white);
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
