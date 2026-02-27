<script lang="ts">
	import ColorPicker, { type RgbaColor } from 'svelte-awesome-color-picker';

	interface GradientColor {
		rgb: RgbaColor;
		position: number;
	}

	let colors: GradientColor[] = $state([
		{ rgb: { r: 0, g: 221, b: 255, a: 1 }, position: 0 },
		{ rgb: { r: 0, g: 255, b: 81, a: 1 }, position: 1 }
	]);
	let currentColorIndex = $state(0);
	let currentColor = $state(colors[0].rgb);
	let gradient = $derived.by(buildGradient);
	let knobContainerWidth = $state(0);
	let activeKnob: HTMLDivElement | null = $state(null);

	function colorChanged({ rgb: newColor }: { rgb: RgbaColor | null }) {
		if (newColor) {
			colors[currentColorIndex].rgb = newColor;
		}
	}

	function buildGradient() {
		let gradientColors = [];
		for (let color of colors) {
			gradientColors.push(`${getColorString(color.rgb)} ${color.position * 100}%`);
		}

		return `linear-gradient(90deg, ${gradientColors.join(',')})`;
	}

	function getColorString(color: RgbaColor) {
		return `rgba(${color.r},${color.g},${color.b},${color.a})`;
	}

	function dragKnob(event: PointerEvent) {
		if (event.buttons !== 1 || !activeKnob) {
			return;
		}

		let color = colors[currentColorIndex];
		let newPosition = color.position + event.movementX / (knobContainerWidth - 4);
		color.position = clamp(newPosition, 0, 1);
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
			currentColor = color;
		}
	}

	function deselectKnob() {
		if (activeKnob) {
			activeKnob.classList.remove('is-dragging');
			activeKnob = null;
		}
	}

	function lerp(start: number, end: number, t: number) {
		return (1 - t) * start + t * end;
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}
</script>

<svelte:window onpointermove={dragKnob} onpointerup={deselectKnob} />

<div
	class="relative m-2 h-5 w-sm bg-(--gradient)"
	style:--gradient={gradient}
	style={`background: ${gradient}`}
	bind:clientWidth={knobContainerWidth}
>
	{#each colors as color, i}
		<div
			class="absolute -top-1 h-7 w-2 cursor-grab rounded-full bg-(--knob-bg) [&.is-dragging]:cursor-move"
			style:--knob-bg={getColorString(color.rgb)}
			style:left={`${lerp(0, knobContainerWidth - 4, color.position)}px`}
			role="slider"
			aria-valuenow={color.position}
			tabindex={i}
			onpointerdowncapture={(event) => selectKnob(event, i, color.rgb)}
		></div>
	{/each}
</div>

<ColorPicker bind:rgb={currentColor} onInput={colorChanged} isDialog={false} />
