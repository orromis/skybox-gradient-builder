<script lang="ts">
	import './app.css';
	import CubemapDiagram from './lib/cubemap-diagram.svelte';
	import { Cubemap } from './lib/cubemap.svelte';
	import { Gradient, GradientColor } from './lib/gradient/gradient.svelte';
	import GradientPicker from './lib/gradient/picker.svelte';
	import SkyboxScene from './lib/skybox-scene.svelte';

	let gradient = $state(
		new Gradient([
			new GradientColor({ r: 0, g: 221, b: 255, a: 1 }, 0),
			new GradientColor({ r: 0, g: 255, b: 81, a: 1 }, 1)
		])
	);
	const cubemapTexture = $derived(new Cubemap(gradient).drawTexture(64));
</script>

<main class="mx-auto">
	<header>
		<h1>Skybox builder</h1>
	</header>
	<article>
		<p>This tools generates gradient cubemap textures and visualises them in 3D.</p>

		<GradientPicker bind:gradient />

		<CubemapDiagram class="h-3/4 w-md" {cubemapTexture} />
		<SkyboxScene {cubemapTexture} />
	</article>
</main>
