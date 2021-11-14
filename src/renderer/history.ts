import { Entity, EntityData, deserializeEntities } from 'renderer/entities';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';

const MAX_STACK_SIZE = 50;

function freeze(entities: Entity[]): EntityData[] {
	// there's probably a better way to do this
	return entities.map((e) => JSON.parse(JSON.stringify(e)));
}

type Action = 'add' | 'delete' | 'update';

interface Entry {
	entities: EntityData[];
}

// simple history implementation for now; just store the state of every entity
// actions must call `save()` before any modifications
class History {
	private undos: Entry[] = [];
	private redos: Entry[] = [];

	save() {
		this.undos = [
			...this.undos.slice(-MAX_STACK_SIZE + 1),
			{ entities: freeze(diagram.entities) },
		];
		this.redos = [];
	}

	clear() {
		this.undos = [];
		this.redos = [];
	}

	undo() {
		const entry = this.undos.pop();
		if (!entry) return;

		diagram.updateSelection([]);

		this.redos.push({ entities: freeze(diagram.entities) });

		diagram.entities = deserializeEntities(entry.entities);
		diagram.render();

		plan.dirty = true;
	}

	redo() {
		const entry = this.redos.pop();
		if (!entry) return;

		diagram.updateSelection([]);

		this.undos.push({ entities: freeze(diagram.entities) });

		diagram.entities = deserializeEntities(entry.entities);
		diagram.render();

		plan.dirty = true;
	}
}

export const history = new History();
