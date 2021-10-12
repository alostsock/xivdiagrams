import { PointerEvent } from 'react';
import { action } from 'mobx';
import { diagram } from 'renderer/diagram';
import { Entities, Entity, EntityData } from 'renderer/entities';
import {
	calcRectPoints,
	distToCircle,
	distToPolygon,
	Point,
	pointInBounds,
	pointInPolygon,
} from 'renderer/geometry';

export const handlePointerMove = action(function handlePointerMove(
	e: PointerEvent<HTMLCanvasElement>
) {
	e.stopPropagation();
	const { left, top } = e.currentTarget.getBoundingClientRect();
	const x = e.clientX - left;
	const y = e.clientY - top;

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

	if (!hitTest([x, y], diagram.entities)) {
		diagram.cursorType = 'default';
	} else {
		diagram.cursorType = 'move';
	}
});

export const handlePointerDown = action(function handlePointerDown(
	e: PointerEvent<HTMLCanvasElement>
) {
	e.stopPropagation();
	const { left, top } = e.currentTarget.getBoundingClientRect();
	const x = e.clientX - left;
	const y = e.clientY - top;

	const hit = hitTest([x, y], diagram.entities);

	diagram.entities.forEach((e) => (e.isSelected = false));

	if (hit) {
		hit.isSelected = true;
		diagram.dragAnchor = [x, y];
	}
	diagram.render();
});

export const handlePointerUpLeave = action(function handlePointerUpLeave(
	e: PointerEvent<HTMLCanvasElement>
) {
	e.stopPropagation();
	diagram.dragAnchor = null;
	diagram.cursorType = 'default';
});

export function hitTest(
	point: Point,
	entities: Entities
): Entity<EntityData> | false {
	const tolerance = 10;

	// elements in the fore should be hit first
	for (let i = entities.length - 1; i > -1; i--) {
		const entity = entities[i];

		if (pointInBounds(point, entity.bounds)) {
			if (entity.isSelected) return entity;

			if (
				entity.type === 'circle' &&
				distToCircle(point, entity.origin, entity.radius) <= tolerance
			) {
				return entity;
			} else if (
				entity.type === 'rect' &&
				distToPolygon(
					point,
					calcRectPoints(
						entity.origin,
						entity.width,
						entity.height,
						entity.rotation
					)
				) < tolerance
			) {
				return entity;
			}
		}
	}

	return false;
}
