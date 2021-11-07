import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Entity } from 'renderer/entities';
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
import clsx from 'clsx';

export type Tool =
	| 'cursor'
	| Extract<
			Entity['type'],
			'rect' | 'circle' | 'cone' | 'line' | 'arrow' | 'freehand'
	  >;

const tools: [Tool, JSX.Element][] = [
	['cursor', <CursorSvg />],
	['rect', <RectSvg />],
	['circle', <CircleSvg />],
	['cone', <ConeSvg />],
	['line', <LineSvg />],
	['arrow', <ArrowSvg />],
	['freehand', <FreehandSvg />],
];

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Toolset = observer(function Toolset({ className, style }: Props) {
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
