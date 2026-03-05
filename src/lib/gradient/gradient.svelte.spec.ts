import { describe, expect, it } from 'vitest';
import { Gradient, GradientColor, MAX_COLORS, MIN_COLORS } from './gradient.svelte';
import { flushSync } from 'svelte';

describe('Gradient', () => {
	describe('Color', () => {
		it('should return hex color without alpha channel', () => {
			const color = new GradientColor({ r: 128, g: 0.6, b: 17, a: 1 }, 0);
			expect(color.hexColor).toEqual('#800111');
		});

		it('should return hex color with alpha channel if the alpha channel is less than 1', () => {
			const color = new GradientColor({ r: 128, g: 0.1, b: 14.999, a: 0.5 }, 0);

			expect(color.hexColor).toEqual('#80000f80');
		});

		it('should parse hex color without alpha channel', () => {
			const color = new GradientColor({ r: 0, g: 0, b: 0, a: 0.5 }, 0);
			const color2 = new GradientColor({ r: 0, g: 0, b: 0, a: 0.5 }, 0);
			color.hexColor = '#ff110a';
			color2.hexColor = '#FF110A';

			expect(color.rgb).toEqual({ r: 255, g: 17, b: 10, a: 0.5 });
			expect(color2.rgb).toEqual({ r: 255, g: 17, b: 10, a: 0.5 });
		});

		it('should parse hex color with alpha channel', () => {
			const color = new GradientColor({ r: 0, g: 0, b: 0, a: 0.5 }, 0);
			const color2 = new GradientColor({ r: 0, g: 0, b: 0, a: 0.5 }, 0);
			color.hexColor = '#ff110acc';
			color2.hexColor = '#FF110ACC';

			expect(color.rgb).toEqual({ r: 255, g: 17, b: 10, a: 0.8 });
			expect(color2.rgb).toEqual({ r: 255, g: 17, b: 10, a: 0.8 });
		});

		it('should keep position clamped between 0 and 1', () => {
			const color = new GradientColor({ r: 0, g: 0, b: 0, a: 0 }, 20);
			const color2 = new GradientColor({ r: 0, g: 0, b: 0, a: 0 }, -5);
			const color3 = new GradientColor({ r: 0, g: 0, b: 0, a: 0 }, 0.5);
			const color4 = new GradientColor({ r: 0, g: 0, b: 0, a: 0 }, 0.5);
			color3.position = 123;
			color4.position = -53;

			expect(color.position).toEqual(1);
			expect(color2.position).toEqual(0);
			expect(color3.position).toEqual(1);
			expect(color4.position).toEqual(0);
		});
	});

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

	describe('color order consistency', () => {
		it('should keep colors sorted by position if position changes', () => {
			const cleanup = $effect.root(() => {
				const gradient = new Gradient([black(0), black(0.2), black(1), black(0.3), black(0.1)]);

				flushSync();
				expect(gradient.colors.map((c) => c.position)).toEqual([0, 0.1, 0.2, 0.3, 1]);

				gradient.colors[0].position = 0.9;

				flushSync();
				expect(gradient.colors.map((c) => c.position)).toEqual([0.1, 0.2, 0.3, 0.9, 1]);
			});

			cleanup();
		});

		it('should sort colors after adding a new one', () => {
			const cleanup = $effect.root(() => {
				const gradient = blackWhiteGradient(0, 1);
				gradient.addColor();

				flushSync();
				expect(gradient.colors).toEqual(
					gradient.colors.slice().sort((a, b) => a.position - b.position)
				);
			});

			cleanup();
		});

		it('should sort colors after removing a color', () => {
			const cleanup = $effect.root(() => {
				const gradient = blackWhiteGradient(0, 1);
				gradient.addColor();
				gradient.addColor();

				const index = gradient.removeColor(gradient.colors[0]);
				expect(index).toEqual(0);

				flushSync();
				expect(gradient.colors).toEqual(
					gradient.colors.slice().sort((a, b) => a.position - b.position)
				);
			});

			cleanup();
		});
	});

	describe('color limits', () => {
		it('should keep the maximum color limit in constructor', () => {
			const cleanup = $effect.root(() => {
				const gradient = new Gradient(
					Array.from({ length: MAX_COLORS + 1 }).map((_, i) => black((i + 1) / MAX_COLORS))
				);

				expect(gradient.colors.length).toEqual(MAX_COLORS);
			});

			cleanup();
		});

		it('should not insert any new color when the limit is reached', () => {
			const cleanup = $effect.root(() => {
				const gradient = new Gradient(
					Array.from({ length: MAX_COLORS }).map((_, i) => black((i + 1) / MAX_COLORS))
				);

				expect(gradient.canAddColor).toBe(false);

				gradient.addColor();
				expect(gradient.colors.length).toEqual(MAX_COLORS);
			});

			cleanup();
		});

		it(`should not remove colors if there are less than ${MIN_COLORS} colors`, () => {
			const cleanup = $effect.root(() => {
				const gradient = blackWhiteGradient(0, 1);

				expect(gradient.canRemoveColor).toBe(false);

				const index = gradient.removeColor(gradient.colors[0]);
				expect(index).toEqual(false);
				expect(gradient.colors.length).toEqual(MIN_COLORS);
			});

			cleanup();
		});
	});

	it('should create correct css gradient string', () => {
		const cleanup = $effect.root(() => {
			const gradient = blackWhiteGradient(0, 0.45);

			expect(gradient.getCssString()).toEqual(
				`linear-gradient(${gradient.angle}deg,rgba(0,0,0,1) 0%,rgba(255,255,255,1) 45%)`
			);
		});

		cleanup();
	});

	it('should compute correct 3D direction vector for gradient angle', () => {
		const cleanup = $effect.root(() => {
			const gradient = blackWhiteGradient(0, 0.45);

			expect(gradient.direction).toMatchInlineSnapshot(`
				_Vector3 {
				  "x": -1.2246467991473532e-16,
				  "y": -1,
				  "z": 0,
				}
			`);
		});

		cleanup();
	});
});

function blackWhiteGradient(blackPos: number, whitePos: number) {
	return new Gradient([
		new GradientColor({ r: 0, g: 0, b: 0, a: 1 }, blackPos),
		new GradientColor({ r: 255, g: 255, b: 255, a: 1 }, whitePos)
	]);
}

function black(position: number) {
	return new GradientColor({ r: 0, g: 0, b: 0, a: 1 }, position);
}
