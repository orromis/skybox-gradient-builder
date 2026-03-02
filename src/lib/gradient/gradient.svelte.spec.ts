import { describe, expect, it } from 'vitest';
import { Gradient, GradientColor } from './gradient.svelte';

describe('Gradient', () => {
	describe('sampling', () => {
		it('should sample gradient in the middle', () => {
			const gradient = blackWhiteGradient(0, 1);
			const sample = gradient.sample(0.5);
			expect(sample).toEqual({ r: 127.5, g: 127.5, b: 127.5, a: 1 });
		});

		it('should sample the white color', () => {
			const gradient = blackWhiteGradient(0, 0.5);
			const sample = gradient.sample(0.5);
			const sample2 = gradient.sample(1);
			expect(sample).toEqual({ r: 255, g: 255, b: 255, a: 1 });
			expect(sample2).toEqual({ r: 255, g: 255, b: 255, a: 1 });
		});

		it('should sample the black color', () => {
			const gradient = blackWhiteGradient(0.5, 1);
			const sample = gradient.sample(0.5);
			const sample2 = gradient.sample(0);
			expect(sample).toEqual({ r: 0, g: 0, b: 0, a: 1 });
			expect(sample2).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		});
	});
});

function blackWhiteGradient(blackPos: number, whitePos: number) {
	return new Gradient([
		new GradientColor({ r: 0, g: 0, b: 0, a: 1 }, blackPos),
		new GradientColor({ r: 255, g: 255, b: 255, a: 1 }, whitePos)
	]);
}
