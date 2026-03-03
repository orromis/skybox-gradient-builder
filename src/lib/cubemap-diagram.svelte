<script lang="ts">
	import { type CubemapTexture } from './cubemap.svelte';

	const { cubemapTexture, ...props }: { cubemapTexture: CubemapTexture; class?: string } = $props();
	let contextUnavailable = $state(false);

	function attachCanvas(canvas: HTMLCanvasElement) {
		canvas.width = cubemapTexture.size * 4;
		canvas.height = cubemapTexture.size * 3;
		const context = canvas.getContext('2d');

		if (!context) {
			contextUnavailable = true;
			return;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);
		if (!context) {
			contextUnavailable = true;
			return;
		}

		for (const texture of cubemapTexture.textures) {
			context.putImageData(
				texture.data,
				texture.x * cubemapTexture.size,
				texture.y * cubemapTexture.size
			);
		}
	}
</script>

<canvas class={props.class} {@attach attachCanvas}> </canvas>
