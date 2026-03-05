<script lang="ts">
	import { type CubemapTexture } from './cubemap.svelte';

	interface Coords {
		x: number;
		y: number;
	}

	let {
		cubemapTexture,
		file = $bindable(null)
	}: { cubemapTexture: CubemapTexture; file: Blob | null } = $props();
	let contextUnavailable = $state(false);
	let highlightedCoords: Coords | null = $state(null);
	let orientation = $state<'cube' | 'spritesheet'>('cube');

	function attachCanvas(canvas: HTMLCanvasElement) {
		if (orientation === 'cube') {
			canvas.width = cubemapTexture.size * 4;
			canvas.height = cubemapTexture.size * 3;
		} else {
			canvas.width = cubemapTexture.size;
			canvas.height = cubemapTexture.size * 6;
		}
		const context = canvas.getContext('2d');
		const styles = getComputedStyle(document.documentElement);
		const highlightColor = styles.getPropertyValue('--color-violet-800');

		if (!context) {
			contextUnavailable = true;
			return;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);

		for (const [i, texture] of cubemapTexture.textures.entries()) {
			let x = 0;
			let y = 0;

			if (orientation === 'cube') {
				x = texture.x * cubemapTexture.size;
				y = texture.y * cubemapTexture.size;
			} else {
				x = 0;
				y = i * cubemapTexture.size;
			}
			context.putImageData(texture.data, x, y);

			if (highlightedCoords?.x === texture.x && highlightedCoords?.y === texture.y) {
				context.strokeStyle = highlightColor;
				context.lineWidth = orientation === 'cube' ? 2 : 8;
				context.strokeRect(x, y, cubemapTexture.size, cubemapTexture.size);
			}
		}

		canvas.toBlob((blob) => (file = blob));
	}
</script>

<div class="mb-4 flex items-center justify-between">
	<h2 class="text-xl">Cubemap texture</h2>

	<span>
		<button
			class={[
				'cursor-pointer rounded-l-md border border-indigo-800 bg-indigo-100 p-2 text-black hover:bg-indigo-200 focus:shadow-md focus:shadow-indigo-800/80 focus:outline-0 [&.is-active]:bg-indigo-700 [&.is-active]:text-white',
				{ 'is-active': orientation === 'cube' }
			]}
			onclick={() => (orientation = 'cube')}
		>
			Cube
		</button><button
			class={[
				'cursor-pointer rounded-r-md border border-indigo-800 bg-indigo-100 p-2 text-black hover:bg-indigo-200 focus:shadow-md focus:shadow-indigo-800/80 focus:outline-0 [&.is-active]:bg-indigo-700 [&.is-active]:text-white',
				{ 'is-active': orientation === 'spritesheet' }
			]}
			onclick={() => (orientation = 'spritesheet')}
		>
			Spritesheet
		</button>
	</span>
</div>

{#if contextUnavailable}
	<div class="flex h-3/4 w-md items-center justify-center">
		<p>Your browser is not supported.</p>
	</div>
{:else}
	<p class="mb-2">
		This is the cubemap texture with the gradient projected on each face of the cube. You can
		download it with the button above. It will be downloaded in the selected format (cube or
		spritesheet).
	</p>
	<p class="mb-2">
		Each face of the cube corresponds to one axis in the 3D coordinate space. You can hover the axes
		to highlight the face on the texture:
	</p>
	<div class="mb-4 flex flex-wrap">
		{#each cubemapTexture.textures as face (face.label)}
			{@render faceLabel(face.label, { x: face.x, y: face.y })}
		{/each}
	</div>
	<div class="flex items-center justify-center">
		<canvas
			class={{
				'h-3/4 w-full md:w-md': orientation === 'cube',
				'h-60': orientation === 'spritesheet'
			}}
			{@attach attachCanvas}
		>
		</canvas>
	</div>
{/if}

{#snippet faceLabel(label: string, coords: Coords)}
	<span
		class="mb-2 cursor-help rounded-sm border border-transparent bg-mist-300 p-1 whitespace-nowrap hover:border-violet-800 dark:bg-mist-950"
		onmouseenter={() => (highlightedCoords = coords)}
		onmouseleave={() => (highlightedCoords = null)}
		role="none">{label}</span
	>&nbsp;
{/snippet}
