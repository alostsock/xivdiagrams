import React from 'react';
import clsx from 'clsx';
import './Preferences.scss';
import { observer } from 'mobx-react-lite';
import { diagram } from 'renderer/diagram';

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const Preferences = observer(function ({ className, style }: Props) {
	return (
		<div className={clsx('Preferences', className)} style={style}>
			<label>
				<input
					type="checkbox"
					checked={diagram.drawPrecisely}
					onChange={() => diagram.toggleDrawingPrecision()}
				/>
				Draw with precision
			</label>
		</div>
	);
});

export default Preferences;
