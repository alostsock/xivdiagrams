import React, { useState } from 'react';
import clsx from 'clsx';
import './Marks.scss';
import { action } from 'mobx';
import { useOnPointerDownOutside } from 'hooks';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';
import {
	MarkName,
	createSvgDataUrl,
	roles,
	tanks,
	healers,
	physical,
	ranged,
	magical,
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
	createMarkGroup('General', [['mob', ...roles]]),
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
		<>
			<button
				ref={addPointerOutsideRef}
				className={clsx({ selected: isSelected })}
				onClick={() => setIsSelected(!isSelected)}
			>
				{markGroup.name}
			</button>
			<div
				ref={addPointerOutsideRef}
				className="popup"
				style={{ width: `${markGroup.width * 2.5 + 0.5}rem` }}
			>
				{markGroup.icons.map((icon, i) => {
					if (icon === 'spacer') {
						return <span key={`spacer${i}`} className="spacer" />;
					} else {
						return (
							<img
								draggable
								key={icon}
								// the id is used for drag and drop
								id={`mark-${icon}`}
								alt={icon}
								src={createSvgDataUrl(icon)}
								onDragStart={handleMarkDragStart}
							/>
						);
					}
				})}
			</div>
		</>
	);
};

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Marks = ({ className, style }: Props) => {
	if (!plan.editable) return null;

	return (
		<div className={clsx('Marks', className)} style={style}>
			{markGroups.map((markGroup) => (
				<PopupButton key={markGroup.name} markGroup={markGroup} />
			))}
		</div>
	);
};

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
	const size = getDefaultSize(name);
	const markEntity = new Mark({ name, colors: [], origin, size });
	diagram.addEntities([markEntity]);
	plan.dirty = true;
});

// TODO: add custom attributes per mark
function getDefaultSize(markType: MarkName): number {
	const iconName = markType.split('-', 2).pop() as MarkName;
	if (iconName === 'mob') return 50;
	return 30;
}
