import { describe, expect, it, vi } from 'vitest';
import { Cubemap, FACES } from './cubemap.svelte';
import { GradientSampler } from './gradient/gradient.svelte';
import type { RgbaColor } from 'svelte-awesome-color-picker';
import { Vector3 } from 'three';

describe('Cubemap', () => {
	it('should generate a cubemap texture', () => {
		const size = 2;
		const expectedColors = [
			black(),
			white(),
			green(),
			red(),
			white(),
			blue(),
			red(),
			red(),
			green(),
			blue(),
			black(),
			red(),
			green(),
			blue(),
			black(),
			transparent(),
			green(),
			green(),
			black(),
			white(),
			green(),
			green(),
			black(),
			transparent()
		];

		const gradientMock = mockGradient(expectedColors);
		const cubemapTexture = new Cubemap(gradientMock.mock).generateTexture(size);
		const facePixels = size * size;

		expect(cubemapTexture.size).toEqual(size);
		for (const [i, face] of cubemapTexture.textures.entries()) {
			const stride = i * facePixels;
			const expectedFace = FACES[i];
			const faceColors = expectedColors.slice(stride, stride + facePixels).flatMap((color, j) => {
				expect(gradientMock.sampler.sample).toHaveBeenNthCalledWith(i + j + 1, 0.5);
				return [color.r, color.g, color.b, color.a * 255];
			});

			expect(face.label).toEqual(expectedFace.label);
			expect(face.x).toEqual(expectedFace.x);
			expect(face.y).toEqual(expectedFace.y);
			expect(Array.from(face.data.data)).toEqual(faceColors);
		}
	});

	it('should generate a black cubemap texture if sampler returns nothing', () => {
		const size = 3;
		const gradientMock = mockGradient([]);
		const cubemapTexture = new Cubemap(gradientMock.mock).generateTexture(size);
		const facePixels = size * size;

		expect(cubemapTexture.size).toEqual(size);
		expect(cubemapTexture.textures.flatMap((t) => Array.from(t.data.data))).toEqual(
			// 4 values per pixel, 6 faces
			Array.from({ length: facePixels * 4 * 6 }).fill(0)
		);
	});
});

function mockGradient(expectedColors: RgbaColor[]) {
	let colorIndex = 0;
	const sampler = new GradientSampler([]);
	sampler.sample = vi.fn(() => expectedColors[colorIndex++]);
	return {
		mock: {
			direction: new Vector3(0, 0, 0),
			getSampler: () => {
				return sampler;
			}
		},
		sampler
	};
}

function black() {
	return { r: 0, g: 0, b: 0, a: 1 };
}

function white() {
	return { r: 255, g: 255, b: 255, a: 1 };
}

function red() {
	return { r: 255, g: 0, b: 0, a: 1 };
}

function green() {
	return { r: 0, g: 255, b: 0, a: 1 };
}

function blue() {
	return { r: 0, g: 255, b: 255, a: 1 };
}

function transparent() {
	return { r: 127, g: 127, b: 127, a: 0 };
}
