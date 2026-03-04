import { describe, expect, it } from 'vitest';
import { Gradient, GradientColor } from './gradient.svelte';

describe('Gradient', () => {
	describe('sampling', () => {
		it('should sample gradient in the middle', () => {
			const cleanup = $effect.root(() => {
				const gradient = blackWhiteGradient(0, 1).getSampler();
				const sample = gradient.sample(0.5);
				expect(sample).toEqual({ r: 127.5, g: 127.5, b: 127.5, a: 1 });
			});
			cleanup();
		});

		it('should sample the white color', () => {
			const cleanup = $effect.root(() => {
				const gradient = blackWhiteGradient(0, 0.5).getSampler();
				const sample = gradient.sample(0.5);
				const sample2 = gradient.sample(1);
				expect(sample).toEqual({ r: 255, g: 255, b: 255, a: 1 });
				expect(sample2).toEqual({ r: 255, g: 255, b: 255, a: 1 });
			});
			cleanup();
		});

		it('should sample the black color', () => {
			const cleanup = $effect.root(() => {
				const gradient = blackWhiteGradient(0.5, 1).getSampler();
				const sample = gradient.sample(0.5);
				const sample2 = gradient.sample(0);
				expect(sample).toEqual({ r: 0, g: 0, b: 0, a: 1 });
				expect(sample2).toEqual({ r: 0, g: 0, b: 0, a: 1 });
			});
			cleanup();
		});
	});
});

function blackWhiteGradient(blackPos: number, whitePos: number) {
	return new Gradient([
		new GradientColor({ r: 0, g: 0, b: 0, a: 1 }, blackPos),
		new GradientColor({ r: 255, g: 255, b: 255, a: 1 }, whitePos)
	]);
}
