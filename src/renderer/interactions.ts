import { PointerEvent } from 'react';
import { action } from 'mobx';
import { diagram } from 'renderer/diagram';
import { Entity, createEntity } from 'renderer/entities';
import { Point, pointInBounds } from 'renderer/geometry';

function getCanvasCoords(e: PointerEvent<HTMLCanvasElement>): Point {
	const { left, top } = e.currentTarget.getBoundingClientRect();
	const x = ((e.clientX - left) * window.devicePixelRatio) / diagram.scale;
	const y = ((e.clientY - top) * window.devicePixelRatio) / diagram.scale;
	return [x, y];
}

export const handlePointerMove = action(function handlePointerMove(
	e: PointerEvent<HTMLCanvasElement>
) {
	e.stopPropagation();
	const [x, y] = getCanvasCoords(e);

	if (diagram.selectedTool !== 'cursor') {
		// either about to create, or creating an entity
		diagram.cursorType = 'crosshair';

		if (diagram.dragAnchor) {
			// TODO: modify entity instead of creating a new one
			diagram.entityInCreation = createEntity(
				diagram.selectedTool,
				diagram.dragAnchor,
				[x, y]
			);
			diagram.render();
		}

		return;
	}

	if (diagram.entityControlInUse) {
		// dragging a control
		diagram.entityControlInUse.handleDrag([x, y]);
		return;
	}

	if (diagram.dragAnchor) {
		// moving entities
		const [anchorX, anchorY] = diagram.dragAnchor;
		diagram.selectedEntities.forEach((entity) => {
			const [originX, originY] = entity.origin;
			entity.origin = [originX + x - anchorX, originY + y - anchorY];
		});
		diagram.dragAnchor = [x, y];
		diagram.render();
		return;
	}

	if (diagram.selectedEntities.length === 1) {
		// indicate to the user what is draggable
		for (const control of diagram.selectedEntities[0].controls) {
			if (control.hitTest([x, y])) {
				diagram.cursorType = 'grab';
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
	diagram.dragAnchor = [x, y];

	if (diagram.selectedTool !== 'cursor') {
		// start creating an entity
		diagram.entityInCreation = createEntity(
			diagram.selectedTool,
			diagram.dragAnchor,
			diagram.dragAnchor
		);
		diagram.render();
		return;
	}

	// only allow interacting with controls if one entity is selected
	if (diagram.selectedEntities.length === 1) {
		for (const control of diagram.selectedEntities[0].controls) {
			if (control.hitTest([x, y])) {
				diagram.entityControlInUse = control;
				diagram.cursorType = 'crosshair';
				return;
			}
		}
	}

	const hit = hitTest([x, y], diagram.entities);
	if (hit) {
		diagram.updateSelection([hit]);
		return;
	}

	// nothing hit
	diagram.updateSelection([]);
});

export const handlePointerUpLeave = action(function handlePointerUpLeave(
	e: PointerEvent<HTMLCanvasElement>
) {
	e.stopPropagation();
	diagram.dragAnchor = null;
	diagram.entityControlInUse = null;
	diagram.cursorType = 'default';

	if (diagram.entityInCreation) {
		// add the entity to the stack, and clear temporary state
		const createdEntity = diagram.entityInCreation;
		diagram.entities.push(createdEntity);
		diagram.entityInCreation = null;
		diagram.updateSelection([createdEntity]);
		// TODO: add tool lock
		diagram.selectedTool = 'cursor';
	}
});

function hitTest(point: Point, entities: Entity[]): Entity | false {
	// elements in the fore should be hit first
	for (let i = entities.length - 1; i > -1; i--) {
		const entity = entities[i];

		// bypass detailed hit testing if out of bounds
		if (!pointInBounds(point, entity.bounds)) continue;

		// selection should bypass detailed hit testing
		if (entity.isSelected) return entity;

		if (entity.hitTest(point)) return entity;
	}

	return false;
}
