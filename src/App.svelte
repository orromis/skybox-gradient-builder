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

	let textureSize = $state(128);
	let cubemapTexture = $derived(new Cubemap(gradient).generateTexture(textureSize));
	let file: Blob | null = $state(null);
	let fileUrl = $derived.by(() => {
		if (!file) {
			return null;
		}

		return URL.createObjectURL(file);
	});
</script>

<main class="container mx-auto">
	<article class="m-4">
		<section class="mb-4 text-lg">
			<header class="mb-4 flex justify-between">
				<h1 class="text-2xl md:text-3xl">Skybox builder</h1>
				{#if file}
					<a
						class="rounded-md bg-indigo-700 px-2 py-2 text-white hover:cursor-pointer hover:bg-indigo-800 focus:shadow-md focus:shadow-indigo-800/80 focus:outline-0 disabled:cursor-not-allowed disabled:bg-indigo-950 md:px-4"
						href={fileUrl}
						download="cubemap.png"
					>
						Download texture
					</a>
				{/if}
			</header>
			<p>This tools generates gradient cubemap texture and renders it in 3D.</p>
		</section>

		<div class="lg:flex">
			<div class="mr-4 lg:flex-3">
				<section class="mb-4">
					<GradientPicker bind:gradient />
				</section>

				<section class="mb-4">
					<CubemapDiagram bind:file {cubemapTexture} />
				</section>
			</div>

			<div class="lg:relative lg:flex-4">
				<div class="sticky top-24">
					<SkyboxScene {cubemapTexture} />
				</div>
			</div>
		</div>
	</article>
</main>
