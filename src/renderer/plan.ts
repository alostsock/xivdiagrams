import { makeAutoObservable } from 'mobx';
import { Entity } from 'renderer/entities';
import { diagram } from 'renderer/diagram';

interface Step {
	entities: Entity[];
	notes: string;
}

class Plan {
	title: string = 'Untitled';
	author: string = 'anonymous';
	steps: Step[] = [];

	constructor() {
		makeAutoObservable(this);
	}
}

export const plan = new Plan();
