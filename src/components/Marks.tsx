import React, { useState } from 'react';
import { action } from 'mobx';
import clsx from 'clsx';
import { IconName, createSvgDataUrl } from 'icons';
import { useOnPointerDownOutside } from 'hooks';
import { MarkType, createEntity } from 'renderer/entities';
import { diagram } from 'renderer/diagram';
import { getCanvasCoords } from 'renderer/interactions';

const roles: IconName[] = ['tank', 'healer', 'dps'];
const tanks: IconName[] = ['pld', 'war', 'drk', 'gnb'];
const healers: IconName[] = ['whm', 'sch', 'ast', 'sge'];
const melee: IconName[] = ['mnk', 'drg', 'nin', 'sam', 'rpr'];
const ranged: IconName[] = ['brd', 'mch', 'dnc'];
const caster: IconName[] = ['blm', 'smn', 'rdm', 'blu'];

type MarkDrawerData = { value: string; label: string; icons: IconName[] };

const marks: MarkDrawerData[] = [
	{
		value: 'players',
		label: 'Players',
		icons: [...roles, ...tanks, ...healers, ...melee, ...ranged, ...caster],
	},
	{
		value: 'enemies',
		label: 'Enemies',
		icons: ['mob'],
	},
];

interface MarkDrawerProps {
	mark: MarkDrawerData;
}

const MarkDrawer = function MarkDrawer({ mark }: MarkDrawerProps) {
	const [isSelected, setIsSelected] = useState(false);

	const pointerOutsideRef = useOnPointerDownOutside(() => {
		setIsSelected(false);
	});

	return (
		<button
			ref={pointerOutsideRef}
			key={mark.value}
			className={clsx({ selected: isSelected })}
			onClick={() => setIsSelected(true)}
		>
			{mark.label}

			<div className="icons">
				{mark.icons.map((icon) => (
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
			{marks.map((mark) => (
				<MarkDrawer key={mark.value} mark={mark} />
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
	const markEntity = createEntity(markId, [x - 15, y - 15], [x + 20, y + 20]);
	diagram.entities.push(markEntity);
	diagram.updateSelection([markEntity]);
});
