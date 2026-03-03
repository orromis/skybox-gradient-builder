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
		class?: string;
	}

	type Texture = CubeTexture<ImageData>;

	const { cubemapTexture, ...props }: Props = $props();
	let cubeTexture: Texture | null = null;
	let camera: PerspectiveCamera | null = null;
	let scene: Scene | null = null;

	function setupScene(canvas: HTMLCanvasElement) {
		if (!cubemapTexture) {
			return;
		}

		if (!cubeTexture) {
			cubeTexture = new CubeTexture(cubemapTexture.textures.map((t) => t.data));
			cubeTexture.needsUpdate = true;
		} else {
			cubeTexture.images = cubemapTexture.textures.map((t) => t.data);
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
			// seconds
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

<canvas class={props.class} width="800" height="600" {@attach setupScene}></canvas>
