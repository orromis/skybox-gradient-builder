<script lang="ts">
	import './app.css';
	import { Cubemap } from './lib/cubemap.svelte';
	import { Gradient, GradientColor } from './lib/gradient/gradient.svelte';
	import GradientPicker from './lib/gradient/picker.svelte';
	import SkyboxScene from './lib/skybox-scene.svelte';

	let textureData: ImageData[] | null = $state(null);

	let gradient = $state(
		new Gradient([
			new GradientColor({ r: 0, g: 221, b: 255, a: 1 }, 0),
			new GradientColor({ r: 0, g: 255, b: 81, a: 1 }, 1)
		])
	);

	function attachCanvas(canvas: HTMLCanvasElement) {
		let context = canvas.getContext('2d');
		let size = { width: 512, height: 384 };
		canvas.width = size.width;
		canvas.height = size.height;
		if (context) {
			textureData = new Cubemap(gradient).drawTexture(context, size);
		}
	}
</script>

<main class="mx-auto">
	<header>
		<h1>Skybox builder</h1>
	</header>
	<article>
		<p>
			This is a simple utility tool for generating simpe skybox cubemap textures. If you want to
			generate a cubemap from panorama photos, you can use <a href="https://github.com/jaxry"
				>Lucas Crane</a
			>'s
			<a href="https://github.com/jaxry/panorama-to-cubemap">panorama-to-cubemap</a>.
		</p>
		<p>
			The main motivation behind this tool was me trying to add a simple gradient skybox to my Bevy
			project and finding out that the process is a bit more complicated then I expected it to be.
			And I can also try out Svelte!
		</p>

		<GradientPicker bind:gradient />

		<canvas {@attach attachCanvas}></canvas>
		<SkyboxScene {textureData} />
	</article>
</main>
