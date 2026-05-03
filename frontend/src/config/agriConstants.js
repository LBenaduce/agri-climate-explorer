export const BASE_RISK_SCORE = 18;
export const MAX_HUMIDITY_SCORE = 100;
export const MAX_RAINFALL_SCORE = 40;
export const MAX_WIND_SCORE = 50;
export const HUMIDITY_WEIGHT = 0.22;
export const RAINFALL_WEIGHT = 1.3;
export const WIND_WEIGHT = 0.7;
export const EXTREME_TEMPERATURE_LOW = 10;
export const EXTREME_TEMPERATURE_HIGH = 34;
export const EXTREME_TEMPERATURE_PENALTY = 12;
export const HIGH_HUMIDITY_THRESHOLD = 80;
export const HIGH_RAINFALL_THRESHOLD = 10;
export const HIGH_HUMIDITY_RAIN_PENALTY = 10;
export const HIGH_WIND_THRESHOLD = 25;
export const HIGH_WIND_PENALTY = 8;
export const MAX_RISK_SCORE = 100;
export const MEDIUM_RISK_THRESHOLD = 40;
export const HIGH_RISK_THRESHOLD = 67;

export const EMPTY_RECOMMENDATIONS = {
  planting: "-",
  irrigation: "-",
  disease: "-",
  spraying: "-",
};

export const PLANTING_RAIN_THRESHOLD = 18;
export const IDEAL_TEMPERATURE_MIN = 18;
export const IDEAL_TEMPERATURE_MAX = 30;
export const IRRIGATION_RAIN_THRESHOLD = 10;
export const LOW_HUMIDITY_THRESHOLD = 55;
export const SPRAYING_WIND_THRESHOLD = 22;
export const TREND_BASE_TEMPERATURE = 24;
export const TREND_BASE_RAINFALL = 6;
export const MIN_TREND_TEMPERATURE = 8;

export const TREND_DATA_OFFSETS = [
  { day: "Mon", tempOffset: -2, rainOffset: -2 },
  { day: "Tue", tempOffset: -1, rainOffset: -1 },
  { day: "Wed", tempOffset: 0, rainOffset: 0 },
  { day: "Thu", tempOffset: 1, rainOffset: 2 },
  { day: "Fri", tempOffset: 2, rainOffset: 1 },
];
