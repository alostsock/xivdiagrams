import React from 'react';
import ReactDOM from 'react-dom';
import { configure as configureMobx } from 'mobx';
import reportWebVitals from 'data/reportWebVitals';

import PlanProvider from 'data/PlanProvider';
import App from 'components/App';

import './index.scss';
import '@fontsource/lato';
import '@fontsource/patrick-hand';

configureMobx({
	enforceActions: 'always',
	reactionRequiresObservable: true,
	computedRequiresReaction: true,
});

ReactDOM.render(
	<React.StrictMode>
		<PlanProvider>
			<App />
		</PlanProvider>
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
