import React, { useState } from 'react';
import clsx from 'clsx';
import './Properties.scss';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import type { Entity } from 'renderer/entities';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';
import { history } from 'renderer/history';
import { useOnPointerDownOutside } from 'hooks';

const fillable: Entity['type'][] = ['circle', 'cone', 'rect'];

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Properties = observer(function Properties({ className, style }: Props) {
	if (!plan.editable) return null;

	const selectedEntity: Entity | null =
		diagram.selectedEntities.length === 1 ? diagram.selectedEntities[0] : null;

	if (!selectedEntity) return null;

	return (
		<div className={clsx('Properties', className)} style={style}>
			{'roughOptions' in selectedEntity && (
				<ColorPicker entity={selectedEntity} />
			)}
			{fillable.includes(selectedEntity.type) && (
				<FillPicker entity={selectedEntity} />
			)}
		</div>
	);
});

export default Properties;

const colors = [
	{ name: 'gray', stroke: '#1a1f26', fill: 'rgba(112, 115, 119, 0.15)' },
	{ name: 'blue', stroke: '#1764ab', fill: 'rgba(75, 163, 241, 0.15)' },
	{ name: 'green', stroke: '#3ea47b', fill: 'rgba(112, 205, 167, 0.15)' },
	{ name: 'red', stroke: '#c33f42', fill: 'rgba(228, 112, 114, 0.15)' },
	{ name: 'purple', stroke: '#7048e8', fill: 'rgba(155, 107, 241, 0.15)' },
	{ name: 'cyan', stroke: '#1eb6b8', fill: 'rgba(101, 198, 199, 0.15)' },
	{ name: 'lime', stroke: '#66a80f', fill: 'rgba(184, 238, 102, 0.15)' },
	{ name: 'yellow', stroke: '#e67700', fill: 'rgba(255, 193, 80, 0.15)' },
] as const;
type Stroke = typeof colors[number]['stroke'];
type Fill = typeof colors[number]['fill'];

interface PickerProps {
	entity: Entity;
}

const ColorPicker = observer(function ColorPicker({ entity }: PickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const addRef = useOnPointerDownOutside(() => setIsOpen(false));

	if (!('roughOptions' in entity)) return null;

	const currentColor = entity.roughOptions.stroke;

	const modifyColor = (stroke: Stroke, fill: Fill) => {
		history.save();
		runInAction(() => {
			entity.roughOptions.stroke = stroke;
			if (entity.roughOptions.fill) {
				// match fill with stroke color
				entity.roughOptions.fill = fill;
			}
			plan.dirty = true;
		});
		diagram.render();
	};

	return (
		<div ref={addRef} className="container">
			<button
				className={clsx({ selected: isOpen })}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="swatch current" style={{ background: currentColor }} />
				Color
			</button>

			<div className="popup swatches">
				{colors.map(({ name, stroke, fill }) => (
					<button
						key={name}
						className={clsx('swatch', {
							selected: currentColor === stroke,
						})}
						style={{ background: stroke }}
						onClick={() => modifyColor(stroke, fill)}
					/>
				))}
			</div>
		</div>
	);
});

const fills = [
	{ style: 'none', label: 'No Fill' },
	{ style: 'solid', label: 'Solid' },
	{ style: 'hachure', label: 'Hachure' },
	{ style: 'cross-hatch', label: 'Cross Hatch' },
	{ style: 'zigzag', label: 'Zigzag' },
] as const;
type FillStyle = typeof fills[number]['style'];

const FillPicker = observer(function FillPicker({ entity }: PickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const addRef = useOnPointerDownOutside(() => setIsOpen(false));

	if (!('roughOptions' in entity) || !fillable.includes(entity.type))
		return null;

	const getCurrentFillLabel = () => {
		if (!entity.roughOptions.fill) return 'No Fill';

		const fill = fills.find((f) => f.style === entity.roughOptions.fillStyle);
		return fill!.label;
	};

	const getFillByStroke = () => {
		const color = colors.find(
			(color) => color.stroke === entity.roughOptions.stroke
		);
		return color?.fill ?? null;
	};

	const modifyFill = (fillStyle: FillStyle) => {
		history.save();
		runInAction(() => {
			if (fillStyle === 'none') {
				delete entity.roughOptions.fill;
			} else {
				const fill = getFillByStroke();
				if (!fill) return;
				entity.roughOptions.fill = fill;
				entity.roughOptions.fillStyle = fillStyle;
				entity.roughOptions.fillWeight = 1;
				entity.roughOptions.hachureGap = 8;
			}
			plan.dirty = true;
		});
		diagram.render();
	};

	return (
		<div ref={addRef} className="container">
			<button
				className={clsx({ selected: isOpen })}
				onClick={() => setIsOpen(!isOpen)}
			>
				{getCurrentFillLabel()}
			</button>

			<div className="popup options">
				{fills.map((fill) => (
					<button
						key={fill.style}
						className={clsx({ selected: fill.label === getCurrentFillLabel() })}
						onClick={() => modifyFill(fill.style)}
					>
						{fill.label}
					</button>
				))}
			</div>
		</div>
	);
});
