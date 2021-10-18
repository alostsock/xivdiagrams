import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { plan } from 'renderer/plan';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Heading = observer(function Heading({ className, style }: Props) {
	return (
		<header className={clsx('Heading', className)} style={style}>
			<h1>{plan.title}</h1>
			<h2>by {plan.author}</h2>
		</header>
	);
});

export default Heading;
