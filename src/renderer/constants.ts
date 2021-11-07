import type { Options as RoughOptions } from 'roughjs/bin/core';
import type { StrokeOptions } from 'perfect-freehand';

export const BASE_CANVAS_SIZE = 540;

export const DEFAULT_ROUGH_OPTIONS: RoughOptions = {
	roughness: 1,
	curveFitting: 0.98,
	strokeWidth: 1,
	stroke: '#1a1f26',
};

// entities

export const HIT_TEST_TOLERANCE = 10;
export const BOUNDS_STYLE = '#4ba3f1';
export const ARROWHEAD_LEN = 16;
export const ARROWHEAD_ANGLE = Math.PI / 8;
// limit # of decimal points, mainly for json serialization
export const FREEHAND_POINT_PRECISION = 5;
export const FREEHAND_OPTIONS: StrokeOptions = {
	size: 3,
	simulatePressure: true,
	smoothing: 0.7,
};

// entities will be auto-deleted if under a certain size
export const MIN_RADIUS = 6;
export const MIN_DIMENSION = 10;
export const MIN_LINE_LEN = 10;
export const MIN_ARROW_LEN = 16;
export const MIN_MARK_SIZE = 16;

// controls

export const CONTROL_RADIUS = 8;
export const CONTROL_OFFSET = 24;
export const CONTROL_STROKE_STYLE = '#1885e7';
export const CONTROL_LINE_WIDTH = 2.5;
export const CONTROL_FILL_STYLE = '#fff';
