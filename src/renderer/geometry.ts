export type Point = [number, number];
export type Points = Point[];
export type Segment = [Point, Point];
export type Segments = Segment[];

export type Bounds = {
	left: number;
	right: number;
	top: number;
	bottom: number;
};

export function distance2([x0, y0]: Point, [x1, y1]: Point) {
	return (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
}

export function distance([x0, y0]: Point, [x1, y1]: Point) {
	return Math.hypot(x0 - x1, y0 - y1);
}

export function dot(u: number[], v: number[]): number {
	return u.reduce((acc, current, i) => (acc += current * v[i]), 0);
}

export function calcAngle([x1, y1]: Point, [x2, y2]: Point): number {
	return Math.atan2(y2 - y1, x2 - x1);
}

export function rotatePoint(
	[x0, y0]: Point,
	[x, y]: Point,
	angle: number
): Point {
	return [
		x0 + Math.cos(angle) * (x - x0) - Math.sin(angle) * (y - y0),
		y0 + Math.sin(angle) * (x - x0) + Math.cos(angle) * (y - y0),
	];
}

export function averagePoints(points: Points): Point {
	const s = points.reduce<Point>(
		(acc, p) => [acc[0] + p[0], acc[1] + p[1]],
		[0, 0]
	);
	return [s[0] / points.length, s[1] / points.length];
}

export function calcRectPoints(
	origin: Point,
	width: number,
	height: number,
	rotation: number
): Points {
	// (x, y) = center of the rectangle
	const [x, y] = origin;
	const tl: Point = [x - width / 2, y - height / 2];
	const tr: Point = [x + width / 2, y - height / 2];
	const br: Point = [x + width / 2, y + height / 2];
	const bl: Point = [x - width / 2, y + height / 2];

	// top-left -> top-right -> bottom-right -> bottom-left
	return [
		rotatePoint(origin, tl, rotation),
		rotatePoint(origin, tr, rotation),
		rotatePoint(origin, br, rotation),
		rotatePoint(origin, bl, rotation),
	];
}

export function calcBoundsFromPoints(points: Points): Bounds {
	let xMin = points[0][0];
	let xMax = points[0][0];
	let yMin = points[0][1];
	let yMax = points[0][1];

	for (const [x, y] of points) {
		if (x < xMin) xMin = x;
		if (x > xMax) xMax = x;
		if (y < yMin) yMin = y;
		if (y > yMax) yMax = y;
	}

	return { left: xMin, right: xMax, top: yMin, bottom: yMax };
}

export function pointInBounds(
	[x, y]: Point,
	{ left, right, top, bottom }: Bounds
): boolean {
	return x > left && x < right && y > top && y < bottom;
}

export function boundsInBounds(
	innerBounds: Bounds,
	outerBounds: Bounds
): boolean {
	const { left: il, right: ir, top: it, bottom: ib } = innerBounds;
	const { left: ol, right: or, top: ot, bottom: ob } = outerBounds;
	return il > ol && ir < or && it > ot && ib < ob;
}

export function pointInCircle(
	point: Point,
	origin: Point,
	radius: number
): boolean {
	return distance2(point, origin) < radius * radius;
}

export function pointInPolygon([x, y]: Point, points: Points): boolean {
	// slightly modified from https://stackoverflow.com/a/17490923
	let isInside = false;

	let i = 0;
	let j = points.length - 1;
	for (; i < points.length; j = i++) {
		const [x0, y0] = points[j];
		const [x1, y1] = points[i];

		if (y1 > y !== y0 > y && x < ((x0 - x1) * (y - y1)) / (y0 - y1) + x1) {
			isInside = !isInside;
		}
	}

	return isInside;
}

export function distToCircle(point: Point, origin: Point, radius: number) {
	return Math.abs(distance(point, origin) - radius);
}

function squaredDistToSegment(p: Point, v: Point, w: Point) {
	// https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
	const l2 = distance2(v, w);
	// 0-length segment
	if (l2 === 0) return distance(p, v);
	// find projection of p onto line defined by v-w
	// t = dot(p-v, w-v) / |w-v|^2
	let t = dot([p[0] - v[0], p[1] - v[1]], [w[0] - v[0], w[1] - v[1]]) / l2;
	// clamp t to [0,1]
	t = Math.max(0, Math.min(1, t));
	// projection = v + t * (w-v)
	const proj: Point = [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])];
	return distance2(proj, p);
}

