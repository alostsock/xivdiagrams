import { PointerEvent } from 'react';
import { action } from 'mobx';
import { diagram } from 'renderer/diagram';
import { Entities, Entity, EntityData } from 'renderer/entities';
import {
	distToCircle,
	distToPolygon,
	Point,
	pointInBounds,
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

	if (diagram.controlInUse) {
		diagram.controlInUse.handleDrag([x, y]);
		return;
	}

	const hit = hitTest([x, y], diagram.entities);

	if (hit && hit.isSelected && diagram.selectedIds.size === 1) {
		for (const control of hit.controls) {
			if (control.hitTest([x, y])) {
				diagram.cursorType = 'crosshair';
				return;
			}
		}
	}

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
	const { left, top } = e.currentTarget.getBoundingClientRect();
	const x = e.clientX - left;
	const y = e.clientY - top;

	const hit = hitTest([x, y], diagram.entities);

	if (hit && hit.isSelected && diagram.selectedIds.size === 1) {
		for (const control of hit.controls) {
			if (control.hitTest([x, y])) {
				diagram.controlInUse = control;
				diagram.cursorType = 'crosshair';
				return;
			}
		}
	}

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

export function hitTest(
	point: Point,
	entities: Entities
): Entity<EntityData> | false {
	const tolerance = 10;

	// elements in the fore should be hit first
	for (let i = entities.length - 1; i > -1; i--) {
		const entity = entities[i];

		if (!pointInBounds(point, entity.bounds)) continue;

		// selection should bypass detailed hit testing
		if (entity.isSelected) return entity;

		switch (entity.type) {
			case 'circle': {
				const d = distToCircle(point, entity.origin, entity.radius);
				if (d <= tolerance) return entity;
				break;
			}
			case 'rect': {
				const d = distToPolygon(point, entity.points);
				if (d <= tolerance) return entity;
				break;
			}
		}
	}

	return false;
}
