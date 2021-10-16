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

export function dist2([x0, y0]: Point, [x1, y1]: Point) {
	return (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
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

export function pointInCircle(
	point: Point,
	origin: Point,
	radius: number
): boolean {
	return dist2(point, origin) < radius * radius;
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

export function distToCircle([x, y]: Point, [x0, y0]: Point, radius: number) {
	return Math.abs(Math.hypot(x - x0, y - y0) - radius);
}

export function distToSegment(p: Point, v: Point, w: Point) {
	// https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
	const l2 = dist2(v, w);
	// 0-length segment
	if (l2 === 0) return Math.hypot(v[0] - p[0], v[1] - p[1]);
	// find projection of p onto line defined by v-w
	// t = dot(p-v, w-v) / |w-v|^2
	let t = dot([p[0] - v[0], p[1] - v[1]], [w[0] - v[0], w[1] - v[1]]) / l2;
	// clamp t to [0,1]
	t = Math.max(0, Math.min(1, t));
	// projection = v + t * (w-v)
	const proj: Point = [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])];
	return Math.hypot(proj[0] - p[0], proj[1] - p[1]);
}

export function distToSegments(p: Point, segments: Segments) {
	let min = Infinity;
	segments.forEach(([s1, s2]) => {
		const d = distToSegment(p, s1, s2);
		if (d < min) min = d;
	});
	return min;
}

export function distToCone(
	point: Point,
	origin: Point,
	radius: number,
	startAngle: number,
	endAngle: number
): number {
	const [x, y] = point;
	const [x0, y0] = origin;
	// get shortest distance to each side of the cone
	const arcP1 = rotatePoint(origin, [x0 + radius, y0], startAngle);
	const arcP2 = rotatePoint(origin, [x0 + radius, y0], endAngle);
	const distances = [
		distToSegment(point, origin, arcP1),
		distToSegment(point, origin, arcP2),
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
		distances.push(Math.abs(Math.hypot(x - x0, y - y0) - radius));
	}
	return Math.min(...distances);
}

export function distToPolygon(point: Point, points: Points): number {
	let minDist: number = Infinity;
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
