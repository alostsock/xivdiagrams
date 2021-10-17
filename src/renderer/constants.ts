import type { Options as RoughOptions } from 'roughjs/bin/core';

export const BASE_CANVAS_SIZE = 540;

export const ROUGH_OPTIONS: RoughOptions = {
	roughness: 1,
	curveFitting: 0.97,
	strokeWidth: 1,
};

// entities

export const HIT_TEST_TOLERANCE = 10;
// margin should be greater than or equal to hit test tolerance,
// or else a hit on a shape's edge will be rejected early
export const BOUNDS_MARGIN = 10;

// controls

export const CONTROL_RADIUS = 6;
export const CONTROL_OFFSET = 24;
