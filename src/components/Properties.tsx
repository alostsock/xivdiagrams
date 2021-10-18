import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Properties = observer(function Properties({ className, style }: Props) {
	return (
		<div className={clsx('Properties', className)} style={style}>
			Properties
		</div>
	);
});

export default Properties;
