import { useState } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import type { Entity } from 'renderer/entities';
import { diagram } from 'renderer/diagram';
import { useOnPointerDownOutside } from 'hooks';
import './Properties.scss';
import { DEFAULT_MARK_SIZE } from 'renderer/constants';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Properties = observer(function Properties({ className, style }: Props) {
	const selectedEntity: Entity | null =
		diagram.selectedEntities.length === 1 ? diagram.selectedEntities[0] : null;

	if (!selectedEntity) return null;

	return (
		<div className={clsx('Properties', className)} style={style}>
			<ColorPicker entity={selectedEntity} />
			<FillPicker entity={selectedEntity} />
			<SizePicker entity={selectedEntity} />
		</div>
	);
});

export default Properties;

const colors = [
	{ name: 'gray', stroke: '#1a1f26', fill: 'rgba(186, 186, 188, 0.5)' },
	{ name: 'blue', stroke: '#1764ab', fill: 'rgba(75, 163, 241, 0.5)' },
	{ name: 'green', stroke: '#3ea47b', fill: 'rgba(112, 205, 167, 0.5)' },
	{ name: 'red', stroke: '#b4434a', fill: 'rgba(229, 121, 125, 0.5)' },
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
		runInAction(() => {
			entity.roughOptions.stroke = stroke;
			if (entity.roughOptions.fill) {
				// match fill with stroke color
				entity.roughOptions.fill = fill;
			}
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
	// bug in rough.js with solid fills
	// { style: 'solid', label: 'Solid' },
	{ style: 'hachure', label: 'Hachure' },
	{ style: 'cross-hatch', label: 'Cross Hatch' },
] as const;
type FillStyle = typeof fills[number]['style'];
type FillLabel = typeof fills[number]['label'];

const FillPicker = observer(function FillPicker({ entity }: PickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const addRef = useOnPointerDownOutside(() => setIsOpen(false));
	const fillable: Entity['type'][] = ['circle', 'cone', 'rect'];

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
		return color!.fill;
	};

	const modifyFill = (fillStyle: FillStyle) => {
		runInAction(() => {
			if (fillStyle === 'none') {
				delete entity.roughOptions.fill;
			} else {
				entity.roughOptions.fill = getFillByStroke();
				entity.roughOptions.fillStyle = fillStyle;
			}
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

const sizes = [
	{ value: 20, label: 'Small' },
	{ value: DEFAULT_MARK_SIZE, label: 'Normal' },
	{ value: 50, label: 'Large' },
] as const;

// TODO: change to a slider instead
const SizePicker = observer(function SizePicker({ entity }: PickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const addRef = useOnPointerDownOutside(() => setIsOpen(false));

	if (!entity.type.startsWith('mark') || !('size' in entity)) return null;

	const getCurrentSizeLabel = () => {
		const size = sizes.find((s) => entity.size === s.value);
		return size!.label;
	};
	const modifySize = (size: number) => {
		runInAction(() => (entity.size = size));
		diagram.render();
	};

	return (
		<div ref={addRef} className="container">
			<button
				className={clsx({ selected: isOpen })}
				onClick={() => setIsOpen(!isOpen)}
			>
				{getCurrentSizeLabel()}
			</button>

			<div className="popup options">
				{sizes.map((size) => (
					<button
						key={size.label}
						className={clsx({ selected: size.label === getCurrentSizeLabel() })}
						onClick={() => modifySize(size.value)}
					>
						{size.label}
					</button>
				))}
			</div>
		</div>
	);
});
