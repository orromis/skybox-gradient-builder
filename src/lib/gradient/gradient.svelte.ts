import type { RgbaColor } from 'svelte-awesome-color-picker';
import { clamp, lerp } from '../utils';
import { Vector3 } from 'three';

export const MAX_COLORS = 15;
export const MIN_COLORS = 2;

let counter = 0;

export class GradientColor {
	rgb: RgbaColor;
	#position: number;
	id = counter++;

	#invalidHex: string | null = $state(null);

	constructor(color: RgbaColor, position: number) {
		this.rgb = $state(color);
		this.#position = $state(clamp(position, 0, 1));
	}

	get cssColor() {
		return `rgba(${this.rgb.r},${this.rgb.g},${this.rgb.b},${this.rgb.a})`;
	}

	get hexColor() {
		if (this.#invalidHex !== null) {
			return this.#invalidHex;
		}

		const r = Math.round(this.rgb.r).toString(16).padStart(2, '0');
		const g = Math.round(this.rgb.g).toString(16).padStart(2, '0');
		const b = Math.round(this.rgb.b).toString(16).padStart(2, '0');
		const a =
			this.rgb.a < 1
				? Math.round(this.rgb.a * 255)
						.toString(16)
						.padStart(2, '0')
				: null;
		return `#${r}${g}${b}${a ?? ''}`;
	}

	get position() {
		return this.#position;
	}

	set position(value: number) {
		this.#position = clamp(value, 0, 1);
	}

	set hexColor(color: string) {
		const parsedColor = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
		if (parsedColor) {
			this.rgb.r = parseInt(parsedColor[1], 16);
			this.rgb.g = parseInt(parsedColor[2], 16);
			this.rgb.b = parseInt(parsedColor[3], 16);

			if (parsedColor[4]) {
				this.rgb.a = parseInt(parsedColor[4], 16) / 255;
			} else {
				this.rgb.a = 1;
			}

			this.#invalidHex = null;
		} else {
			this.#invalidHex = color;
		}
	}

	get positionPercent() {
		return Math.round(this.position * 100);
	}

	set positionPercent(value: number) {
		this.position = value / 100;
	}

	resetInvalidHex() {
		this.#invalidHex = null;
		console.log(this.hexColor);
	}
}

export class Gradient {
	colors: GradientColor[];
	angle: number;

	constructor(colors: GradientColor[], angle: number = 180) {
		this.colors = $state(colors.slice(0, MAX_COLORS));
		this.angle = $state(angle);

		$effect(() => {
			this.colors.sort((a, b) => a.position - b.position);
		});
	}

	get direction() {
		const angleRad = (Math.PI / 180) * this.angle;
		return new Vector3(0, 1, 0).applyAxisAngle({ x: 0, y: 0, z: 1 }, angleRad);
	}

	get limit() {
		return MAX_COLORS - this.colors.length;
	}

	get canAddColor() {
		return MAX_COLORS > this.colors.length;
	}

	get canRemoveColor() {
		return this.colors.length > 2;
	}

	getCssString(angleOverride = this.angle) {
		const gradientColors = [];
		for (const color of this.colors) {
			gradientColors.push(`${color.cssColor} ${color.position * 100}%`);
		}

		return `linear-gradient(${angleOverride}deg,${gradientColors.join(',')})`;
	}

	addColor() {
		if (!this.canAddColor) {
			return;
		}

		const r = Math.floor(Math.random() * 255);
		const g = Math.floor(Math.random() * 255);
		const b = Math.floor(Math.random() * 255);

		this.colors.push(new GradientColor({ r, g, b, a: 1 }, Math.random()));
	}

	removeColor(color: GradientColor) {
		if (!this.canRemoveColor) {
			return false;
		}

		const index = this.colors.indexOf(color);

		if (index !== -1) {
			this.colors.splice(index, 1);
			return index;
		}

		return false;
	}

	getSampler() {
		// sampler copies the colors, breaking away from svelte state and it's overhead
		// this speeds up texture generation when sampling pixels for the texture
		return new GradientSampler(
			this.colors.map(({ rgb, position }) => ({ rgb: { ...rgb }, position }))
		);
	}
}

interface StrippedColor {
	rgb: RgbaColor;
	position: number;
}

export class GradientSampler {
	#colors: StrippedColor[];

	constructor(colors: StrippedColor[]) {
		this.#colors = colors;
	}

	sample(samplePosition: number) {
		let colorLeft: StrippedColor | null = null;
		let colorRight: StrippedColor | null = null;
		const t = clamp(samplePosition, 0, 1);

		// find the gradient colors that are closest to the sampled position
		for (let i = 0; i < this.#colors.length; i++) {
			const color = this.#colors[i];
			const position = color.position;

			if (position <= t) {
				colorLeft = color;
			} else if (position >= t) {
				colorRight = color;
				break;
			}
		}

		if (colorLeft && colorRight) {
			const position = colorLeft.position;
			const nextPosition = colorRight.position;
			const localT = (t - position) / (nextPosition - position);
			const r = lerp(colorLeft.rgb.r, colorRight.rgb.r, localT);
			const g = lerp(colorLeft.rgb.g, colorRight.rgb.g, localT);
			const b = lerp(colorLeft.rgb.b, colorRight.rgb.b, localT);
			const a = lerp(colorLeft.rgb.a, colorRight.rgb.a, localT);

			return { r, g, b, a } as RgbaColor;
		} else if (colorLeft) {
			return colorLeft.rgb;
		} else if (colorRight) {
			return colorRight.rgb;
		}

		return null;
	}
}
