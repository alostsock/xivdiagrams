import { useState, useEffect } from 'react';
import { action, runInAction, autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import { diagram } from 'renderer/diagram';
import {
	handlePointerMove,
	handlePointerDown,
	handlePointerUpLeave,
} from 'renderer/interactions';
import { Circle, Rect } from 'renderer/entities';
import styles from './App.module.scss';

autorun(() => {
	console.log('selected entity type', diagram.selectedEntityType);
});

autorun(() => {
	console.log('dragging', diagram.dragAnchor ? true : false);
});

const App = observer(function App() {
	const [diagramEl, setDiagramEl] = useState<HTMLCanvasElement | null>(null);
	const diagramRef = (element: HTMLCanvasElement) => setDiagramEl(element);

	useEffect(() => {
		if (!window || !diagramEl) return;

		runInAction(() => {
			diagram.attach(diagramEl);
		});

		if (diagram.ready) {
			runInAction(() => {
				diagram.entities.push(new Circle({ origin: [50, 50], radius: 50 }));
				diagram.entities.push(
					new Rect({
						origin: [50, 150],
						width: 50,
						height: 80,
						rotation: Math.PI / 4,
					})
				);
			});
			diagram.render();
		}
	}, [diagramEl]);

	return (
		<div className={styles.grid}>
			<header className={styles.heading}>heading</header>

			<section className={styles.diagram}>
				<div className={styles.controls}>
					<button onClick={() => diagram.selectEntityType('circle')}>
						Circle
					</button>
					<button onClick={() => diagram.selectEntityType('rect')}>Rect</button>
				</div>

				<canvas
					ref={diagramRef}
					style={{ cursor: diagram.cursorType }}
					onPointerMove={handlePointerMove}
					onPointerDown={handlePointerDown}
					onPointerUp={handlePointerUpLeave}
					onPointerLeave={handlePointerUpLeave}
				></canvas>
			</section>

			<section className={styles.properties}>properties</section>

			<section className={styles.notes}>notes</section>
		</div>
	);
});

export default App;
