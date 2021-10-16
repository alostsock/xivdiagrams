const svgOptions: React.SVGAttributes<SVGSVGElement> = {
	width: '100%',
	height: '100%',
	strokeWidth: '1',
	strokeLinejoin: 'round',
	strokeLinecap: 'round',
};

export const CursorSvg = () => (
	<svg {...svgOptions} viewBox="0 0 6 7">
		<path
			transform="translate(-0.4, 0) rotate(-26.565051, 3, 3.5)"
			d="m 1,5 2,-4 2,4 -1.7,-0.75 v2 h-0.6 v-2 z"
		/>
	</svg>
);

export const CircleSvg = () => (
	<svg {...svgOptions} strokeWidth="1" viewBox="0 0 8 8">
		<path d="m 4,1 a 3 3, 0, 1, 0, 0 6 a 3 3, 0, 1, 0, 0 -6 z" />
	</svg>
);

export const ConeSvg = () => (
	<svg {...svgOptions} viewBox="0 0 8 8">
		<path
			transform="translate(0.6, 0) rotate(33, 1, 1)"
			d="m 7,1 a 6 6, 0, 0, 1, -2.1432743 4.5962667 L 1,1 z"
		/>
	</svg>
);

export const RectSvg = () => (
	<svg {...svgOptions} viewBox="0 0 8 8">
		<path d="m 1,1 h6 v6 h-6 z" />
	</svg>
);

export const LineSvg = () => (
	<svg {...svgOptions} viewBox="0 0 8 8">
		<path transform="rotate(-26.565051, 4, 4)" d="m 4,0.5 v7" />
	</svg>
);

export const ArrowSvg = () => (
	<svg {...svgOptions} viewBox="0 0 8 8">
		<g transform="rotate(-26.565051, 4, 4)">
			<path d="m 4,0.5 v7" />
			<path d="m 4,0.5 l -1.5,2.5" />
			<path d="m 4,0.5 l 1.5,2.5" />
		</g>
	</svg>
);
