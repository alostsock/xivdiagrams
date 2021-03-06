import React from 'react';

const iconSvgAttrs: React.SVGAttributes<SVGSVGElement> = {
	width: '100%',
	height: '100%',
	strokeWidth: '1',
	strokeLinejoin: 'round',
	strokeLinecap: 'round',
};

export const CursorSvg = () => (
	<svg {...iconSvgAttrs} viewBox="0 0 6 7">
		<path
			transform="translate(-0.4, 0) rotate(-26.565051, 3, 3.5)"
			d="m 1,5 2,-4 2,4 -1.7,-0.75 v2 h-0.6 v-2 z"
		/>
	</svg>
);

export const CircleSvg = () => (
	<svg {...iconSvgAttrs} strokeWidth="1" viewBox="0 0 8 8">
		<path d="m 4,1 a 3 3, 0, 1, 0, 0 6 a 3 3, 0, 1, 0, 0 -6 z" />
	</svg>
);

export const ConeSvg = () => (
	<svg {...iconSvgAttrs} viewBox="0 0 8 8">
		<path
			transform="translate(0.6, 0) rotate(33, 1, 1)"
			d="m 7,1 a 6 6, 0, 0, 1, -2.1432743 4.5962667 L 1,1 z"
		/>
	</svg>
);

export const RectSvg = () => (
	<svg {...iconSvgAttrs} viewBox="0 0 8 8">
		<path d="m 1,1 h6 v6 h-6 z" />
	</svg>
);

export const LineSvg = () => (
	<svg {...iconSvgAttrs} viewBox="0 0 8 8">
		<path transform="rotate(-26.565051, 4, 4)" d="m 4,0.5 v7" />
	</svg>
);

export const ArrowSvg = () => (
	<svg {...iconSvgAttrs} viewBox="0 0 8 8">
		<g transform="rotate(-26.565051, 4, 4)">
			<path d="m 4,0.5 v7" />
			<path d="m 4,0.5 l -1.5,2.5" />
			<path d="m 4,0.5 l 1.5,2.5" />
		</g>
	</svg>
);

export const FreehandSvg = () => (
	<svg {...iconSvgAttrs} viewBox="-5 -4 30 30">
		<path d="m1.071-.119.119.837q.118.837.377 1.746.258.909.722 1.898.463.989.972 1.92.51.931 1.285 1.797.774.866 1.752 1.633.977.768 2.082 1.383t2.182.89q1.078.275 2.618-.2 1.54-.475 2.395-1.766t.875-2.518q.02-1.227-.915-1.86t-2.465-.61q-1.53.023-2.671 1.137-1.141 1.114-1.455 2.097-.314.984-.234 2.11.081 1.125.584 2.39.503 1.265 1.425 2.525.921 1.26 2.251 2.345 1.33 1.085 2.86 2.045 1.53.96 3.035 1.785 1.505.825 1.615.905.11.08.18.195.07.115.105.24.035.125.03.26-.005.135-.055.26t-.14.225q-.09.1-.205.165-.115.065-.245.095t-.26.015q-.13-.015-.25-.07-.12-.055-.22-.15t-.16-.215q-.06-.12-.08-.25-.02-.13 0-.26t.085-.25q.065-.12.165-.21t.22-.145q.12-.055.25-.07.13-.015.26.015t.245.1q.115.07.2.175.085.105.135.225.05.12.055.255.005.135-.03.265-.035.13-.11.24-.075.11-.185.19t-.235.12q-.125.04-.26.04t-.26-.045l-.125-.045-1.56-.825q-1.56-.825-3.2-1.815-1.64-.99-3.16-2.195-1.52-1.205-2.633-2.64T7.243 13.26q-.68-1.57-.784-3.126-.104-1.555.355-2.954.459-1.399 1.292-2.412.833-1.012 1.903-1.607 1.071-.596 2.301-.759 1.23-.163 2.375.103 1.145.265 2.135.9.99.635 1.525 1.559.535.924.595 1.896.06.973-.2 1.956t-.805 1.923q-.545.941-1.38 1.721-.835.78-1.895 1.235-1.06.455-2.285.485-1.225.03-2.535-.33-1.311-.36-2.573-1.035-1.262-.675-2.412-1.54-1.149-.865-2.107-1.918-.957-1.052-1.496-2.05Q.713 6.309.164 5.14q-.55-1.169-.824-2.25-.274-1.082-.342-1.927Q-1.071.12-1.07-.01q.002-.13.035-.255.032-.126.093-.24.062-.115.149-.211.087-.097.194-.17.108-.072.23-.117.122-.045.25-.059.13-.014.259.003t.25.064q.12.047.227.122.106.075.19.173.086.098.145.214.059.115.089.242l.03.126Z" />
	</svg>
);

export const LeftSvg = () => (
	<svg {...iconSvgAttrs} viewBox="0 0 8 8">
		<path d="M 4,1.5 l -2.5,2.5 M 1.5,4 l 2.5,2.5 M 1.5,4 h 5" />
	</svg>
);

export const RightSvg = () => (
	<svg {...iconSvgAttrs} viewBox="0 0 8 8">
		<path d="M 4,1.5 l 2.5,2.5 M 6.5,4 l -2.5,2.5 M 1.5,4 h 5" />
	</svg>
);

export const PlusSvg = () => (
	<svg {...iconSvgAttrs} viewBox="0 0 8 8">
		<path d="M 4,1.5 v5 M 1.5,4 h5" />
	</svg>
);

export const CrossSvg = () => (
	<svg {...iconSvgAttrs} viewBox="0 0 8 8">
		<g transform="rotate(45, 4, 4)">
			<path d="M 4,1.5 v5 M 1.5,4 h5" />
		</g>
	</svg>
);

export const GithubSvg = () => (
	<svg height="100%" width="100%" strokeWidth="0" viewBox="0 0 16 16">
		<path
			fillRule="evenodd"
			d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
		/>
	</svg>
);

// Material Design icons

export const InfoSvg = () => (
	// modified to remove margins
	<svg height="100%" width="100%" strokeWidth="0" viewBox="2 2 20 20">
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
	</svg>
);

export const SaveSvg = () => (
	<svg height="100%" width="100%" strokeWidth="0" viewBox="0 0 24 24">
		<path fill="none" d="M0 0h24v24H0z" />
		<path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
	</svg>
);

export const ViewSvg = () => (
	<svg height="100%" width="100%" strokeWidth="0" viewBox="0 0 24 24">
		<path fill="none" d="M0 0h24v24H0z" />
		<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
	</svg>
);

export const EditSvg = () => (
	<svg height="100%" width="100%" strokeWidth="0" viewBox="0 0 24 24">
		<path fill="none" d="M0 0h24v24H0z" />
		<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
	</svg>
);

export const LinkSvg = () => (
	<svg height="100%" width="100%" strokeWidth="0" viewBox="0 0 24 24">
		<path fill="none" d="M0 0h24v24H0z" />
		<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
	</svg>
);

export const MoreSvg = () => (
	<svg height="100%" width="100%" strokeWidth="0" viewBox="0 0 24 24">
		<path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
	</svg>
);

export const SettingsSvg = () => (
	<svg height="100%" width="100%" strokeWidth="0" viewBox="0 0 24 24">
		<path fill="none" d="M0 0h24v24H0V0z" />
		<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
	</svg>
);
