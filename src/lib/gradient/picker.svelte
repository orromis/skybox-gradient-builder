<script lang="ts">
	import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';
	import { Gradient } from './gradient.svelte';
	import { lerp } from '../utils';

	interface Props {
		gradient: Gradient;
	}

	let { gradient = $bindable() }: Props = $props();
	let currentColorIndex = $state(0);
	let currentColor = $derived(gradient.colors[currentColorIndex]);
	let knobContainerWidth = $state(0);
	let activeKnob: HTMLDivElement | null = $state(null);

	function colorChanged({ rgb: newColor }: { rgb: RgbaColor | null }) {
		if (newColor) {
			currentColor.rgb = newColor;
		}
	}

	function dragKnob(event: PointerEvent) {
		if (event.buttons !== 1 || !activeKnob) {
			return;
		}

		currentColor.position += event.movementX / (knobContainerWidth - 4);
		event.preventDefault();
		event.stopPropagation();
	}

	function selectKnob(
		event: PointerEvent & { currentTarget: HTMLDivElement },
		colorIndex: number,
		color: RgbaColor
	) {
		if (event.buttons === 1) {
			event.currentTarget.classList.add('is-dragging');
			activeKnob = event.currentTarget;
			currentColorIndex = colorIndex;
			currentColor.rgb = color;
		}
	}

	function stopDraggingKnob(event: PointerEvent) {
		if (event.button !== 0) {
			return;
		}

		if (activeKnob) {
			activeKnob.classList.remove('is-dragging');
			activeKnob = null;
			// clamp the position to avoid storing over dragged values
			currentColor.position = currentColor.clampedPosition;
		}
	}
</script>

<svelte:window onpointermove={dragKnob} onpointerup={stopDraggingKnob} />

<div
	class="relative m-2 h-5 w-sm"
	style:background={gradient.getCssString(false)}
	bind:clientWidth={knobContainerWidth}
>
	{#each gradient.colors as color, i}
		<div
			class="absolute -top-1 h-7 w-2 cursor-grab rounded-full [&.is-dragging]:cursor-move"
			style:background={color.cssColor}
			style:left={`${lerp(0, knobContainerWidth - 4, color.clampedPosition)}px`}
			role="slider"
			aria-valuenow={color.position}
			tabindex={i}
			onpointerdown={(event) => selectKnob(event, i, color.rgb)}
		></div>
	{/each}
</div>

<ColorPicker bind:rgb={currentColor.rgb} onInput={colorChanged} isDialog={false} />

<input class="w-sm" type="range" bind:value={gradient.angle} min="0" max="360" />
<input type="number" bind:value={gradient.angle} min="0" max="360" />
