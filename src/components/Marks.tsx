import React, { useState } from 'react';
import clsx from 'clsx';
import './Marks.scss';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useOnPointerDownOutside } from 'hooks';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';
import {
	MarkName,
	getMarkDefaults,
	createSvgDataUrl,
	roles,
	tanks,
	healers,
	physical,
	ranged,
	magical,
	mechanics,
} from 'data/marks';
import { Mark } from 'renderer/entities';
import { getCanvasCoords } from 'renderer/interactions';

type MarkGroup = {
	name: string;
	icons: Array<MarkName | 'spacer'>;
	width: number;
};

function createMarkGroup(
	name: string,
	iconGroups: Array<MarkName | 'spacer'>[]
): MarkGroup {
	let width = 0;
	const icons: Array<MarkName | 'spacer'> = [];

	iconGroups.forEach((group, i) => {
		width = Math.max(width, group.length);
		if (i > 0) icons.push('spacer');
		icons.push(...group);
	});

	return { name, icons, width };
}

const markGroups: MarkGroup[] = [
	createMarkGroup('General', [['mob'], roles, mechanics]),
	createMarkGroup('Jobs', [tanks, healers, physical, ranged, magical]),
];

interface PopupButtonProps {
	markGroup: MarkGroup;
}

const PopupButton = function PopupButton({ markGroup }: PopupButtonProps) {
	const [isSelected, setIsSelected] = useState(false);

	const addPointerOutsideRef = useOnPointerDownOutside(() => {
		setIsSelected(false);
	});

	return (
		<React.Fragment>
			<button
				ref={addPointerOutsideRef}
				className={clsx({ selected: isSelected })}
				onClick={action(() => {
					diagram.updateSelection([]);
					diagram.selectedTool = 'cursor';
					setIsSelected(!isSelected);
				})}
			>
				{markGroup.name}
			</button>

			<div
				ref={addPointerOutsideRef}
				className="popup"
				style={{ width: `${markGroup.width * 2.5 + 1}rem` }}
			>
				{markGroup.icons.map((icon, i) =>
					icon === 'spacer' ? (
						<span key={`spacer${i}`} className="spacer" />
					) : (
						<img
							draggable
							key={icon}
							// the id is used for drag and drop
							id={`mark-${icon}`}
							alt={icon}
							src={createSvgDataUrl(icon)}
							onDragStart={handleMarkDragStart}
							onTouchStart={(e) => {
								setIsSelected(false);
								handleMarkTouchStart(e);
							}}
						/>
					)
				)}
			</div>
		</React.Fragment>
	);
};

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Marks = observer(function Marks({ className, style }: Props) {
	if (!plan.editable) return null;

	return (
		<div className={clsx('Marks', className)} style={style}>
			{markGroups.map((markGroup) => (
				<PopupButton key={markGroup.name} markGroup={markGroup} />
			))}
		</div>
	);
});

export default Marks;

function handleMarkDragStart(e: React.DragEvent<HTMLImageElement>) {
	if (!(e.target instanceof HTMLImageElement)) return;

	e.dataTransfer.setData('text/plain', e.target.id);
	e.dataTransfer.effectAllowed = 'copy';
}

export function handleMarkDragEnterOver(e: React.DragEvent) {
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
}

export const handleMarkDrop = action(function handleMarkDrop(
	e: React.DragEvent
) {
	e.preventDefault();
	const origin = getCanvasCoords(e);
	const domId = e.dataTransfer.getData('text/plain');
	const name = domId.split('-').pop() as MarkName;
	const markEntity = new Mark({
		name,
		colors: [],
		origin,
		...getMarkDefaults(name),
	});
	diagram.addEntities([markEntity], false);
	plan.dirty = true;
});

// minimal touch support for now.
// try to support proper drag + drop in the future
const handleMarkTouchStart = action(function handleMarkTouchStart(
	e: React.TouchEvent
) {
	if (!(e.target instanceof HTMLImageElement)) return;

	if (!diagram.canvas) return;
	const canvasCenter = diagram.canvas.width / diagram.scale / 2;
	const name = e.target.id.split('-').pop() as MarkName;
	const markEntity = new Mark({
		name,
		colors: [],
		origin: [canvasCenter, canvasCenter],
		...getMarkDefaults(name),
	});
	diagram.addEntities([markEntity]);
	plan.dirty = true;
});
