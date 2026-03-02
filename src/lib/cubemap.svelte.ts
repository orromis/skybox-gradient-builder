import { Vector3 } from 'three';
import type { Gradient } from './gradient/gradient.svelte';

export class Cubemap {
	constructor(public gradient: Gradient) {}

	drawTexture(context: CanvasRenderingContext2D, size: { width: number; height: number }) {
		context.clearRect(0, 0, size.width, size.height);
		const gradientDir = this.gradient.direction;
		const faces: { x: number; y: number; index: number }[] = [
			{ x: 2, y: 1, index: 0 }, // px
			{ x: 0, y: 1, index: 1 }, // nx
			{ x: 1, y: 0, index: 2 }, // py
			{ x: 1, y: 2, index: 3 }, // ny
			{ x: 1, y: 1, index: 4 }, // pz
			{ x: 3, y: 1, index: 5 } // nz
		];
		const faceWidth = size.width / 4;
		const faceHeight = size.height / 3;
		const textureData: ImageData[] = [];
		const halfPxX = 0.5 / faceWidth;
		const halfPxY = 0.5 / faceHeight;

		for (const face of faces) {
			const imageData = new ImageData(faceWidth, faceHeight);
			const p1 = cubemapCorner(face.index * 4);
			const p2 = cubemapCorner(face.index * 4 + 1);
			const p3 = cubemapCorner(face.index * 4 + 2);
			const p4 = cubemapCorner(face.index * 4 + 3);

			for (let y = 0; y < faceHeight; y++) {
				let py = 1 - (y / faceHeight + halfPxY);
				if (face.index == 2) {
					py = 1 - py;
				}

				for (let x = 0; x < faceWidth; x++) {
					let px = 1 - (x / faceWidth + halfPxX);

					if (face.index == 2) {
						px = 1 - px;
					}

					const pl = new Vector3().lerpVectors(p1, p4, py);
					const pr = new Vector3().lerpVectors(p2, p3, py);
					const pt = new Vector3().lerpVectors(pl, pr, px);
					pt.normalize();

					const pct = (pt.dot(gradientDir) + 1) * 0.5;
					const sample = this.gradient.sample(pct);
					if (sample) {
						const stride = (x + y * faceHeight) * 4;
						imageData.data[stride] = sample.r;
						imageData.data[stride + 1] = sample.g;
						imageData.data[stride + 2] = sample.b;
						imageData.data[stride + 3] = sample.a * 255;
					}
				}
			}
			context.putImageData(imageData, face.x * faceWidth, face.y * faceHeight);
			textureData.push(imageData);
		}
		return textureData;
	}
}

// borrowed from https://github.com/StereoKit/StereoKit/blob/ed45314218102da2d1952e51aca544c6e5409509/StereoKitC/sk_math.cpp#L527
export function cubemapCorner(i: number) {
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
