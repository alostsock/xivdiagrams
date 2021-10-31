import {
	CONTROL_RADIUS,
	CONTROL_OFFSET,
	CONTROL_STROKE_STYLE,
	CONTROL_LINE_WIDTH,
	CONTROL_FILL_STYLE,
	MIN_DIMENSION,
} from 'renderer/constants';
import {
	calcAngle,
	Point,
	pointInCircle,
	rotatePoint,
} from 'renderer/geometry';
import { Circle, Cone, Rect, Line, Mark } from 'renderer/entities';
import { diagram } from 'renderer/diagram';

export interface Control<T> {
	parent: T;
	position: Point;
	render: (ctx: CanvasRenderingContext2D) => void;
	hitTest: (point: Point) => boolean;
	handleDrag: (point: Point) => void;
}

function renderCircleControl(ctx: CanvasRenderingContext2D, [x, y]: Point) {
	ctx.save();

	// divide by the canvas's scale factor to keep control sizes relatively
	// consistent across devices (i.e. larger for small screens, smaller for
	// large screens)
	const radius = CONTROL_RADIUS / diagram.scale;
	ctx.lineWidth = CONTROL_LINE_WIDTH / diagram.scale;
	ctx.strokeStyle = CONTROL_STROKE_STYLE;
	ctx.fillStyle = CONTROL_FILL_STYLE;

	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	ctx.restore();
}

function hitTestCircleControl(point: Point, controlPosition: Point) {
	const radius = CONTROL_RADIUS / diagram.scale;
	return pointInCircle(point, controlPosition, radius);
}

export class CircleRadiusControl implements Control<Circle> {
	angle: number = -Math.PI / 4;

	constructor(public parent: Circle) {}

	get position(): Point {
		const [x0, y0] = this.parent.origin;
		return [
			x0 + this.parent.radius * Math.cos(this.angle),
			y0 + this.parent.radius * Math.sin(this.angle),
		];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag([x, y]: Point) {
		const [x0, y0] = this.parent.origin;
		this.angle = calcAngle([x0, y0], [x, y]);
		this.parent.radius = Math.max(
			this.parent.innerRadius + MIN_DIMENSION,
			Math.hypot(x - x0, y - y0)
		);
		diagram.render();
	}
}

export class CircleInnerRadiusControl implements Control<Circle> {
	angle: number = -Math.PI / 4;

	constructor(public parent: Circle) {}

	get radiusControl(): CircleRadiusControl | null {
		const control = this.parent.controls.find(
			(c) => c instanceof CircleRadiusControl
		);
		return control instanceof CircleRadiusControl ? control : null;
	}

	get position(): Point {
		const [x0, y0] = this.parent.origin;
		const angle = this.radiusControl?.angle ?? this.angle;
		return [
			x0 + this.parent.innerRadius * Math.cos(angle),
			y0 + this.parent.innerRadius * Math.sin(angle),
		];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag([x, y]: Point) {
		const [x0, y0] = this.parent.origin;

		const outerMidPoint = this.radiusControl
			? this.radiusControl.position
			: rotatePoint(
					this.parent.origin,
					[x0 + this.parent.radius, y0],
					this.angle + Math.PI
			  );

		const isPastMiddle =
			Math.hypot(outerMidPoint[0] - x, outerMidPoint[1] - y) >
			this.parent.radius;

		if (isPastMiddle) {
			this.parent.innerRadius = 0;
		} else {
			this.parent.innerRadius = Math.min(
				Math.hypot(x - x0, y - y0),
				this.parent.radius - MIN_DIMENSION
			);
		}
		diagram.render();
	}
}

export class ConeRadiusRotationControl implements Control<Cone> {
	constructor(public parent: Cone) {}

	get position(): Point {
		const midAngle = (this.parent.start + this.parent.end) / 2;
		const [x0, y0] = this.parent.origin;
		return [
			x0 + this.parent.radius * Math.cos(midAngle),
			y0 + this.parent.radius * Math.sin(midAngle),
		];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag([x, y]: Point) {
		const [x0, y0] = this.parent.origin;
		this.parent.radius = Math.max(
			this.parent.innerRadius + MIN_DIMENSION,
			Math.hypot(x - x0, y - y0)
		);

		const angleWidth = this.parent.end - this.parent.start;
		const midAngle = calcAngle(this.parent.origin, [x, y]);
		this.parent.start = midAngle - angleWidth / 2;
		this.parent.end = midAngle + angleWidth / 2;
		diagram.render();
	}
}

export class ConeInnerRadiusControl implements Control<Cone> {
	constructor(public parent: Cone) {}

