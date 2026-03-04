<script lang="ts">
	import { type CubemapTexture } from './cubemap.svelte';

	interface Coords {
		x: number;
		y: number;
	}

	const { cubemapTexture, ...props }: { cubemapTexture: CubemapTexture; class?: string } = $props();
	let contextUnavailable = $state(false);
	let highlightedCoords: Coords | null = $state(null);

	function attachCanvas(canvas: HTMLCanvasElement) {
		canvas.width = cubemapTexture.size * 4;
		canvas.height = cubemapTexture.size * 3;
		const context = canvas.getContext('2d');
		const styles = getComputedStyle(document.documentElement);
		const highlightColor = styles.getPropertyValue('--color-violet-800');

		if (!context) {
			contextUnavailable = true;
			return;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);

		for (const texture of cubemapTexture.textures) {
			const x = texture.x * cubemapTexture.size;
			const y = texture.y * cubemapTexture.size;
			context.putImageData(texture.data, x, y);

			if (highlightedCoords?.x === texture.x && highlightedCoords?.y === texture.y) {
				context.strokeStyle = highlightColor;
				context.strokeRect(x, y, cubemapTexture.size, cubemapTexture.size);
			}
		}
	}
</script>

{#if contextUnavailable}
	<div class={['flex items-center justify-center', props.class]}>
		<p>Your browser is not supported.</p>
	</div>
{:else}
	<p class="mb-2">
		This is the cubemap texture with the gradient projected on each face of the cube.
	</p>
	<p class="mb-2">
		<span class="mb-1 inline-block">Faces are in the following order:</span>
		{@render faceLabel('+Y axis', { x: 1, y: 0 })}
		{@render faceLabel('-X axis', { x: 0, y: 1 })}
		{@render faceLabel('+Z axis', { x: 1, y: 1 })}
		{@render faceLabel('+X axis', { x: 2, y: 1 })}
		{@render faceLabel('-Z axis', { x: 3, y: 1 })}
		{@render faceLabel('-Y axis', { x: 1, y: 2 })}
	</p>
	<div class="flex items-center justify-center">
		<canvas class={props.class} {@attach attachCanvas}> </canvas>
	</div>
{/if}

{#snippet faceLabel(label: string, coords: Coords)}
	<span
		class="cursor-help rounded-sm border border-transparent bg-mist-300 p-1 whitespace-nowrap hover:border-violet-800 dark:bg-mist-950"
		onmouseenter={() => (highlightedCoords = coords)}
		onmouseleave={() => (highlightedCoords = null)}
		role="none">{label}</span
	>
{/snippet}
