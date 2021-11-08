import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'wouter';
import clsx from 'clsx';
import { plan } from 'renderer/plan';
import { usePlanContext } from 'data/PlanContext';
import { createPlan, editPlan } from 'data/api';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Heading = observer(function Heading({ className, style }: Props) {
	return (
		<header className={clsx('Heading', className)} style={style}>
			{plan.editable ? <HeadingEditable /> : <HeadingDisplay />}
		</header>
	);
});

export default Heading;

const HeadingEditable = observer(function HeadingEditable() {
	return (
		<>
			<h1>
				<input
					className="title"
					spellCheck={false}
					value={plan.title}
					onChange={action((e) => (plan.title = e.target.value))}
				/>
			</h1>
			<h2>
				<span>by </span>
				<input
					className="author"
					spellCheck={false}
					value={plan.author}
					onChange={action((e) => (plan.author = e.target.value))}
				/>
			</h2>
			<ButtonList />
		</>
	);
});

const HeadingDisplay = observer(function HeadingDisplay() {
	return (
		<>
			<h1>{plan.title}</h1>
			<h2>by {plan.author}</h2>
			<ButtonList />
		</>
	);
});

const ButtonList = observer(function ButtonList() {
	const { planId, editKey } = usePlanContext();
	const [, setLocation] = useLocation();

	const handleSave = async () => {
		if (planId && editKey) {
			try {
				await editPlan(planId, editKey, plan.toJSON());
			} catch (err) {
				setLocation(`/${planId}`);
				console.error(err);
			}
		} else {
			try {
				const { id: planId, editKey } = await createPlan(plan.toJSON());
				setLocation(`/${planId}/${editKey}`);
			} catch (err) {
				console.error(err);
			}
		}
	};

	return (
		<div className="buttons">
			{plan.editable && <button onClick={handleSave}>Save</button>}
		</div>
	);
});
