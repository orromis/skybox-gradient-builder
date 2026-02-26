<script lang="ts">
	interface Props {
		gradient1: string;
		gradient2: string;
		width: number;
	}

	let { gradient1, gradient2, width }: Props = $props();

	let faceWidth = $state(0);
	let faceHeight = $state(0);
	let height = $state(0);

	$effect(() => {
		// the diagram is rendered in 5:3 ratio
		// it displays cube texture, so it's divided into 12 regions
		height = (width / 5) * 3;
		faceWidth = width / 4;
		faceHeight = height / 3;
	});
</script>

<svg {width} {height}>
	<defs>
		<linearGradient id="gradient">
			<stop offset="0%" stop-color={gradient1} />
			<stop offset="100%" stop-color={gradient2} />
		</linearGradient>
	</defs>
	<!-->draw cubemap faces</-->
	<!-->ids describe face axes (px - facing the positive X axis)</-->
	{@render cubeFace('py', 1, 0)}
	{@render cubeFace('nx', 0, 1)}
	{@render cubeFace('pz', 1, 1)}
	{@render cubeFace('px', 2, 1)}
	{@render cubeFace('nz', 3, 1)}
	{@render cubeFace('ny', 1, 2)}
</svg>

{#snippet cubeFace(id: string, x: number, y: number)}
	<rect
		{id}
		x={x * faceWidth}
		y={y * faceHeight}
		width={faceWidth}
		height={faceHeight}
		fill="url(#gradient)"
	></rect>
{/snippet}
