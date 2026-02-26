<script lang="ts">
	import './app.css';
	import CubemapDiagram from './lib/cubemap-diagram.svelte';
	import ColorPicker from 'svelte-awesome-color-picker';

	let gradient1: string = '#00ddff';
	let gradient2: string = '#00ff51';
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

		<ColorPicker bind:hex={gradient1} position="responsive" />
		<ColorPicker bind:hex={gradient2} position="responsive" />

		<CubemapDiagram {gradient1} {gradient2} width={600} />
	</article>
</main>
