import { PointerEvent, DragEvent, KeyboardEvent } from 'react';
import { action } from 'mobx';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';
import { history } from 'renderer/history';
import { HIT_TEST_TOLERANCE } from 'renderer/constants';
import {
	Entity,
	Freehand,
	Text,
	createFromAnchorPoints,
	deserializeEntities,
} from 'renderer/entities';
import {
	Point,
	averagePoints,
	calcBoundsFromPoints,
	pointInBounds,
	boundsInBounds,
	distance,
} from 'renderer/geometry';
import { RoughGenerator } from 'roughjs/bin/generator';

export function getCanvasCoords(e: PointerEvent | DragEvent): Point {
	const { left, top } = e.currentTarget.getBoundingClientRect();
	const x = ((e.clientX - left) * window.devicePixelRatio) / diagram.scale;
	const y = ((e.clientY - top) * window.devicePixelRatio) / diagram.scale;
	return [x, y];
}

function moveEntities(entities: Entity[], [x0, y0]: Point, [x, y]: Point) {
	entities.forEach((entity) => {
		const [originX, originY] = entity.origin;
		entity.origin = [originX + x - x0, originY + y - y0];
	});
	return entities;
}

export const handlePointerMove = action(function handlePointerMove(
	e: PointerEvent<HTMLCanvasElement>
) {
	if (!plan.editable) return;

	const [x, y] = getCanvasCoords(e);

	diagram.lastCursorPosition = [x, y];

	if (diagram.selectedTool !== 'cursor') {
		// either about to create, or creating an entity
		diagram.cursorType = 'crosshair';

		if (diagram.dragAnchor && diagram.entityInCreation) {
			if (diagram.entityInCreation instanceof Text) {
				return;
			} else if (diagram.entityInCreation instanceof Freehand) {
				diagram.entityInCreation.addPoint([x, y]);
				plan.dirty = true;
			} else {
				diagram.entityInCreation = createFromAnchorPoints(
					diagram.entityInCreation.type,
					diagram.dragAnchor,
					[x, y],
					diagram.entityInCreation.roughOptions.seed
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
		plan.dirty = true;
		return;
	}

	if (diagram.isDraggingEntities && diagram.dragAnchor) {
		// moving entities
		moveEntities(diagram.selectedEntities, diagram.dragAnchor, [x, y]);
		diagram.dragAnchor = [x, y];
		diagram.render();
		plan.dirty = true;
		return;
	}

	if (diagram.selectionPoints) {
		// doing a selection
		diagram.selectionPoints[1] = [x, y];
		const selectionBounds = calcBoundsFromPoints(diagram.selectionPoints);
		diagram.updateSelection(
			diagram.entities.filter((e) => boundsInBounds(e.bounds, selectionBounds))
		);
		return;
	}

	if (diagram.selectedEntities.length === 1) {
		// grab cursor indicator for controls
		for (const control of diagram.selectedEntities[0].controls) {
			if (control.hitTest([x, y])) {
				diagram.cursorType = 'grab';
				return;
			}
		}
	}

	// move cursor indicator
	const hit = hitTest([x, y]);
	if (hit) {
		diagram.cursorType = 'move';
		return;
	}

	// nothing hit
	diagram.cursorType = 'default';
});

export const handlePointerDown = action(function handlePointerDown(
	e: PointerEvent<HTMLCanvasElement>
) {
	if (!plan.editable) return;

	const [x, y] = getCanvasCoords(e);

	// always set a drag anchor
	diagram.dragAnchor = [x, y];

	if (diagram.selectedTool !== 'cursor') {
		// start creating an entity
		if (diagram.selectedTool === 'freehand') {
			diagram.entityInCreation = new Freehand({ points: [[x, y]] });
		} else if (diagram.selectedTool === 'text') {
			diagram.entityInCreation = new Text({ origin: [x, y], text: '' });
			// handle text editing in the TextEntityEditor component
			e.preventDefault();
		} else {
			diagram.entityInCreation = createFromAnchorPoints(
				diagram.selectedTool,
				diagram.dragAnchor,
				diagram.dragAnchor
			);
		}
		diagram.render();
		return;
	}

	if (diagram.selectedEntities.length === 1) {
		// only allow interacting with controls if one entity is selected
		for (const control of diagram.selectedEntities[0].controls) {
			if (control.hitTest([x, y])) {
				history.save();
				diagram.entityControlInUse = control;
				diagram.cursorType = 'grabbing';
				return;
			}
		}
	}

	const hit = detailedHitTest([x, y]);
	if (hit) {
		// moving things
		history.save();
		diagram.isDraggingEntities = true;
		if (!diagram.selectedEntities.includes(hit)) {
			diagram.updateSelection([hit]);
		}
		return;
	}

	// nothing hit, start a selection
	diagram.updateSelection([]);
	diagram.selectionPoints = [
		[x, y],
		[x, y],
	];
});

export const handlePointerUpLeave = action(function handlePointerUpLeave() {
	if (!plan.editable) return;

	// reset interaction state
	diagram.dragAnchor = null;
	diagram.isDraggingEntities = false;
	diagram.selectionPoints = null;

	if (diagram.entityControlInUse) {
		const modifiedEntity = diagram.entityControlInUse.parent;
		diagram.entityControlInUse = null;
		if (!diagram.validateEntity(modifiedEntity)) {
			diagram.deleteEntities([modifiedEntity]);
			plan.dirty = true;
		} else {
			diagram.cursorType = 'grab';
		}
	}

	if (diagram.entityInCreation) {
		if (diagram.entityInCreation.type === 'text') {
			// handle text editing in the TextEntityEditor component
			return;
		}
		// add the entity to the stack, and clear temporary state
		const createdEntity = diagram.entityInCreation;
		diagram.entityInCreation = null;
		if (diagram.validateEntity(createdEntity)) {
			diagram.addEntities([createdEntity]);
			plan.dirty = true;
		}
		if (diagram.selectedTool !== 'freehand') {
			diagram.selectedTool = 'cursor';
		}
	}

	diagram.render();
});

function pointInBoundsTolerance(point: Point, entity: Entity): boolean {
	const tolerance = HIT_TEST_TOLERANCE * diagram.windowScaleFactor;

	const entityBounds = entity.bounds;
	const bounds = {
		left: entityBounds.left - tolerance,
		right: entityBounds.right + tolerance,
		top: entityBounds.top - tolerance,
		bottom: entityBounds.bottom + tolerance,
	};

	return pointInBounds(point, bounds) && entity.distance(point) < tolerance;
}

// fast hit test, used for determining cursor style
function hitTest(point: Point): Entity | false {
	// elements in the fore should be hit first
	for (let i = diagram.entities.length - 1; i > -1; i--) {
		const entity = diagram.entities[i];

		const inBounds = pointInBoundsTolerance(point, entity);
		if (inBounds) return entity;
	}

	return false;
}

// finding needles in haystacks; harder-to-hit entities take priority
function detailedHitTest(point: Point): Entity | false {
	let smallest: Entity | false = false;
	let smallestDistance = Infinity;

	for (const entity of diagram.entities) {
		if (!pointInBoundsTolerance(point, entity)) continue;

		if (!smallest) {
			smallest = entity;
			smallestDistance = entity.distance(point);
			continue;
		}

		// if only considering marks, the smaller mark takes priority
		if (
			smallest.type === 'mark' &&
			entity.type === 'mark' &&
			entity.size < smallest.size
		) {
			smallest = entity;
			continue;
		}

		if (smallest.type !== entity.type) {
			// non-marks take priority
			if (smallest.type === 'mark') {
				smallest = entity;
				smallestDistance = entity.distance(point);
			}
			continue;
		}

		// entities closer to the point take priority
		const entityDistance = entity.distance(point);
		if (entityDistance < smallestDistance) {
			smallest = entity;
			smallestDistance = entityDistance;
		}
	}

	return smallest;
}

export const handleKeyDown = action(function handleKeyDown(
	e: KeyboardEvent<HTMLCanvasElement>
) {
	if (e.repeat) return;

	const key = e.key.toLowerCase();
	const ctrl = e.ctrlKey || e.metaKey;
	const shift = e.shiftKey;

	const selectAll = ctrl && key === 'a';
	const del = key === 'backspace' || key === 'delete';
	const copy = ctrl && key === 'c';
	const paste = ctrl && key === 'v';
	const undo = ctrl && key === 'z' && !shift;
	const redo = (ctrl && key === 'z' && shift) || (ctrl && key === 'y');

	// console.log(`${ctrl ? 'ctrl-' : ''}${key}`);

	if (selectAll) {
		e.preventDefault();
		diagram.updateSelection(diagram.entities);
	} else if (del) {
		diagram.deleteEntities(diagram.selectedEntities);
		plan.dirty = true;
	} else if (copy) {
		e.preventDefault();
		if (diagram.selectedEntities.length === 0) return;

		diagram.copyData = {
			entityData: diagram.selectedEntities.map((entity) =>
				JSON.parse(JSON.stringify(entity))
			),
			origin: averagePoints(
				diagram.selectedEntities.map((entity) => entity.origin)
			),
		};
	} else if (paste) {
		e.preventDefault();
		if (!diagram.copyData) return;

		const { entityData, origin } = diagram.copyData;

		const tolerance = HIT_TEST_TOLERANCE * diagram.windowScaleFactor;
		const position: Point =
			distance(origin, diagram.lastCursorPosition) < tolerance
				? [origin[0] + tolerance, origin[1] + tolerance]
				: diagram.lastCursorPosition;

		const pasted = moveEntities(
			deserializeEntities(entityData, false),
			origin,
			position
		);
		pasted.forEach((entity) => {
			if ('roughOptions' in entity) {
				entity.roughOptions.seed = RoughGenerator.newSeed();
			}
		});
		diagram.addEntities(pasted);
		plan.dirty = true;
		diagram.updateSelection(pasted);
	} else if (undo) {
		history.undo();
	} else if (redo) {
		history.redo();
	}

	e.stopPropagation();
});
