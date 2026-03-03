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
	let textureSize = $state(64);
	const cubemapTexture = $derived(new Cubemap(gradient).drawTexture(textureSize));
</script>

<main class="container mx-auto">
	<article class="m-4">
		<section class="mb-4 text-lg">
			<header class="mb-4 text-3xl">
				<h1>Skybox builder</h1>
			</header>
			<p>This tools generates gradient cubemap texture and renders it in 3D.</p>
		</section>

		<div class="flex">
			<div class="mr-4 flex-2">
				<section class="mb-4">
					<h2 class="mb-4 text-xl">Texture and gradient settings</h2>
					<GradientPicker bind:gradient />
				</section>

				<section class="mb-4">
					<h2 class="mb-4 text-xl">Cubemap diagram</h2>
					<CubemapDiagram class="h-3/4 w-md" {cubemapTexture} />
				</section>
			</div>
			<div class="relative flex-3">
				<div class="sticky top-24">
					<h2 class="mb-4 text-xl">3D preview</h2>
					<SkyboxScene class="w-full" {cubemapTexture} />
				</div>
			</div>
		</div>
	</article>
</main>
