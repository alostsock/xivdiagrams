import { useState } from 'react';
import clsx from 'clsx';
import { IconName, createSvgDataUrl } from 'icons';

const roles: IconName[] = ['tank', 'healer', 'dps'];
const tanks: IconName[] = ['pld', 'war', 'drk', 'gnb'];
const healers: IconName[] = ['whm', 'sch', 'ast', 'sge'];
const dps: IconName[] = [
	'mnk',
	'drg',
	'nin',
	'sam',
	'rpr',
	'brd',
	'mch',
	'dnc',
	'blm',
	'smn',
	'rdm',
	'blu',
];

const marks: Array<{ value: string; label: string; icons: IconName[] }> = [
	{
		value: 'players',
		label: 'Players',
		icons: [...roles, ...tanks, ...healers, ...dps],
	},
	{
		value: 'enemies',
		label: 'Enemies',
		icons: ['mob'],
	},
];

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Marks = ({ className, style }: Props) => {
	const [markType, setMarkType] = useState<string | null>(null);

	return (
		<div className={clsx('Marks', className)} style={style}>
			<div className="categories">
				{marks.map((mark) => (
					<button
						key={mark.value}
						className={clsx({ selected: markType === mark.value })}
						onClick={() => {
							if (markType === mark.value) {
								setMarkType(null);
							} else {
								setMarkType(mark.value);
							}
						}}
					>
						{mark.label}
					</button>
				))}
			</div>
		</div>
	);
};

export default Marks;

function Category() {}
