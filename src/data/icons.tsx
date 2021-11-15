import React from 'react';

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

export const FreehandSvg = () => (
	<svg {...svgOptions} viewBox="-5 -4 30 30">
		<path d="m1.071-.119.119.837q.118.837.377 1.746.258.909.722 1.898.463.989.972 1.92.51.931 1.285 1.797.774.866 1.752 1.633.977.768 2.082 1.383t2.182.89q1.078.275 2.618-.2 1.54-.475 2.395-1.766t.875-2.518q.02-1.227-.915-1.86t-2.465-.61q-1.53.023-2.671 1.137-1.141 1.114-1.455 2.097-.314.984-.234 2.11.081 1.125.584 2.39.503 1.265 1.425 2.525.921 1.26 2.251 2.345 1.33 1.085 2.86 2.045 1.53.96 3.035 1.785 1.505.825 1.615.905.11.08.18.195.07.115.105.24.035.125.03.26-.005.135-.055.26t-.14.225q-.09.1-.205.165-.115.065-.245.095t-.26.015q-.13-.015-.25-.07-.12-.055-.22-.15t-.16-.215q-.06-.12-.08-.25-.02-.13 0-.26t.085-.25q.065-.12.165-.21t.22-.145q.12-.055.25-.07.13-.015.26.015t.245.1q.115.07.2.175.085.105.135.225.05.12.055.255.005.135-.03.265-.035.13-.11.24-.075.11-.185.19t-.235.12q-.125.04-.26.04t-.26-.045l-.125-.045-1.56-.825q-1.56-.825-3.2-1.815-1.64-.99-3.16-2.195-1.52-1.205-2.633-2.64T7.243 13.26q-.68-1.57-.784-3.126-.104-1.555.355-2.954.459-1.399 1.292-2.412.833-1.012 1.903-1.607 1.071-.596 2.301-.759 1.23-.163 2.375.103 1.145.265 2.135.9.99.635 1.525 1.559.535.924.595 1.896.06.973-.2 1.956t-.805 1.923q-.545.941-1.38 1.721-.835.78-1.895 1.235-1.06.455-2.285.485-1.225.03-2.535-.33-1.311-.36-2.573-1.035-1.262-.675-2.412-1.54-1.149-.865-2.107-1.918-.957-1.052-1.496-2.05Q.713 6.309.164 5.14q-.55-1.169-.824-2.25-.274-1.082-.342-1.927Q-1.071.12-1.07-.01q.002-.13.035-.255.032-.126.093-.24.062-.115.149-.211.087-.097.194-.17.108-.072.23-.117.122-.045.25-.059.13-.014.259.003t.25.064q.12.047.227.122.106.075.19.173.086.098.145.214.059.115.089.242l.03.126Z" />
	</svg>
);
