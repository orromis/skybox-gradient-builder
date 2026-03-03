import { Vector3 } from 'three';
import { Gradient } from './gradient/gradient.svelte';

export interface CubemapTexture {
	textures: { data: ImageData; x: number; y: number }[];
	size: number;
}

export class Cubemap {
	constructor(public gradient: Gradient) {}

	// based on https://github.com/StereoKit/StereoKit/blob/ed45314218102da2d1952e51aca544c6e5409509/StereoKitC/asset_types/texture.cpp#L1366
	drawTexture(size: number) {
		const gradientDir = this.gradient.direction;
		const faces: { x: number; y: number; index: number }[] = [
			// nx and px are swapped probably because of this:
			// https://github.com/mrdoob/three.js/blob/8886ab6e95f4b06945ffb5d19c531c09dc6c5ce7/src/renderers/WebGLCubeRenderTarget.js#L47
			{ x: 0, y: 1, index: 1 }, // nx
			{ x: 2, y: 1, index: 0 }, // px
			{ x: 1, y: 0, index: 2 }, // py
			{ x: 1, y: 2, index: 3 }, // ny
			{ x: 1, y: 1, index: 4 }, // pz
			{ x: 3, y: 1, index: 5 } // nz
		];
		const textureData: CubemapTexture = { size, textures: [] };

		for (const face of faces) {
			const imageData = new ImageData(size, size);

			// points are in the following order
			// p3  p4
			// p2  p1
			const p1 = this.#cubemapCorner(face.index * 4);
			const p2 = this.#cubemapCorner(face.index * 4 + 1);
			const p3 = this.#cubemapCorner(face.index * 4 + 2);
			const p4 = this.#cubemapCorner(face.index * 4 + 3);

			for (let y = 0; y < size; y++) {
				let yPosition = 1 - y / size;
				if (face.index == 2) {
					yPosition = 1 - yPosition;
				}

				for (let x = 0; x < size; x++) {
					let xPosition = 1 - x / size;

					if (face.index == 2) {
						xPosition = 1 - xPosition;
					}

					// locate current pixel in the gradient
					const right = new Vector3().lerpVectors(p1, p4, yPosition);
					const left = new Vector3().lerpVectors(p2, p3, yPosition);
					const point = new Vector3().lerpVectors(right, left, xPosition);
					const pointGradientPosition = (point.normalize().dot(gradientDir) + 1) * 0.5;
					const sample = this.gradient.sample(pointGradientPosition);

					if (sample) {
						const stride = (x + y * size) * 4;
						imageData.data[stride] = sample.r;
						imageData.data[stride + 1] = sample.g;
						imageData.data[stride + 2] = sample.b;
						imageData.data[stride + 3] = sample.a * 255;
					}
				}
			}
			textureData.textures.push({ data: imageData, x: face.x, y: face.y });
		}

		return textureData;
	}

	// borrowed from https://github.com/StereoKit/StereoKit/blob/ed45314218102da2d1952e51aca544c6e5409509/StereoKitC/sk_math.cpp#L527
	#cubemapCorner(i: number) {
		const faceIndex = Math.floor(i / 4);
		const neg = faceIndex % 2 ? -1 : 1;

		// pick face axis
		// only one of those is 1 at one time
		const nx = Math.floor((i + 24) / 16) % 2;
		const ny = Math.floor(i / 8) % 2;
		const nz = Math.floor(i / 16) % 2;

		// pick a face corner from bottom right to top right
		const u = Math.floor((i + 1) / 2) % 2; // U: 0,1,1,0
		const v = Math.floor(i / 2) % 2; // V: 0,0,1,1

		// compute the corner 3D vector
		const x = nx ? neg : ny ? (u ? -1 : 1) * neg : (u ? 1 : -1) * neg;
		const y = nx || nz ? (v ? 1 : -1) : neg;
		const z = nx ? (u ? -1 : 1) * neg : ny ? (v ? 1 : -1) : neg;

		return new Vector3(x, y, z);
	}
}
