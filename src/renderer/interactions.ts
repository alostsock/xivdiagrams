import { PointerEvent, DragEvent } from 'react';
import { action } from 'mobx';
import { HIT_TEST_TOLERANCE } from 'renderer/constants';
import { diagram } from 'renderer/diagram';
import { Entity, Freehand, createFromAnchorPoints } from 'renderer/entities';
import { Bounds, Point, pointInBounds } from 'renderer/geometry';

export function getCanvasCoords(e: PointerEvent | DragEvent): Point {
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

		if (diagram.dragAnchor && diagram.entityInCreation) {
			if (diagram.entityInCreation instanceof Freehand) {
				diagram.entityInCreation.addPoint([x, y]);
			} else {
				// TODO: modify entity instead of creating a new one
				diagram.entityInCreation = createFromAnchorPoints(
					diagram.entityInCreation.type,
					diagram.dragAnchor,
					[x, y]
				);
			}
			diagram.render();
		}

		return;
	}

	if (diagram.entityControlInUse) {
		// dragging a control
		diagram.entityControlInUse.handleDrag([x, y]);
		diagram.cursorType = 'grabbing';
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
	const [x, y] = getCanvasCoords(e);
	diagram.dragAnchor = [x, y];

	if (diagram.selectedTool !== 'cursor') {
		// start creating an entity
		diagram.entityInCreation =
			diagram.selectedTool === 'freehand'
				? new Freehand({ points: [[x, y]] })
				: createFromAnchorPoints(
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
				diagram.cursorType = 'grabbing';
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
	if (diagram.dragAnchor && diagram.selectedEntities.length > 0) {
		// must have been dragging something
		diagram.cursorType = 'move';
	}

	diagram.dragAnchor = null;

	if (diagram.entityControlInUse) {
		const modifiedEntity = diagram.entityControlInUse.parent;
		diagram.entityControlInUse = null;
		if (!diagram.validateEntity(modifiedEntity)) {
			diagram.deleteEntities([modifiedEntity]);
		} else {
			diagram.cursorType = 'grab';
		}
	}

	if (diagram.entityInCreation) {
		// add the entity to the stack, and clear temporary state
		const createdEntity = diagram.entityInCreation;
		diagram.entityInCreation = null;
		if (diagram.validateEntity(createdEntity)) {
			diagram.addEntities([createdEntity]);
		}
		diagram.render();
		if (diagram.selectedTool !== 'freehand') {
			diagram.selectedTool = 'cursor';
		}
	}
});

function hitTest(point: Point, entities: Entity[]): Entity | false {
	// elements in the fore should be hit first
	for (let i = entities.length - 1; i > -1; i--) {
		const entity = entities[i];

		// bypass detailed hit testing if out of bounds
		const entityBounds = entity.bounds;
		const tolerance = HIT_TEST_TOLERANCE * diagram.windowScaleFactor;
		const boundsMargin: Bounds = {
			left: entityBounds.left - tolerance,
			right: entityBounds.right + tolerance,
			top: entityBounds.top - tolerance,
			bottom: entityBounds.bottom + tolerance,
		};
		if (!pointInBounds(point, boundsMargin)) continue;

		if (entity.hitTest(point)) return entity;
	}

	return false;
}
