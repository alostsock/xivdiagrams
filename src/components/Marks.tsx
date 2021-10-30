import React, { useState } from 'react';
import { action } from 'mobx';
import clsx from 'clsx';
import {
	IconName,
	createSvgDataUrl,
	roles,
	tanks,
	healers,
	physical,
	ranged,
	magical,
} from 'icons';
import { useOnPointerDownOutside } from 'hooks';
import { MarkType, createEntity } from 'renderer/entities';
import { diagram } from 'renderer/diagram';
import { getCanvasCoords } from 'renderer/interactions';
import './Marks.scss';

type MarkGroup = {
	name: string;
	icons: Array<IconName | 'spacer'>;
	width: number;
};

function createMarkGroup(
	name: string,
	iconGroups: Array<IconName | 'spacer'>[]
): MarkGroup {
	let width = 0;
	const icons: Array<IconName | 'spacer'> = [];

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
	const [x, y] = getCanvasCoords(e);
	const markId = e.dataTransfer.getData('text/plain') as MarkType;
	const size = getDefaultSize(markId);
	const markEntity = createEntity(
		markId,
		[x - size / 2, y - size / 2],
		[x + size / 2, y + size / 2]
	);
	diagram.addEntities([markEntity]);
});

function getDefaultSize(markType: MarkType): number {
	const iconName = markType.split('-', 2).pop() as IconName;
	if (iconName === 'mob') return 50;
	return 30;
}
