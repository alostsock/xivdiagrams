import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkData } from 'renderer/entities';

export type MarkName = keyof typeof marks;

export const roles: MarkName[] = [
	'tank',
	'healer',
	'dps',
	'dpsPhysical',
	'dpsRanged',
	'dpsMagical',
];
export const tanks: MarkName[] = ['pld', 'war', 'drk', 'gnb'];
export const healers: MarkName[] = ['whm', 'sch', 'ast', 'sge'];
export const physical: MarkName[] = ['mnk', 'drg', 'nin', 'sam', 'rpr'];
export const ranged: MarkName[] = ['brd', 'mch', 'dnc'];
export const magical: MarkName[] = ['blm', 'smn', 'rdm', 'blu'];
export const dps = [...physical, ...ranged, ...magical];
export const mechanics: MarkName[] = [
	'stack',
	'stackLinear',
	'flare',
	'glare',
	'positive',
	'negative',
];

type Colors = readonly string[];

const defaultSize: Partial<Record<MarkName, number>> = {
	mob: 50,
	stack: 125,
	stackLinear: 125,
	flare: 100,
	glare: 65,
};

const defaultRotatable: Partial<Record<MarkName, boolean>> = {
	stackLinear: true,
};

export function getMarkDefaults(
	name: MarkName
): Pick<MarkData, 'size' | 'rotation' | 'rotatable'> {
	return {
		size: defaultSize[name] ?? 30,
		rotation: 0,
		rotatable: defaultRotatable[name] ?? false,
	};
}

export function createSvgDataUrl(name: MarkName, colors?: Colors) {
	const mark = marks[name];
	const colorable = typeof mark === 'function';
	const svg = colorable ? mark(colors) : mark;
	const s = encodeURIComponent(renderToStaticMarkup(svg));
	return `data:image/svg+xml;charset=utf-8,${s}`;
}

const markSvgAttrs: React.SVGAttributes<SVGSVGElement> = {
	xmlns: 'http://www.w3.org/2000/svg',
	// must use 'px' and not '%' for svg width/height
	// https://bugzilla.mozilla.org/show_bug.cgi?id=700533
	width: '100px',
	height: '100px',
	viewBox: '0 0 12.7 12.7',
};

function withCircleBg(path: string, [bg, fg]: Colors) {
	return (
		<svg {...markSvgAttrs}>
			<circle fill={bg} cx="6.35" cy="6.35" r="6.3" />;
			<path fill={fg} d={path} />
		</svg>
	);
}

const colors = {
	tank: ['#1764ab', '#f4faff'],
	healer: ['#3ea47b', '#f5fcf9'],
	dps: ['#c60035', '#fff5f5'],
} as const;

