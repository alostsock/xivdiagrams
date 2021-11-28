import React, { useState } from 'react';
import clsx from 'clsx';
import './StepDetails.scss';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { plan } from 'renderer/plan';
import { diagram } from 'renderer/diagram';
import { encounters } from 'data/encounters';
import { LeftSvg, RightSvg, PlusSvg, CrossSvg, SettingsSvg } from 'data/icons';
import {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
} from '@reach/accordion';
import { Dialog } from '@reach/dialog';
import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from '@reach/disclosure';
import { Slider } from '@reach/slider';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';
import Reveal from 'components/Reveal';

const MAX_STEPS = 35;

interface Props {
	className?: string;
	style?: React.CSSProperties;
}

const StepDetails = observer(function StepDetails({ className, style }: Props) {
	const leftEnabled = plan.currentStepIndex !== 0;
	const rightEnabled = plan.currentStepIndex < plan.steps.length - 1;

	const step = (d: -1 | 1) => {
		plan.saveStep();
		plan.loadStep(plan.currentStepIndex + d);
	};

	return (
		<div className={clsx('StepDetails', className)} style={style}>
			{!plan.editable ? <EncounterDisplay /> : <EncounterEditable />}

			<div className="info">
				<div className="leftright">
					<button
						title="Previous step"
						className="icon"
						disabled={!leftEnabled}
						onClick={() => leftEnabled && step(-1)}
					>
						<LeftSvg />
					</button>
					<button
						title="Next step"
						className="icon"
						disabled={!rightEnabled}
						onClick={() => rightEnabled && step(1)}
					>
						<RightSvg />
					</button>
				</div>

				{!plan.editable ? <CurrentStepDisplay /> : <CurrentStepEditable />}
			</div>
		</div>
	);
});

export default StepDetails;

const EncounterDisplay = observer(function EncounterDisplay() {
	return !plan.currentStep.encounterName ? null : (
		<h3 className="encounter">{plan.currentStep.encounterName}</h3>
	);
});

const EncounterEditable = observer(function EncounterEditable() {
	const [isOpen, setIsOpen] = useState(false);
	const open = () => setIsOpen(true);
	const close = () => setIsOpen(false);

	return (
		<div className="encounter">
			<h3>
				{plan.currentStep.encounterName
					? plan.currentStep.encounterName
					: 'No encounter selected'}
			</h3>

			<button onClick={open} className="change">
				Change
			</button>

			<Dialog
				className="encounterdialog"
				aria-label="encounters"
				isOpen={isOpen}
				onDismiss={close}
			>
				<button className="icon close" onClick={close}>
					<CrossSvg />
				</button>

				<Tabs>
					<TabList>
						<Tab>
							<h1>Raids</h1>
						</Tab>
						<Tab>
							<h1>Ultimates</h1>
						</Tab>
					</TabList>

					<TabPanels>
						<TabPanel>
							<Raids onSelect={close} />
						</TabPanel>

						<TabPanel>
							{/* ultimates */}
							Coming soon...
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Dialog>

			<Disclosure>
				<DisclosureButton className="icon settings">
					<SettingsSvg />
				</DisclosureButton>

				<DisclosurePanel className="panel">
					<label>
						Opacity
						<Slider
							className="slider"
							min={0.25}
							max={1}
							step={0.05}
							value={diagram.arenaOpacity}
							onChange={action((opacity) => {
								diagram.arenaOpacity = opacity;
								diagram.render();
								plan.dirty = true;
							})}
						/>
					</label>
				</DisclosurePanel>
			</Disclosure>
		</div>
	);
});

const Raids = ({ onSelect }: { onSelect: () => void }) => (
	<Accordion>
		{encounters.tiers.map((tier) => (
			<AccordionItem key={tier.tierName}>
				<h2>
					<AccordionButton>{tier.tierName}</AccordionButton>
				</h2>
				<AccordionPanel>
					{tier.floors.map((floor) => (
						<React.Fragment key={floor.floorName}>
							<h3>{floor.floorName}</h3>
							<div className="arenas">
								{floor.arenas.map((arenaUrl, i) => (
									<Reveal
										className="arena"
										key={i}
										title={`${floor.encounterName} Arena ${i + 1}`}
										alt={`${floor.encounterName} Arena ${i + 1}`}
										src={arenaUrl}
										onClick={action(() => {
											plan.setArena(floor.encounterName, arenaUrl);
											onSelect();
										})}
									/>
								))}
							</div>
						</React.Fragment>
					))}
				</AccordionPanel>
			</AccordionItem>
		))}
	</Accordion>
);

const CurrentStepDisplay = observer(function StepInfo() {
	return (
		<div className="currentstep">
			<h3>
				Step {plan.currentStepIndex + 1} / {plan.steps.length}
			</h3>
			{plan.currentStep.subtitle && <h4>{plan.currentStep.subtitle}</h4>}
		</div>
	);
});

const CurrentStepEditable = observer(function StepInfo() {
	const addEnabled = plan.steps.length < MAX_STEPS;
	const removeEnabled = plan.steps.length > 1;

	return (
		<div className="currentstep">
			<h3>
				Step {plan.currentStepIndex + 1} / {plan.steps.length}
			</h3>

			<button
				title="Add a step"
				className="icon"
				disabled={!addEnabled}
				onClick={() => addEnabled && plan.addStep()}
			>
				<PlusSvg />
			</button>
			<button
				title="Delete this step"
				className="icon"
				disabled={!removeEnabled}
				onClick={() => removeEnabled && plan.removeStep()}
			>
				<CrossSvg />
			</button>

			<h4>
				<input
					spellCheck={false}
					placeholder="Add a subtitle..."
					value={plan.currentStep.subtitle ?? ''}
					onChange={action((e) => {
						plan.currentStep.subtitle = e.target.value.slice(0, 50);
						plan.dirty = true;
					})}
				/>
			</h4>
		</div>
	);
});
