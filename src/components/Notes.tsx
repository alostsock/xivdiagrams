import clsx from 'clsx';
import { observer } from 'mobx-react-lite';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Notes = observer(function Notes({ className, style }: Props) {
	return (
		<div className={clsx('Notes', className)} style={style}>
			Notes
		</div>
	);
});

export default Notes;
