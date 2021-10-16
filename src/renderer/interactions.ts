import { PointerEvent } from 'react';
import { action } from 'mobx';
import { HIT_TEST_TOLERANCE } from 'renderer/constants';
import { diagram } from 'renderer/diagram';
import { Entity } from 'renderer/entities';
import {
	Point,
	distToCircle,
	distToCone,
	distToPolygon,
	pointInBounds,
	distToSegments,
} from 'renderer/geometry';

function getCanvasCoords(e: PointerEvent<HTMLCanvasElement>): Point {
	const { left, top } = e.currentTarget.getBoundingClientRect();
	const x = (e.clientX - left) * window.devicePixelRatio;
	const y = (e.clientY - top) * window.devicePixelRatio;
	return [x, y];
}

export const handlePointerMove = action(function handlePointerMove(
	e: PointerEvent<HTMLCanvasElement>
) {
	e.stopPropagation();
	const [x, y] = getCanvasCoords(e);

	if (diagram.dragAnchor) {
		const [anchorX, anchorY] = diagram.dragAnchor;
		diagram.entities.forEach((entity) => {
			if (entity.isSelected) {
				const [originX, originY] = entity.origin;
				entity.origin = [originX + x - anchorX, originY + y - anchorY];
			}
		});
		diagram.dragAnchor = [x, y];
		diagram.render();
		return;
	}

	if (diagram.controlInUse) {
		diagram.controlInUse.handleDrag([x, y]);
		return;
	}

	if (diagram.selectedEntities.length === 1) {
		for (const control of diagram.selectedEntities[0].controls) {
			if (control.hitTest([x, y])) {
				diagram.cursorType = 'crosshair';
				return;
			}
		}
	}

	const hit = hitTest([x, y], diagram.entities);
	if (hit) {
		diagram.cursorType = 'move';
		return;
	}

	diagram.cursorType = 'default';
});

export const handlePointerDown = action(function handlePointerDown(
	e: PointerEvent<HTMLCanvasElement>
) {
	e.stopPropagation();
	const [x, y] = getCanvasCoords(e);

	if (diagram.selectedEntities.length === 1) {
		for (const control of diagram.selectedEntities[0].controls) {
			if (control.hitTest([x, y])) {
				diagram.controlInUse = control;
				diagram.cursorType = 'crosshair';
				return;
			}
		}
	}

	const hit = hitTest([x, y], diagram.entities);
	if (hit) {
		diagram.setSelection([hit]);
		diagram.dragAnchor = [x, y];
		diagram.render();
		return;
	}

	diagram.setSelection([]);
	diagram.render();
});

export const handlePointerUpLeave = action(function handlePointerUpLeave(
	e: PointerEvent<HTMLCanvasElement>
) {
	e.stopPropagation();
	diagram.dragAnchor = null;
	diagram.controlInUse = null;
	diagram.cursorType = 'default';
});

export function hitTest(point: Point, entities: Entity[]): Entity | false {
	// elements in the fore should be hit first
	for (let i = entities.length - 1; i > -1; i--) {
		const entity = entities[i];

		if (!pointInBounds(point, entity.bounds)) continue;

		// selection should bypass detailed hit testing
		if (entity.isSelected) return entity;

		switch (entity.type) {
			case 'circle': {
				const d = distToCircle(point, entity.origin, entity.radius);
				if (d <= HIT_TEST_TOLERANCE) return entity;
				break;
			}
			case 'cone': {
				const { origin, radius, start, end } = entity;
				const d = distToCone(point, origin, radius, start, end);
				if (d <= HIT_TEST_TOLERANCE) return entity;
				break;
			}
			case 'rect': {
				const d = distToPolygon(point, entity.points);
				if (d <= HIT_TEST_TOLERANCE) return entity;
				break;
			}
			case 'line':
			case 'arrow': {
				const d = distToSegments(point, entity.segments);
				if (d <= HIT_TEST_TOLERANCE) return entity;
				break;
			}
		}
	}

	return false;
}
