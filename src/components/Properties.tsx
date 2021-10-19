import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { diagram } from 'renderer/diagram';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Properties = observer(function Properties({ className, style }: Props) {
	const numSelected = diagram.selectedEntities.length;
	const selectedEntity = numSelected === 1 && diagram.selectedEntities[0];

	return (
		<div className={clsx('Properties', className)} style={style}>
			Properties
			{selectedEntity && (
				<pre>
					<code>{JSON.stringify(selectedEntity, null, 2)}</code>
				</pre>
			)}
		</div>
	);
});

export default Properties;
