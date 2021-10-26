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

type MarkGroup = { name: string; icons: IconName[] };

const markGroups: MarkGroup[] = [
	{
		name: 'General',
		icons: ['mob', ...roles],
	},
	{
		name: 'Jobs',
		icons: [...tanks, ...healers, ...physical, ...ranged, ...magical],
	},
];

interface MarkDrawerProps {
	markGroup: MarkGroup;
}

const PopupButton = function MarkDrawer({ markGroup }: MarkDrawerProps) {
	const [isSelected, setIsSelected] = useState(false);

	const pointerOutsideRef = useOnPointerDownOutside(() => {
		setIsSelected(false);
	});

	return (
		<button
			ref={pointerOutsideRef}
			key={markGroup.name}
			className={clsx({ selected: isSelected })}
			onClick={() => setIsSelected(true)}
		>
			{markGroup.name}

			<div className="popup">
				{markGroup.icons.map((icon) => (
					<img
						draggable
						key={icon}
						// the id is used for drag and drop
						id={`mark-${icon}`}
						alt={icon}
						src={createSvgDataUrl(icon)}
						onDragStart={handleMarkDragStart}
					/>
				))}
			</div>
		</button>
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
	const size = 35;
	const markEntity = createEntity(
		markId,
		[x - size / 2, y - size / 2],
		[x + size / 2, y + size / 2]
	);
	diagram.addEntities([markEntity]);
});
