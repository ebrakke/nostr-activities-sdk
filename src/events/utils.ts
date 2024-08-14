import { ActivityType } from "./activity";
/**
 * Attempts to map a string to an activity type.
 */
export function parseActivityType(potentialType: string): ActivityType {
  const lower = potentialType.toLowerCase().split(" ").join("-");
  switch (lower) {
    case "run":
    case "running":
      return "run";
    case "trail-run":
    case "trail-running":
      return "trail-run";
    case "hike":
    case "hiking":
      return "hike";
    case "ride":
    case "riding":
    case "cycle":
    case "cycling":
      return "ride";
    case "swim":
    case "swimming":
      return "swim";
    case "walk":
    case "walking":
      return "walk";
    case "mountain-bike-ride":
    case "mountain-biking":
      return "mountain-bike-ride";
    case "ski":
    case "alpine-ski":
    case "downhill-ski":
      return "alpine-ski";
    case "backcountry-ski":
    case "backcountry-skiing":
      return "backcountry-ski";
    case "sup":
    case "stand-up-paddling":
    case "stand-up-paddle-boarding":
      return "stand-up-paddling";
    // TODO: Add more mappings
    default:
      const exactMap = Object.keys(activityTypeDisplay).find(
        (k) => k === lower,
      );
      if (exactMap) {
        return exactMap as ActivityType;
      }
      console.warn(`Unknown activity type: ${potentialType}`);
      return lower as ActivityType;
  }
}

export const activityTypeDisplay: Record<ActivityType, string> = {
  run: "Run",
  walk: "Walk",
  "mountain-bike-ride": "Mountain Bike",
  "trail-run": "Trail Run",
  hike: "Hike",
  ride: "Ride",
  swim: "Swim",
  "alpine-ski": "Alpine Ski",
  badminton: "Badminton",
  "backcountry-ski": "Backcountry Ski",
  canoeing: "Canoeing",
  crossfit: "Crossfit",
  elliptical: "Elliptical",
  golf: "Golf",
  "gravel-ride": "Gravel Ride",
  yoga: "Yoga",
  skateboard: "Skateboard",
  "e-bike-ride": "E-Bike Ride",
  "e-mountain-bike-ride": "E-Mountain Bike Ride",
  "ice-skate": "Ice Skate",
  "inline-skate": "Inline Skate",
  handcycle: "Handcycle",
  hiit: "HIIT",
  kayaking: "Kayaking",
  "nordic-ski": "Nordic Ski",
  kitesurf: "Kitesurf",
  "stand-up-paddling": "Stand Up Paddling",
  pickleball: "Pickleball",
  pilates: "Pilates",
  racquetball: "Racquetball",
  "rock-climbing": "Rock Climbing",
  "roller-ski": "Roller Ski",
  rowing: "Rowing",
  sail: "Sail",
  snowboard: "Snowboard",
  snowshoe: "Snowshoe",
  soccer: "Soccer",
  squash: "Squash",
  "stair-stepper": "Stair Stepper",
  surfing: "Surfing",
  "table-tennis": "Table Tennis",
  tennis: "Tennis",
  velomobile: "Velomobile",
  "weight-training": "Weight Training",
  windsurf: "Windsurf",
  wheelchair: "Wheelchair",
  workout: "Workout",
};