export function distToSegment(p: Point, v: Point, w: Point) {
	return Math.sqrt(squaredDistToSegment(p, v, w));
}

export function distToSegments(p: Point, segments: Segments) {
	let min2 = Infinity;

	for (const [p1, p2] of segments) {
		const d2 = squaredDistToSegment(p, p1, p2);
		min2 = d2 < min2 ? d2 : min2;
	}

	return Math.sqrt(min2);
}

export function distToCone(
	point: Point,
	origin: Point,
	radius: number,
	innerRadius: number,
	startAngle: number,
	endAngle: number
): number {
	const [x0, y0] = origin;
	// get shortest distance to each side of the cone
	const arcP1 = rotatePoint(origin, [x0 + radius, y0], startAngle);
	const arcP2 = rotatePoint(origin, [x0 + radius, y0], endAngle);
	const arcP1inner =
		innerRadius > 0
			? rotatePoint(origin, [x0 + innerRadius, y0], startAngle)
			: origin;
	const arcP2inner =
		innerRadius > 0
			? rotatePoint(origin, [x0 + innerRadius, y0], endAngle)
			: origin;
	const distances = [
		distToSegment(point, arcP1inner, arcP1),
		distToSegment(point, arcP2inner, arcP2),
	];
	// only check distance to arc if the point falls within the angle,
	// otherwise the point is closer to a segment
	const pointAngle = calcAngle(origin, point);
	const pointAnglePi2 = pointAngle + Math.PI * 2;
	const pointAngleNPi2 = pointAngle - Math.PI * 2;
	if (
		(pointAngle > startAngle && pointAngle < endAngle) ||
		(pointAnglePi2 > startAngle && pointAnglePi2 < endAngle) ||
		(pointAngleNPi2 > startAngle && pointAngleNPi2 < endAngle)
	) {
		const distFromOrigin = distance(point, origin);
		distances.push(Math.abs(distFromOrigin - radius));
		if (innerRadius > 0) {
			distances.push(Math.abs(distFromOrigin - innerRadius));
		}
	}
	return Math.min(...distances);
}

export function distToPolygon(point: Point, points: Points): number {
	let minDist = Infinity;
	// iterate through line segments
	let i = 0;
	let j = points.length - 1;
	for (; i < points.length; j = i++) {
		const prev = points[j];
		const current = points[i];
		const dist = distToSegment(point, prev, current);
		if (dist < minDist) minDist = dist;
	}
	return minDist;
}

export function distToPoints(point: Point, points: Points): number {
	const min2 = points.reduce<number>((min, current) => {
		const d2 = distance2(point, current);
		return d2 < min ? d2 : min;
	}, Infinity);

	return Math.sqrt(min2);
}

// https://github.com/excalidraw/excalidraw/blob/f9d2d537a21fdf35cc412aa4186a513b0c909ac1/src/utils.ts#L94
export function measureText(text: string, size: number) {
	const line = document.createElement('div');
	const body = document.body;
	line.style.position = 'absolute';
	line.style.whiteSpace = 'pre';
	line.style.font = `${size}px Patrick Hand`;
	body.appendChild(line);
	line.innerText = text
		.split('\n')
		// replace empty lines with single space because leading/trailing empty
		// lines would be stripped from computation
		.map((x) => x || ' ')
		.join('\n');
	const width = line.offsetWidth;
	const height = line.offsetHeight;
	// Now creating 1px sized item that will be aligned to baseline
	// to calculate baseline shift
	const span = document.createElement('span');
	span.style.display = 'inline-block';
	span.style.overflow = 'hidden';
	span.style.width = '1px';
	span.style.height = '1px';
	line.appendChild(span);
	// Baseline is important for positioning text on canvas
	const baseline = span.offsetTop + span.offsetHeight;
	document.body.removeChild(line);

	return { width, height, baseline };
}
