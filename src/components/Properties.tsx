import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { diagram } from 'renderer/diagram';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Properties = observer(function Properties({ className, style }: Props) {
	return (
		<div className={clsx('Properties', className)} style={style}>
			Properties
			<pre>
				<code># of entities: {diagram.entities.length}</code>
			</pre>
			<pre>
				<code>{JSON.stringify(diagram.selectedEntities[0], null, 2)}</code>
			</pre>
		</div>
	);
});

export default Properties;