const marks = {
	// roles
	tank: withCircleBg(
		'M6.37 1.402c-.46 0-2.277.596-3.904 1.106-.344.108-.157.218-.012.474.268.477.224 1.587-.786 1.584-.275 0-.292.34-.036 1.271.5 1.816 1.515 3.483 2.995 4.836.806.736 1.628 1.16 1.744 1.16.115 0 .937-.424 1.743-1.16 1.48-1.353 2.496-3.02 2.995-4.836.256-.932.24-1.27-.036-1.27-1.01.002-1.054-1.108-.785-1.584.146-.258.33-.367-.013-.475-1.628-.51-3.443-1.105-3.904-1.106ZM6.37 3c.12 0 .422.075 2.183.697.338.12.327.137.214.367-.23.475-.067.89.424 1.036.28.083.202.022.16.463-.174 1.745-2.641 4.389-2.98 4.389-.34 0-2.807-2.645-2.98-4.39-.043-.441-.121-.382.16-.464.489-.145.653-.56.423-1.035-.113-.23-.124-.247.214-.367C5.951 3.074 6.25 3 6.371 3Z',
		colors.tank
	),
	healer: withCircleBg(
		'M6.372 1.306c-.367 0-.646.121-1.027.303-.828.394-.868.484-.691 1.418.326 1.735.332 1.983-.4 2.067-.371.044-.928-.026-1.64-.492-.668-.439-1.295-.31-1.335 1.784-.003 1.364.311 2.528 1.388 1.893.361-.214.976-.647 1.566-.629.47.013.76.319.456 2.127-.188 1.116-.113 1.075.676 1.385.446.176.81.273 1.006.273.195 0 .56-.097 1.005-.273.79-.31.864-.269.676-1.385-.304-1.808-.013-2.114.456-2.127.59-.018 1.204.415 1.566.629 1.077.635 1.392-.529 1.388-1.892-.04-2.095-.667-2.224-1.337-1.783-.711.464-1.267.534-1.639.49-.73-.084-.725-.332-.397-2.067.175-.934.136-1.024-.69-1.418-.383-.182-.661-.303-1.028-.303Zm0 1.722c.238 0 .475.108.567.158.212.113.216.143.085 1.16-.144 1.112-.275 1.613.703 1.47C9.88 5.5 9.84 5.4 9.827 6.32c-.012 1.024.039.988-2.092.524-.454-.1-.854-.086-.772.732.2 1.966.203 1.998-.015 2.144-.22.149-.418.202-.576.202-.16 0-.356-.053-.577-.2-.218-.148-.214-.18-.015-2.145.082-.819-.317-.832-.771-.733-2.131.464-2.08.5-2.093-.524-.01-.92-.052-.82 2.1-.504.98.144.848-.358.703-1.47-.132-1.017-.127-1.047.086-1.16a1.31 1.31 0 0 1 .567-.159Z',
		colors.healer
	),
	dps: withCircleBg(
		'M9.226 10.47c-.021-.37-.062-.517-.356-.787-.33-.303-.532-.101-.88.281-.355.389-.364.503-1.113.485-.428-.01-.827-.046.225-1.09.499-.514.629-.794.511-.956-.115-.14-.179-.066-.409.092-.569.389-.968.188-.908-.325.06-.51-1.699-2.77-3.484-3.523-.695-.293-.63-.687-.62-1.338.018-1.45-.302-1.089 1.118-1.123.75-.02 1.098-.123 1.41.591.759 1.741 2.963 3.56 3.495 3.483.543-.08.646.255.324.858-.134.25-.191.343-.078.424.187.135.428.026.92-.462 1.156-1.147 1.077-.726 1.07-.282-.012.778-.13.757-.504 1.154-.316.335-.458.53-.243.872.215.34.463.396.814.37.984-.074.51.487-.162 1.148-.634.624-1.108 1.1-1.13.128z',
		colors.dps
	),
	dpsPhysical: withCircleBg(
		'M6.265 9.427c-.05-.583-.355-.44.59-1.417.79-.815.721-.88 1.361-.94 1.186-.11 1.077.147 1.604.422.805.42.708.676.653 1.582-.07 1.114-.163 1.195-1.134 1.332-.842.118-1.45.145-2.11.04-.884-.142-.87.072-.964-1.02Zm-3.147-.885c-.32-.3-.891-.838-.91-1.155-.031-.486-.011-.491 0-.78.023-.624.603.176.79.352.444.42.524.569.532.735.013.25.1.487.453.145.21-.203.234-.222-.535-1.049C2.243 5.496 2.28 5.786 2.144 4.7c-.122-.965-.149-1.276.157-1.24.462.053.677.047.669-.329-.008-.34.094-.42.398-.382.402.05.602.106.687-.394.056-.34.284-.355.567-.29.509.116.543-.048.632-.345.096-.312.581.002 1.275.243.749.26.856.652 1.418 2.103.296.758.54 1.426.908 2.29.187.44-.313.29-.794.324-.736.05-.856.24-1.954 1.467-.517.574-.391.639-1.625.625-.924-.01-1.108.01-1.363-.23Z',
		colors.dps
	),
	dpsRanged: withCircleBg(
		'M8.145 10.072c-.618-.687-.698-.467-.688-1.38.004-.402.01-.365-1.327-1.724-1.292-1.315-1.404-1.513-1.885-.941-.4.477-.4.503-.583-.056C3.279 4.792 2.497 2.71 2.48 2.525c.08-.062 3.322 1.149 3.604 1.215.512.122.08.398-.143.626-.487.499-.389.415.978 1.836.74.768 1.14 1.27 1.637 1.272.974.005.858.09 1.586.808l.8.79-.951.095c-.815.082-.772.09-.888.913l-.127.912z',
		colors.dps
	),
	dpsMagical: withCircleBg(
		'M4.144 11.056c.039-.443.068-1.119.13-2.293.033-.66-.258-.302-.752.264-.723.826-.92 1.355-1.036.478a123.854 123.854 0 0 1-.41-5.42c-.107-1.963.078-1.061.898 1.85.444 1.58.496 1.964.667 1.746a6.828 6.828 0 0 1 .414-.473c.579-.598.644-.754.823-.312.945 2.313 1.51 3.222 2.129 4.259.221.37-.075.422-1.85.405-.636-.006-1.06.023-1.014-.504Zm4.884-5.252c-2.395-1.231-2.295-.93-1.716-1.607a6.53 6.53 0 0 1 .574-.561c.164-.135-.932-.405-2.087-.762-2.194-.68-3.318-1.02-1.967-.919 1.996.15 3.393.232 5.892.455.759.07.292.364-.117.743-.1.093-.711.69-.85.828-.277.277.063.211.798.213.632 0 1.33-.073 1.802-.036.268.02.279.366.266 1.338-.01.71.016 1.578-.239 1.446-.289-.151-1.022-.452-2.356-1.138Z',
		colors.dps
	),

	// tanks
	pld: withCircleBg(
		'M6.372 1.846c-.215 0-.28.193-.387.397-.033.066-.24.567-.633.567H4.224c-.976 0-.821-.75-1.284-.764-.517 0-.517.538-.517 1.6 0 .85.015 1.627.012 2.125-.012 1.97.16 2.715 1.123 3.994 1.008 1.337 2.628 2.077 2.814 2.077.185 0 1.807-.74 2.814-2.077.963-1.28 1.135-2.024 1.122-3.994-.003-.498.013-1.275.013-2.126 0-1.06 0-1.6-.517-1.6-.464.015-.307.764-1.284.764H7.39c-.393 0-.599-.5-.634-.566-.104-.203-.17-.396-.385-.396Zm-.853 1.928c.4.003.4.066.4.508v5.729c0 .319-.383.039-.636-.18-.87-.752-1.763-1.399-1.763-4.25 0-.574-.002-.801 0-1.223.002-.58-.02-.58.498-.58h.95c.239 0 .416-.005.55-.004zm1.706 0c.133-.002.312.004.55.004h.95c.52 0 .497 0 .498.58v1.223c0 2.85-.892 3.498-1.762 4.25-.253.218-.638.5-.638.18V4.282c0-.442 0-.505.402-.51z',
		colors.tank
	),
	war: withCircleBg(
		'M3.832 2.498c-.51.008-1.576.821-2.04 2.197-.354 1.053-.528 2.552.388 4.077.159.264.682.903.92 1.09.766.606 1.252.342 1.415-.32.33-1.335.948-1.504 1.835-1.504.886 0 1.505.17 1.835 1.504.163.662.649.926 1.416.32.236-.187.76-.826.92-1.09.915-1.525.74-3.025.386-4.077-.463-1.376-1.527-2.19-2.039-2.197-.305-.004-.54.237-.62.629-.264 1.242-.91 1.596-1.898 1.596-.988 0-1.634-.353-1.896-1.596-.083-.392-.318-.633-.621-.63Zm-.337 1.627c.085 0 .183.099.299.38.288.662 1.166 1.338 2.556 1.338 1.39 0 2.268-.677 2.556-1.338.265-.642.437-.332.576-.066.604 1.148.677 2.738.073 3.691-.299.472-.459.714-.682.078-.34-.972-1.407-1.33-2.523-1.328-1.116-.002-2.182.355-2.523 1.328-.225.636-.383.394-.683-.078-.603-.953-.53-2.543.074-3.691.078-.15.167-.314.277-.314Z',
		colors.tank
	),
	drk: withCircleBg(
		'M6.35.56c-.138 0-.15.633-.293 1.597-.128.856-.231.981-.553.82a11.8 11.8 0 0 0-1.458-.633c-.848-.3-1.025-.229-.467.343.524.538.901.771 1.22 1.015.214.164.122.295-.094.43-.355.224-1.27.722-2.266 1.471-1.184.89.136.362 1.857-.354 1.187-.493 1.64-.925 1.358.14-.118.445-.437.902-1.602 1.296-.2.067-.285.139.037.4.302.245 1.008 1.103 1.253 1.685.16.392.306.709.593 1.954.233 1.01.273 1.416.415 1.416.142 0 .182-.406.415-1.416.287-1.245.432-1.562.593-1.954.245-.582.951-1.44 1.253-1.685.322-.261.237-.333.037-.4-1.165-.394-1.484-.851-1.602-1.297-.282-1.064.17-.632 1.358-.139 1.72.716 3.04 1.244 1.857.354-.996-.749-1.911-1.247-2.266-1.47-.216-.136-.308-.267-.094-.43.319-.245.696-.478 1.22-1.016.558-.572.38-.644-.467-.343a11.8 11.8 0 0 0-1.458.633c-.322.161-.425.036-.553-.82C6.5 1.193 6.488.56 6.35.56Zm0 5.585c.082 0 .266.2.43.354.596.557.583.423.097 1.106-.223.313-.333.544-.527.544s-.304-.231-.527-.544c-.486-.683-.499-.55.096-1.106.165-.154.35-.354.431-.354Z',
		colors.tank
	),
	gnb: withCircleBg(
		'M10.53 2.382c-.19-.19-.54.127-1.419.732-.524.361-.63.354-.923.214-.304-.144-.86-.406-1.439-.453-.406-.032-.409-.216-.48-.422-.19-.561-.678-.472-.762.005-.042.24-.043.532-.376.632-1.443.432-2.382 1.93-2.42 3.208-.017.556.129.79.463.778.338-.01.435-.204.485-.62.282-1.8 1.494-2.883 3.477-2.41.23.054.671.212.4.47-.539.512-1.017.947-1.543 1.473-.58.58-2.004 1.916-2.768 2.968-.375.508-.835 1.115-.611 1.34.19.19.427-.069 1.315-.66.265-.176.65.075.91.185 1.058.45 2.075.454 3.115-.113.237-.131.383.083.672.232.44.23.622-.06.541-.466-.045-.228-.114-.537.017-.722.335-.475.51-.852.613-1.237.158-.587.051-.971-.338-1.018-.371-.044-.565.496-.646.771-.407 1.403-2.05 2.186-3.23 1.707-.545-.222-.626-.208-.048-.74A57.638 57.638 0 0 0 7.15 6.687c.58-.577 1.933-1.914 2.697-2.967.352-.475.85-1.04.717-1.293a.193.193 0 0 0-.035-.046z',
		colors.tank
	),

	// healers
	whm: withCircleBg(
		'M6.887 3.351c0 .606-.487 1.098-1.089 1.098A1.093 1.093 0 0 1 4.71 3.35c0-.606.487-1.097 1.088-1.097.602 0 1.09.491 1.09 1.097zM5.815 9.176c-.01-1.898.018-2.414-.45-2.586-.51-.244-1.529-.574-1.668-1.641-.012-.377.298-.42.832-.04.464.295.784.387 1.134.42.605.056 1.185-.2 1.515-.57a2.148 2.148 0 0 0 .47-1.997A2.319 2.319 0 0 0 6.5 1.326C5.9 1.06 5.935.67 6.57.66c.381 0 1.11.236 1.626.756.615.621 1.06 1.774.649 3.124-.525 1.265-1.363 1.725-1.836 2.065-.197.422-.141 1.368-.137 2.352.009 1.896.037 3.018-.53 3.08-.607.02-.535-1.31-.526-2.862Z',
		colors.healer
	),
	sch: withCircleBg(
		'M6.35 3.742c-.833 0-2.035.086-2.77.523-.574.342-.52.446-.199.582 1.188.5 1.507 1.592 1.362 2.08-.267.901-1.167 1.06-1.681.602-.86-.764.283-1.775-.533-2.486-.256-.223-.834.198-.967 1.613-.103 1.099.419 1.822 1.341 2.17.724.274 1.73.099 2.261-.324.997-.794 1.12-2.194.269-3.263-.234-.295-.324-.537.917-.537s1.151.242.917.537c-.851 1.069-.728 2.469.269 3.263.53.423 1.537.598 2.26.325.923-.349 1.445-1.072 1.342-2.171-.133-1.415-.711-1.836-.967-1.613-.816.711.327 1.722-.533 2.486-.514.457-1.414.3-1.681-.601-.145-.49.174-1.58 1.362-2.08.322-.137.375-.24-.2-.583-.734-.437-1.936-.523-2.769-.523Z',
		colors.healer
	),
	ast: withCircleBg(
		'M6.074 2.343c-.311 0-.813.029-.817.499-.005.47.561.493.966.493H7.69c.324 0 .53-.021.53.48v2.32c0 .727-.086 1.853.453 1.843.54-.009.54-.65.54-1.252 0-1.318.117-1.936 1.3-2.454 1.141-.455 1.03-.647.732-.7a2.696 2.696 0 0 0-1.662.3c-.37.228-.37.078-.37-.83 0-.699-.747-.699-.992-.699Zm-1.68 1.473c-.8 0-.943 0-.943.728v.997c0 1.338.016 1.526.445 1.53.332.005.498-.175.498-1.098 0-1.186 0-1.186.549-1.193a70.06 70.06 0 0 1 1.367.007c.346 0 .38.21.38.724v2.597c0 .379-.066.739-.48.756-.276.012-.673 0-.942 0-.874 0-.861.137-.874-.836-.01-.745-.472-.385-1.243.347-1.01.95-1.636 2.953-.25 1.351.655-.7.618-.584.628-.33.019.426.407.421.757.426a79.69 79.69 0 0 0 2.648 0c.756-.014.756-.402.756-1.663V4.786c0-.971-.21-.971-1.059-.971H4.394Z',
		colors.healer
	),
	sge: withCircleBg(
		'M6.35.64c-.126 0-.277.065-.4.393-.175.468-.96 1.19-1.367 1.359-.378.156-.404.45-.092.682.252.186.78.591 1 .924.361.544.37.705.42 2.148.02.57.076 1.47.116 1.625.07.272.282.272.323.272.041 0 .253 0 .323-.272.04-.155.096-1.056.115-1.625.05-1.443.069-1.604.43-2.148.22-.333.74-.738.99-.924.313-.232.287-.526-.09-.682C7.71 2.223 6.924 1.5 6.75 1.033 6.627.705 6.476.64 6.35.64ZM2.641 3.495a.187.187 0 0 0-.056.006c-.088.026-.195.143-.22.364-.051.45-.417 1.068-.786 1.361-.29.232-.319.412.104.539.524.169 1.229.621 1.39 1.085.676 1.953.772 2.361 1.04 2.288.27-.074.133-.505-.24-2.547-.075-.408.287-1.197.65-1.61.297-.326.18-.466-.188-.516-.467-.063-1.1-.405-1.375-.765-.097-.147-.227-.203-.319-.205Zm7.418 0c-.092.002-.222.058-.32.205-.275.36-.907.702-1.374.765-.368.05-.485.19-.187.516.362.413.724 1.202.65 1.61-.374 2.042-.51 2.473-.241 2.547.268.073.364-.335 1.04-2.288.161-.464.866-.916 1.39-1.085.423-.127.394-.307.104-.539-.369-.293-.735-.911-.786-1.361-.025-.22-.132-.338-.22-.364a.186.186 0 0 0-.056-.006zM5.64 7.447c-.135 0-.323.13-.664.385-.312.234-.222.315.27.804.56.556.804.698.805 1.677.001.552.008 1.33.088 1.564.06.171.154.183.21.183.056 0 .15-.012.21-.183.08-.235.087-1.012.088-1.564.002-.979.244-1.121.804-1.677.493-.489.583-.57.27-.804-.34-.255-.528-.384-.663-.385-.061 0-.111.027-.16.08-.115.13-.153.203-.008.34.211.197.208.272-.07.54-.22.216-.34.32-.471.31-.13.01-.25-.094-.472-.31-.277-.268-.28-.343-.07-.54.146-.137.108-.21-.007-.34-.049-.053-.099-.08-.16-.08Z',
		colors.healer
	),

	// physical
	mnk: withCircleBg(
		'M1.529 5.4c-.527.45-.733 1.276-.63 1.393.107.122.963.056 1.485-.4L4.7 4.416l2.314-1.977c.533-.444.732-1.28.628-1.404-.1-.12-.947-.046-1.473.404l-2.32 1.98ZM3.6 7.829c-.526.45-.733 1.275-.63 1.392.108.122.964.056 1.486-.4l2.315-1.977 2.314-1.977c.533-.444.732-1.28.628-1.404-.1-.12-.947-.046-1.474.404l-2.32 1.98Zm2.086 2.442c-.526.45-.733 1.275-.629 1.393.107.122.963.055 1.485-.401l2.315-1.977 2.314-1.976c.533-.445.732-1.28.628-1.405-.1-.12-.947-.046-1.474.404L8.006 8.29Z',
		colors.dps
	),
	drg: withCircleBg(
		'M4.938.696c-.343 0-.465.536-.458.976.005.28 0 .765 0 1.177 0 1.731 0 2.234-.731 1.408-.212-.24-.312-.328-.8-.258-.442.063.105 1.085.215 1.323.415.897 1.82 4.045 2.154 5.242.187.67.235 1.44 1.032 1.44s.845-.77 1.032-1.44c.334-1.197 1.739-4.345 2.154-5.242.11-.238.657-1.26.215-1.323-.488-.07-.588.019-.8.258-.731.826-.731.323-.731-1.408 0-.412-.005-.897 0-1.177.007-.44-.115-.976-.458-.976-.362 0-.47.55-.47.811V3.88c0 .301-.149.816-.942.816-.793 0-.942-.515-.942-.816V1.507c0-.261-.108-.81-.47-.81Zm2.86 4.51c.112.003.222.087.373.249.367.394.141 1.103-.873 1.825-.575.41-.978.576-.422 1.037.21.174.187.54.187.78 0 .087.019.409-.179.658-.2.254-.343.476-.356.84-.005.143-.082.202-.178.202-.096 0-.173-.059-.178-.202-.013-.364-.155-.586-.356-.84-.198-.25-.179-.571-.179-.658 0-.24-.023-.606.187-.78.556-.461.153-.628-.422-1.037-1.014-.722-1.24-1.431-.873-1.825.322-.346.457-.334.817.062.282.309.57.43 1.004.43.434 0 .722-.121 1.004-.43.191-.21.319-.313.445-.31Z',
		colors.dps
	),
	nin: withCircleBg(
		'm4.808 1.2-.087.003c-.519.017-.618.177-.289.237.92.166 2.152.963 2.718 1.656.07.084.27.407.157.35-.42-.207-1.003-.24-1.28-.232-3.014.326-4.285 3.67-3.69 6.035.156.93.92 1.853.763 1.236-.178-1.113-.219-2.128.093-3.292.085-.317.188-.316.284.003.88 2.978 4.507 3.12 6.527 1.754.71-.49 1.47-1.203 1.701-1.61.215-.38.197-.62-.103-.306-.655.687-1.687 1.282-2.663 1.495-.809.177-.22-.192-.055-.47 1.618-1.915-.079-5.38-2.304-6.417-.288-.142-.884-.45-1.772-.44zM6.33 4.56c.96 0 1.738.8 1.738 1.785 0 .984-.778 1.782-1.738 1.782s-1.738-.798-1.738-1.782c0-.985.78-1.783 1.738-1.783z',
		colors.dps
	),
	sam: withCircleBg(
		'M5.592 1.57c-2.694.397-4.52 2.368-3.976 5.327.244 1.333 1.237 2.706 1.616 2.334.193-.189.182-.35-.195-.893-.273-.393-.548-.808-.577-1.342-.046-.846.106-1.286.443-1.04.354.316.943.884 1.67.758.601-.105.696.327.637.95-.013.128-.14.581-.145.745-.013.382.267.325 1.287.325s1.35.052 1.287-.325c-.25-1.496-.31-1.812.33-1.947.125-.001.697.06 1.052.431.174.183.565.624.392 1.335-.358 1.466-2.374 2.51-4.571 2.026-.78-.171-.956.247.124.646 3.226 1.138 6.417-1.526 6.18-4.835-.067-1.101-.532-1.841-.932-2.33-.367-.45-.598-.315-.36.478.412 1.616.31 1.935.128 2.112-.045.044-.423-.33-.78-.5a2.223 2.223 0 0 0-1.31-.212c-.345.052-.555.221-.663-.003-.145-.3-.151-.27-.39-1.092-.062-.216-.26-.994-.487-.994-.254 0-.412.698-.495.994-.369 1.309-.601 1.165-.866 1.212-.813.143-1.385-.285-1.716-.831-.219-.362.044-1.23.679-1.444.197-.066.555-.204.748-.35.253-.191.4-.388.806-.586.531-.259 1.21-.301 2.414-.005 1.018.25.998-.165.396-.455-.696-.334-1.596-.655-2.726-.489Zm.76 3.87c.038 0 .064.03.097.365.073.728.116 1.24.145 1.535.02.204.126.267-.242.264-.369.003-.263-.06-.243-.264.03-.295.058-.805.15-1.531.041-.323.054-.368.093-.368Z',
		colors.dps
	),
	rpr: withCircleBg(
		'M6.286.962c-.18 0-.363.434-1.637 3.993-.506 1.414-.943 2.683-1.009 2.753-.315.34-.423-1.226-.201-1.827.206-.557-.302-.374-.606.223-.431.845-.785 1.9.047 2.911.206.252.296.375.256.5-.077.238-.284.912-.284 1.168-.09.406.065.749.46.265.217-.266.518-1.064.542-1.135.063-.183.312-.054.946.008 1.88.138 4.25-.676 5.987-2.304.613-.575.111-.603-.115-.415-.998.834-3.565 1.548-4.72 1.498-.56-.024-1.283-.064-1.447-.208-.045-.04.061-.46.224-.963.099-.306.145-.449.232-.77.03-.111.12-.058.187.048.43.68 1.162 1.109 1.966 1.109A2.3 2.3 0 0 0 8.632 3.79c-.145-.204-.107-.368-.102-.612.007-.454-.192-.565-.555-.28-.195.155-.332.37-.523.34-.111-.015-.234-.017-.338-.02-.339 0-.674.075-.981.22-.24.048-.16-.144.001-.697.337-1.156.507-1.675.21-1.768a.19.19 0 0 0-.058-.011Zm.828 3.177a1.378 1.378 0 1 1 0 2.756 1.378 1.378 0 0 1 0-2.756z',
		colors.dps
	),

	// ranged
	brd: withCircleBg(
		'M4.994 10.905c-.86-.345-1.39-.647-1.741-1.392-.27-.571.056-.618.954-.026 1.03.678 3.077.44 4.017-.634.52-.594.427-.699.46-2.59-.02-3.19.438-2.997-2.577-2.944-2.11.037-2.15-.049-2.517.213-.808.636-1.292-.284-.836-.921.497-.59.512-.529 2.892-.548 2.992-.024 2.782-.038 2.975-.26.216-.249.495-.246.716-.249.558 0 .785.324.785 1.053 0 .424-.017.774-.101.97-.212.491-.08 1.295-.113 3.108-.02 2.582 0 2.08-.782 3.016-1.265 1.355-2.757 1.758-4.132 1.204Zm.92-2.278c-.614-.006-.44-.113-.44-2.365 0-2.233 0-2.169.44-2.184.487-.017.435.237.427 2.257-.009 2.224.123 2.288-.428 2.292zm1.521-.034c-.486.014-.358-.249-.392-2.323-.032-1.984-.064-2.2.404-2.188.537.013.437.393.443 2.192.008 2.242-.01 2.306-.455 2.319ZM3.898 6.252C3.9 4.266 3.884 4.09 4.33 4.09c.461 0 .404.024.383 2.188.005 2.322.033 2.331-.36 2.34-.551.012-.447-.1-.454-2.367Z',
		colors.dps
	),
	mch: withCircleBg(
		'M7.283 11.121a16.025 16.225 0 0 1-.48-.82c-.377-.681-.614-1.224-.126-1.484.295-.16.52.262.76.704.29.531.565.858.787.688.312-.24.487-.416.195-.763-.237-.28-1.36-1.276-.805-1.815a2.7 2.7 0 0 1 .827-.57c.392-.168.133-.281-.106-.454l-1.326-.956L5.23 4.366 3 2.758c-.293-.209-.597-.43-.243-.922.287-.397.462-.385 1.295.216 1.389 1.003 3.247 2.353 4.37 3.164 2.11 1.523 2.516 1.771.397 2.53-.506.181-.566.32-.409.463.182.172.746.686.98 1.047.294.455.226.728-.01 1.113-.208.342-.751 1.07-1.116 1.408-.27.248-.487.11-.98-.657ZM5.097 8.458c-.047-.092-.08-.536-.08-1.006 0-.504.013-.77.31-.645.15.064.449.186.447.503-.004.63.133.708.572.254.3-.31.098-.436-2.08-2.008-.539-.39-.876-.606-1.118-.817-.305-.266-.265-.445-.154-.819.12-.4.516-.072 1.274.476l2.69 1.942c.595.43.227 1.433-.146 1.865-.422.42-.607.51-.922.553-.362.05-.624.097-.792-.298Z',
		colors.dps
	),
	dnc: withCircleBg(
		'M6.35 1.183c-.14 0-.367.3-.61.711-.302.503-1.17 1.23-1.947 1.451-1.237.383-2.163 1.36-1.397 3.045C3.154 7.96 4.794 9 5.58 10.576c.278.545.531.94.77.94s.492-.395.77-.94c.786-1.577 2.426-2.615 3.184-4.186.766-1.684-.16-2.662-1.397-3.045-.776-.22-1.645-.948-1.948-1.45-.242-.411-.469-.712-.609-.712Zm0 1.787c.104 0 .219.104.515.382.37.347.425.365.114.622-.449.37-.605 1.417.128 2.157.597.603.796.396.728-.392-.027-.665.315-1.245.868-1.29.581-.013 1.111.82.47 1.856C8.56 7.212 7.3 8.148 6.84 8.73c-.232.274-.415.508-.491.508-.076 0-.257-.234-.489-.508-.46-.583-1.72-1.52-2.332-2.426-.642-1.037-.112-1.869.469-1.855.553.044.895.624.868 1.29-.068.787.131.994.728.391.733-.74.577-1.788.128-2.157-.31-.257-.257-.275.114-.622.296-.278.41-.382.515-.382Z',
		colors.dps
	),

	// magical
	blm: withCircleBg(
		'M10.354 2.397c-.254-.257-.518-.215-2.092.86-.749.458-2.37 2.02-1.545.032.154-.338.233-.827-.427-.684-.664.142-2.41 1.622-3.402 3.208a4.362 4.362 0 0 0-.16.128 2.91 2.91 0 0 0-.536.544 2.505 2.505 0 0 0-.065.088 2.91 2.91 0 0 0-.034.05 1.606 1.606 0 0 0-.066.104A2.91 2.91 0 0 0 1.6 8.24a2.91 2.91 0 0 0 2.911 2.91 2.91 2.91 0 0 0 2.431-1.312c1.266-.779 3.24-2.751 3.225-3.521-.063-.501-.404-.42-.68-.302-1.807.764-.75-.405.031-1.54 1.192-1.663 1.09-1.823.836-2.078Zm-.793.818C8.25 5.06 7.1 5.951 7.836 6.857c.168.208.593.141.82.085.43-.107.47-.024.015.444C7.662 8.424 7.451 8.69 7.408 8.5a2.91 2.91 0 0 0 .012-.26 2.91 2.91 0 0 0-.06-.581 2.91 2.91 0 0 0-2.007-2.203 1.915 1.915 0 0 0-.397-.09 2.91 2.91 0 0 0-.445-.035 2.91 2.91 0 0 0-.233.01c-.195-.043.04-.25 1.047-1.249.39-.387.615-.559.502-.037-.148.572-.058.8.074.908.896.728 1.804-.5 3.66-1.748ZM5.74 6.891a1.825 1.825 0 0 1 .596 1.35 1.825 1.825 0 0 1-1.825 1.825A1.825 1.825 0 0 1 2.685 8.24 1.825 1.825 0 0 1 4.51 6.415a1.825 1.825 0 0 1 1.23.476Z',
		colors.dps
	),
	smn: withCircleBg(
		'M4.05 11.053c-1.086-.26-1.265-.974.27-.908.35 0 .52-.013.53-.18.14-2.374-1.452-6.893-1.57-7.236-.289-.838-.329-.965.55-.253.765.62 3.963 3.335 5.842 3.53.211.022.235-.094.254-.348.065-.856.017-1.194.396-1.385.686-.345.824.686.797 1.5-.11 3.331-2.614 5.632-5.516 5.516-.82-.033-.888-.076-1.553-.236zm5.321-3.368c.103-.228.031-.368-.123-.412-.92-.254-2.876-1.295-4.02-2.144-.16-.146-.122.022-.045.217.43 1.295.668 2.507.697 4.27-.007.27.066.391.3.349 1.65-.3 2.58-.922 3.191-2.28z',
		colors.dps
	),
	rdm: withCircleBg(
		'M7.447.823c-.17.001-.203.518-.384 2.848-.18 2.334-.295 2.65-.708 2.996-.82.685-1.145 1.308-1.144 2.415 0 1.242.923 2.36 2.284 2.559 1.036.15 1.036-.736.296-.912-1.042-.25-1.673-.932-1.536-2.078.056-.466.407-1.33 1.453-1.35.616-.01 1.258.257 1.576-.038.391-.361-.095-.466-.623-.69-.272-.116-.641-.124-.84-2.966C7.686 1.664 7.638.822 7.447.822ZM3.532 6.021c-.196-.01-.14.19.426.799.41.44.362.547.15.928-.223.4-.304.356-.955.447-1.044.146-1.127.37-.018.594.745.15.732.242.785.67.047.4.077.52-.314.968-.74.847-.339.802.4.325.312-.2.435-.193.748.103.543.512 1.12.732.805.29-.1-.143-.245-.34-.451-.692-.52-.887-.531-2.094-.052-2.872.306-.497.436-.686.052-.766-.16-.033-.303-.08-.633-.304-.453-.308-.79-.482-.943-.49Zm4.274 1.953a.967.967 0 1 0 0 1.934.967.967 0 0 0 0-1.934z',
		colors.dps
	),
	blu: withCircleBg(
		'M9.102 2.744c-.218.22-.507.673-.158.694.425.079.498.293.508.609.01.335-.236.369-.41.417-.95.262-1.752.739-2.55.762H6.41c-.857 0-1.436-.365-2.37-.661-1.446-.46-2.376-.868-2.714-.6-.362.285.174 1.5.544 2.242.454.91.77 1.685 2.014 1.742.545.024 1.115-.256 1.407-.403.378-.19.833-.402 1.12-.402.298.098 1.033.18.824.49-.42.623-1.4 2.404-1.42 2.726-.05.872 2.023-1.715 2.307-2.196.18-.306.33-.26.6-.223 1.345.182 1.705-.824 2.15-1.734.366-.742.887-1.95.537-2.242-.124-.103-.266-.103-.56-.03-.126.033-.13-.113-.15-.327-.042-.424-1.102-1.293-1.597-.864zM2.61 5.127c.17-.006.466.057.957.224.483.164.973.385 1.313.564.535.28.71.413.44.575-.298.18-1.098.257-1.526.276-.37.015-.741.128-1.266-1.106-.11-.26-.243-.521.082-.533zm7.472.006c.464-.05.09.67-.083 1.002-.247.408-.443.598-.857.613-.584.02-1.03.009-1.702-.304-.258-.14.1-.33.472-.53a9.42 9.42 0 0 1 1.292-.563c.303-.084.607-.19.878-.218z',
		colors.dps
	),

	// enemies
	mob: (c?: Colors) => (
		<svg {...markSvgAttrs}>
			<circle
				fill={c ? c[0] : '#b4434a'}
				filter="grayscale(10%) brightness(140%)"
				cx="6.35"
				cy="6.35"
				r="6.3"
			/>
			<path
				fill={c ? c[0] : '#b4434a'}
				filter="brightness(35%)"
				d="M1.9 2.764c-.094.003-.054.197-.054.38.048.792.193 1.412.62 2.012.201.28.52.393 1.038.463.297.04.664.131.788.146.795.092.851.142.713-.188-.168-.4-.172-.516-.223-.809-.086-.478-.275-.893-.459-.93-.064-.012-.327-.095-.454-.131a4.94 4.94 0 0 1-.804-.313 7.607 7.607 0 0 1-.632-.325c-.132-.083-.363-.222-.42-.26-.05-.033-.087-.046-.113-.045Zm8.904 0a.253.253 0 0 0-.103.046c-.058.037-.288.176-.42.259a7.712 7.712 0 0 1-.633.325c-.31.143-.49.222-.803.313-.127.036-.39.119-.454.131-.184.037-.373.452-.459.93-.051.293-.055.409-.223.809-.139.33-.083.28.713.188.124-.015.49-.106.788-.146.518-.069.837-.182 1.038-.463.437-.57.614-1.372.62-2.011 0-.184.04-.377-.053-.381zM2.834 7.31c-.105 0-.092.1-.086.214.086 1.894.027 2.078-.124 3.033-.033.208-.03.21.124.18 1.018-.194 1.321-.509 1.336-.854-.012-.16-.018-.983.133-.662.017.036.256.432.36.747.102.313 1.137.076 1.78.076.642 0 1.678.237 1.78-.076.104-.315.343-.711.36-.747.151-.322.145.5.134.661.014.345.316.661 1.335.855.155.03.157.027.123-.18-.15-.955-.209-1.14-.123-3.032.006-.114.019-.215-.087-.215a.447.447 0 0 0-.149.037c-.333.09-.7.208-1.027.307-.348.104-.44.16-.565.318-.197.25-.235.366-.34.587-.26.552-.148.702-.474-.212-.143-.401-.036-.418-.967-.418-.931 0-.823.018-.967.418-.326.914-.213.764-.474.212-.105-.222-.143-.336-.34-.587-.124-.158-.217-.215-.565-.318-.328-.099-.694-.218-1.027-.307a.447.447 0 0 0-.15-.037z"
			/>
		</svg>
	),

	// mechanics
	stack: (
		<svg {...markSvgAttrs} filter="drop-shadow(0 0 2px #381D00)">
			<path
				fill="#ffefb9"
				d="M4.773.916a.2.2 0 0 0-.142.341l1.588 1.588a.2.2 0 0 0 .14.06.2.2 0 0 0 .142-.06l1.588-1.588a.2.2 0 1 0-.283-.283L6.36 2.421 4.913.974a.2.2 0 0 0-.142-.058Zm-.204 1.068c-1.225.454-2.209 1.355-2.733 2.502l.138.057c.508-1.112 1.462-1.986 2.65-2.426Zm3.582 0-.055.133c1.188.44 2.142 1.314 2.65 2.426l.138-.057c-.524-1.147-1.508-2.048-2.733-2.502ZM1.117 4.556a.2.2 0 0 0-.143.341l1.447 1.448L.974 7.792a.2.2 0 1 0 .283.283l1.588-1.588a.2.2 0 0 0 .058-.142.2.2 0 0 0-.058-.143L1.257 4.614a.2.2 0 0 0-.14-.058Zm10.486 0a.2.2 0 0 0-.14.058l-1.59 1.588a.2.2 0 0 0-.057.143.2.2 0 0 0 .057.142l1.588 1.588a.2.2 0 1 0 .284-.283l-1.447-1.447 1.447-1.448a.2.2 0 0 0-.143-.341ZM1.974 8.147l-.138.057c.525 1.147 1.508 2.047 2.733 2.501l.054-.133c-1.187-.44-2.141-1.313-2.65-2.425Zm8.772 0c-.509 1.112-1.463 1.985-2.65 2.425l.055.133c1.225-.454 2.208-1.354 2.733-2.501ZM6.36 9.785a.2.2 0 0 0-.141.06L4.63 11.431a.2.2 0 1 0 .283.284l1.445-1.447h.001l1.446 1.447a.2.2 0 0 0 .283 0 .2.2 0 0 0 0-.284L6.5 9.844a.2.2 0 0 0-.141-.059Z"
			/>
		</svg>
	),
	stackLinear: (
		<svg {...markSvgAttrs} filter="drop-shadow(0 0 2px #381D00)">
			<path
				fill="#ffefb9"
				d="M10.178.706a.198.198 0 0 0-.059-.14.198.198 0 0 0-.28 0L8.265 2.14a.198.198 0 0 0 0 .28L9.84 3.995a.198.198 0 1 0 .28-.28L8.685 2.28 10.12.847a.198.198 0 0 0 .06-.14zm0 4.071a.198.198 0 0 0-.059-.14.198.198 0 0 0-.28 0L8.265 6.21a.198.198 0 0 0 0 .28L9.84 8.061a.198.198 0 0 0 .28 0 .198.198 0 0 0 .06-.14.198.198 0 0 0-.06-.14L8.685 6.35l1.435-1.433a.198.198 0 0 0 .06-.14zm0 4.07a.198.198 0 0 0-.059-.14.198.198 0 0 0-.14-.06.198.198 0 0 0-.14.058L8.264 10.28a.198.198 0 0 0 0 .28l1.575 1.575a.198.198 0 0 0 .28-.28L8.685 10.42l1.434-1.434a.198.198 0 0 0 .06-.14zM4.493 6.35a.198.198 0 0 0-.057-.14L2.86 4.638a.198.198 0 0 0-.28 0 .198.198 0 0 0-.059.14c0 .053.022.103.06.14L4.014 6.35 2.581 7.783a.198.198 0 0 0-.059.14c0 .053.022.103.06.14a.198.198 0 0 0 .28 0L4.435 6.49a.198.198 0 0 0 .057-.139zm-.002-4.1a.198.198 0 0 0-.056-.11L2.861.566a.198.198 0 0 0-.28 0 .198.198 0 0 0-.059.14c0 .053.022.103.06.14L4.014 2.28 2.581 3.715a.198.198 0 0 0 0 .28c.037.038.087.06.14.06a.198.198 0 0 0 .14-.059L4.435 2.42a.198.198 0 0 0 .056-.172Zm0 8.138a.198.198 0 0 0-.056-.109L2.861 8.705a.198.198 0 1 0-.279.28l1.433 1.435-1.434 1.433a.198.198 0 0 0 .28.28l1.574-1.573a.198.198 0 0 0 .056-.172z"
			/>
		</svg>
	),
	flare: (
		<svg {...markSvgAttrs}>
			<path
				fill="#f4faff"
				filter="drop-shadow(0 0 0.125px #1764ab)"
				d="M6.35.213A40.824 40.824 0 0 0 4.54 2.69c.432.295.489.332.929.668.326-.438.468-.618.715-.955.115.339.154 1.285.166 2.081.011-.796.05-1.742.165-2.08.247.336.39.516.716.954.44-.336.496-.373.928-.668A40.74 40.74 0 0 0 6.349.213Zm-4.062 6.38c-.37.742-.847 1.816-1.242 2.805 1.053.153 2.222.276 3.05.328.04-.52.043-.589.115-1.138-.543-.063-.77-.097-1.184-.142.235-.27 1.034-.776 1.719-1.184-.696.388-1.534.828-1.885.897.168-.382.252-.595.469-1.097-.511-.213-.572-.243-1.042-.47Zm8.124 0c-.47.226-.531.256-1.042.47.216.5.3.714.468 1.096-.35-.07-1.189-.509-1.884-.897.684.408 1.483.915 1.719 1.184-.415.045-.642.079-1.184.142.071.549.074.617.114 1.138a40.64 40.64 0 0 0 3.05-.328 40.658 40.658 0 0 0-1.241-2.805Z"
			/>
		</svg>
	),
	glare: (
		<svg {...markSvgAttrs}>
			<path
				fill="#2d080d"
				d="M6.35 4.177c2.644.226 4.598 2.175 4.598 2.175S8.994 8.302 6.35 8.527c3.061 0 5.344-2.175 5.344-2.175S9.41 4.177 6.35 4.177zm0 0c-1.47.164-3.556 1.39-4.062 2.044 0 .055 3.441.088 3.441.088a.623.623 0 0 1 1.242 0s3.441-.033 3.441-.088c-.506-.654-2.591-1.88-4.062-2.044Zm0 0c-3.061 0-5.344 2.175-5.344 2.175S3.29 8.527 6.35 8.527C3.706 8.3 1.752 6.352 1.752 6.352s1.954-1.95 4.598-2.175zm0 4.35c1.47-.163 3.556-1.39 4.062-2.044 0-.055-3.441-.087-3.441-.087a.623.623 0 0 1-1.242 0s-3.441.032-3.441.087c.506.655 2.591 1.88 4.062 2.044Z"
			/>
			<circle
				fill="#f5dedc"
				filter="drop-shadow(0 0 0.5px #c33f42)"
				cx="6.35"
				cy="6.35"
				r="1"
			/>
		</svg>
	),
	positive: (
		<svg {...markSvgAttrs}>
			<circle fill="#fff9f9" cx="6.35" cy="6.35" r="3" />
			<path
				fill="#d1595f"
				d="M6.35 3.043A3.307 3.307 0 0 0 3.043 6.35 3.307 3.307 0 0 0 6.35 9.657 3.307 3.307 0 0 0 9.657 6.35 3.307 3.307 0 0 0 6.35 3.043Zm-.51.518h1.02v2.336h1.963v.906H6.861V9.14H5.839V6.803H3.877v-.906h1.962z"
			/>
		</svg>
	),
	negative: (
		<svg {...markSvgAttrs}>
			<circle fill="#f4faff" cx="6.35" cy="6.35" r="3" />
			<path
				fill="#4ba3f1"
				d="M6.35 3.043A3.307 3.307 0 0 0 3.043 6.35 3.307 3.307 0 0 0 6.35 9.657 3.307 3.307 0 0 0 9.657 6.35 3.307 3.307 0 0 0 6.35 3.043ZM3.877 5.897h4.946v.906H3.877Z"
			/>
		</svg>
	),
} as const;
