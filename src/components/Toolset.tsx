import React from 'react';
import clsx from 'clsx';
import './Toolset.scss';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import type { Entity } from 'renderer/entities';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';
import {
	CursorSvg,
	CircleSvg,
	ConeSvg,
	RectSvg,
	LineSvg,
	ArrowSvg,
	FreehandSvg,
} from 'data/icons';

export type Tool =
	| 'cursor'
	| Extract<
			Entity['type'],
			'rect' | 'circle' | 'cone' | 'line' | 'arrow' | 'freehand'
	  >;

const tools: [Tool, JSX.Element][] = [
	['cursor', <CursorSvg key="cursor" />],
	['rect', <RectSvg key="rect" />],
	['circle', <CircleSvg key="circle" />],
	['cone', <ConeSvg key="cone" />],
	['line', <LineSvg key="line" />],
	['arrow', <ArrowSvg key="arrow" />],
	['freehand', <FreehandSvg key="freehand" />],
];

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Toolset = observer(function Toolset({ className, style }: Props) {
	if (!plan.editable) return null;

	return (
		<div className={clsx('Toolset', className)} style={style}>
			<fieldset>
				{tools.map(([tool, icon]) => (
					<label
						key={tool}
						className={clsx('icon', {
							selected: diagram.selectedTool === tool,
						})}
					>
						<input
							type="radio"
							name={tool}
							checked={diagram.selectedTool === tool}
							onChange={action(() => {
								diagram.updateSelection([]);
								diagram.selectedTool = tool;
								diagram.render();
							})}
						/>
						{icon}
					</label>
				))}
			</fieldset>
		</div>
	);
});

export default Toolset;