	get position(): Point {
		const midAngle = (this.parent.start + this.parent.end) / 2;
		const [x0, y0] = this.parent.origin;
		return [
			x0 + this.parent.innerRadius * Math.cos(midAngle),
			y0 + this.parent.innerRadius * Math.sin(midAngle),
		];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag([x, y]: Point) {
		const [x0, y0] = this.parent.origin;

		const midAngle = (this.parent.start + this.parent.end) / 2;
		const outerMidPoint = rotatePoint(
			this.parent.origin,
			[x0 + this.parent.radius, y0],
			midAngle
		);

		const isPastCenter =
			Math.hypot(outerMidPoint[0] - x, outerMidPoint[1] - y) >
			this.parent.radius;

		// test if the control is dragged past the middle
		if (isPastCenter) {
			this.parent.innerRadius = 0;
		} else {
			this.parent.innerRadius = Math.min(
				Math.hypot(x - x0, y - y0),
				this.parent.radius - MIN_DIMENSION
			);
		}
		diagram.render();
	}
}

export class ConeAngleControl implements Control<Cone> {
	constructor(public parent: Cone) {}

	get position(): Point {
		const [x0, y0] = this.parent.origin;
		const distFromCenter =
			this.parent.innerRadius +
			(this.parent.radius - this.parent.innerRadius) / 2;
		return [
			x0 + distFromCenter * Math.cos(this.parent.end),
			y0 + distFromCenter * Math.sin(this.parent.end),
		];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag(point: Point) {
		const pi2 = Math.PI * 2;
		let start = this.parent.start;
		// returns an angle from [-pi, pi]
		let end = calcAngle(this.parent.origin, point);
		if (end < start) end += pi2;
		// spooky stuff happens if the end angle is too close
		if ((end - start) % pi2 > pi2 - 0.1) {
			end = start + pi2 - 0.1;
		} else if (end - start < 0.1) {
			end = start + 0.1;
		}
		// wrap around if the arc overlaps
		if (end - start >= pi2) {
			start += pi2;
		}
		// keep values in range
		// while (start < -Math.PI && end < -Math.PI || start < -pi2 || end < -pi2) {
		while (start < -pi2 || end < -pi2) {
			start += pi2;
			end += pi2;
		}
		while (start > pi2 || end > pi2) {
			start -= pi2;
			end -= pi2;
		}
		this.parent.start = start;
		this.parent.end = end;
		diagram.render();
	}
}

export class RectCornerControl implements Control<Rect> {
	constructor(public parent: Rect, public pointIndex = 0 | 1 | 2 | 3) {}

	get position() {
		return this.parent.points[this.pointIndex];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag(point: Point) {
		// first anchor point -- the dragged corner
		const [x1, y1] = point;
		// the other anchor point will always be opposite on a rectangle
		const [x2, y2] = this.parent.points[(this.pointIndex + 2) % 4];
		this.parent.origin = [(x1 + x2) / 2, (y1 + y2) / 2];
		// get width/height between anchor points on an un-rotated axis
		const [rx, ry] = rotatePoint([x2, y2], [x1, y1], -this.parent.rotation);
		this.parent.width = Math.abs(x2 - rx);
		this.parent.height = Math.abs(y2 - ry);
		diagram.render();
	}
}

export class RectRotationControl implements Control<Rect> {
	angle = Math.PI / 2; // should appear at the 'top' of a rect

	constructor(public parent: Rect) {}

	get position() {
		const distFromCenter = this.parent.height / 2 + CONTROL_OFFSET;
		const [x0, y0] = this.parent.origin;
		return rotatePoint(
			[x0, y0],
			[x0 + distFromCenter, y0],
			-this.angle + this.parent.rotation
		);
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag(point: Point) {
		this.parent.rotation = this.angle + calcAngle(this.parent.origin, point);
		diagram.render();
	}
}

export class LinePointControl implements Control<Line> {
	constructor(public parent: Line, public isHead: boolean) {}

	get position() {
		return this.isHead ? this.parent.lineTo : this.parent.origin;
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag(point: Point) {
		if (this.isHead) {
			const anchor = this.parent.origin;
			this.parent.angle = calcAngle(anchor, point);
			this.parent.length = Math.hypot(
				point[0] - anchor[0],
				point[1] - anchor[1]
			);
		} else {
			const anchor = this.parent.lineTo;
			this.parent.origin = point;
			this.parent.angle = calcAngle(point, anchor);
			this.parent.length = Math.hypot(
				point[0] - anchor[0],
				point[1] - anchor[1]
			);
		}
		diagram.render();
	}
}

export class MarkSizeControl implements Control<Mark> {
	angle: number = -Math.PI / 4;

	constructor(public parent: Mark) {}

	get position(): Point {
		const [x0, y0] = this.parent.origin;
		return [
			x0 + this.parent.size * 0.5 * Math.cos(this.angle),
			y0 + this.parent.size * 0.5 * Math.sin(this.angle),
		];
	}

	render(ctx: CanvasRenderingContext2D) {
		renderCircleControl(ctx, this.position);
	}

	hitTest(point: Point) {
		return hitTestCircleControl(point, this.position);
	}

	handleDrag([x, y]: Point) {
		const [x0, y0] = this.parent.origin;
		this.angle = calcAngle([x0, y0], [x, y]);
		this.parent.size = 2 * Math.hypot(x - x0, y - y0);
		diagram.render();
	}
}
