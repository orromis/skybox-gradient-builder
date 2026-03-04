<script lang="ts">
	import {
		AxesHelper,
		BoxGeometry,
		CubeTexture,
		Mesh,
		MeshNormalMaterial,
		PerspectiveCamera,
		Scene,
		WebGLRenderer
	} from 'three';
	import { OrbitControls } from 'three/examples/jsm/Addons.js';
	import type { CubemapTexture } from './cubemap.svelte';

	interface Props {
		cubemapTexture: CubemapTexture | null;
	}

	type Texture = CubeTexture<ImageData>;

	const { cubemapTexture }: Props = $props();
	let cubeTexture: Texture | null = null;
	let camera: PerspectiveCamera | null = null;
	let scene: Scene | null = null;

	function setupScene(canvas: HTMLCanvasElement) {
		if (!cubemapTexture) {
			return;
		}

		// nx and px are swapped probably because of this:
		// https://github.com/mrdoob/three.js/blob/8886ab6e95f4b06945ffb5d19c531c09dc6c5ce7/src/renderers/WebGLCubeRenderTarget.js#L47
		const textures = [
			cubemapTexture.textures[1],
			cubemapTexture.textures[0],
			...cubemapTexture.textures.slice(2)
		];

		if (!cubeTexture) {
			cubeTexture = new CubeTexture(textures.map((t) => t.data));
			cubeTexture.needsUpdate = true;
		} else {
			cubeTexture.images = textures.map((t) => t.data);
			cubeTexture.needsUpdate = true;
		}

		if (camera && scene) {
			return;
		}

		scene = new Scene();
		camera = new PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 1000);
		camera.position.z = 3;

		const orbitControls = new OrbitControls(camera, canvas);
		orbitControls.minDistance = 2;
		orbitControls.maxDistance = 10;
		orbitControls.enablePan = false;
		// set the camera rotation so that the projection corresponds with
		// 2D gradient visualisation
		orbitControls.rotateLeft(Math.PI);

		const axes = new AxesHelper();
		const geometry = new BoxGeometry(0.2, 0.2, 0.2);
		const material = new MeshNormalMaterial();
		const mesh = new Mesh(geometry, material);
		scene.add(mesh, axes);
		scene.background = cubeTexture;

		const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor('#000000');
		render(renderer, scene, camera, orbitControls);
	}

	function render(
		renderer: WebGLRenderer,
		scene: Scene,
		camera: PerspectiveCamera,
		controls: OrbitControls
	) {
		let lastTime = 0;

		function draw(time: DOMHighResTimeStamp) {
			// fraction of second
			time *= 0.001;
			const dt = time - lastTime;
			lastTime = time;
			controls.update(dt);
			renderer.render(scene, camera);

			requestAnimationFrame(draw);
		}

		requestAnimationFrame(draw);
	}
</script>

<h2 class="mb-4 text-xl">3D preview</h2>
<canvas
	class="mb-2 w-full rounded-md border border-mist-300 dark:border-mist-700"
	width="800"
	height="600"
	{@attach setupScene}
></canvas>

<p class="text-center text-sm">
	You can rotate camera by clicking and dragging in the scene. You can also zoom with scroll wheel
	or gestures.
</p>
