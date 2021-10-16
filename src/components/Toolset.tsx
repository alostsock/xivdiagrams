import { observer } from 'mobx-react-lite';
import { Tool, diagram } from 'renderer/diagram';
import {
	CursorSvg,
	CircleSvg,
	ConeSvg,
	RectSvg,
	ArrowSvg,
	LineSvg,
} from 'icons';
import clsx from 'clsx';
import './Toolset.scss';
import { action } from 'mobx';

const tools: [Tool, JSX.Element][] = [
	['cursor', <CursorSvg />],
	['circle', <CircleSvg />],
	['cone', <ConeSvg />],
	['rect', <RectSvg />],
];

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Toolset = observer(function Toolset({ className, style }: Props) {
	return (
		<fieldset className={clsx('Toolset', className)} style={style}>
			{tools.map(([tool, icon]) => (
				<label
					key={tool}
					className={clsx({ selected: diagram.selectedTool === tool })}
				>
					<input
						type="radio"
						name={tool}
						checked={diagram.selectedTool === tool}
						onChange={action(() => (diagram.selectedTool = tool))}
					/>
					{icon}
				</label>
			))}
		</fieldset>
	);
});

export default Toolset;
