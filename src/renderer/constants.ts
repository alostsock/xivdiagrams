import type { Options as RoughOptions } from 'roughjs/bin/core';

export const BASE_CANVAS_SIZE = 540;

export const DEFAULT_ROUGH_OPTIONS: RoughOptions = {
	roughness: 1,
	curveFitting: 0.97,
	strokeWidth: 1,
};

// entities

export const HIT_TEST_TOLERANCE = 10;
// bounds should be >= hit test tolerance,
// or else a hit on a shape's edge will be rejected early
export const BOUNDS_MARGIN = 10;

// controls

export const CONTROL_RADIUS = 9;
export const CONTROL_OFFSET = 24;
export const CONTROL_STROKE_STYLE = '#1971c2';
export const CONTROL_LINE_WIDTH = 3;
export const CONTROL_FILL_STYLE = '#fefefe';
