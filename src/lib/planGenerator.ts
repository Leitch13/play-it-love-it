export type Level = "beginner" | "intermediate" | "advanced";
export type Position = "goalkeeper" | "defender" | "midfielder" | "forward";
export type GoalType =
  | "ball mastery"
  | "speed"
  | "finishing"
  | "confidence"
  | "match fitness";

export type PlanInput = {
  playerName: string;
  age: number;
  position: Position;
  level: Level;
  availableDays: number;
  trainingGoal: GoalType;
  notes: string;
};

export type SessionBlock = {
  day: string;
  focus: string;
  duration: string;
  drills: string[];
  recovery: string;
};

export type TrainingPlan = {
  title: string;
  weeklyFocus: string;
  sessions: SessionBlock[];
  coachNote: string;
};

const focusMap: Record<GoalType, string> = {
  "ball mastery":
    "Improve comfort on the ball through repetition, rhythm, and clean touches.",
  speed:
    "Develop explosive movement, first-step quickness, and sharper change of direction.",
  finishing:
    "Create more composed, repeatable end-product actions in and around goal.",
  confidence:
    "Build visible progress through small wins, consistency, and clear weekly targets.",
  "match fitness":
    "Increase repeated effort capacity and game-ready physical sharpness.",
};

const positionDrills: Record<Position, string[]> = {
  goalkeeper: [
    "set position footwork",
    "handling repetitions",
    "low dive technique",
    "distribution patterns",
  ],
  defender: [
    "defensive body shape",
    "1v1 duels",
    "clearance technique",
    "passing under pressure",
  ],
  midfielder: [
    "scan before receiving",
    "turn out of pressure",
    "passing tempo",
    "third-man movement",
  ],
  forward: [
    "near-post finishing",
    "double movements",
    "first-touch shots",
    "receiving to attack",
  ],
};

const levelIntensity: Record<Level, string> = {
  beginner: "Keep it simple and confidence-building with high repetition.",
  intermediate: "Blend technical quality with decision-making and tempo.",
  advanced: "Push quality under pressure with sharper speed and constraints.",
};

const goalDrills: Record<GoalType, string[]> = {
  "ball mastery": ["toe taps", "inside-out touches", "drag-push combinations"],
  speed: ["acceleration starts", "5-10-5 turns", "reaction sprints"],
  finishing: ["one-touch finishes", "shoot across goal", "receive-and-finish combos"],
  confidence: ["success streak challenge", "personal best round", "technique scoreboard"],
  "match fitness": [
    "work-rest intervals",
    "repeated sprint sets",
    "conditioning ball circuits",
  ],
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function buildPlan(input: PlanInput): TrainingPlan {
  const sessionCount = Math.max(2, Math.min(input.availableDays, 5));
  const coreDrills = positionDrills[input.position];
  const specificDrills = goalDrills[input.trainingGoal];

  const sessions: SessionBlock[] = Array.from({ length: sessionCount }).map((_, i) => ({
    day: DAY_NAMES[i],
    focus: `${input.trainingGoal} + ${input.position} development`,
    duration:
      input.age < 11 ? "25–35 min" : input.age < 15 ? "35–45 min" : "45–60 min",
    drills: [
      specificDrills[0],
      specificDrills[1],
      coreDrills[i % coreDrills.length],
      coreDrills[(i + 1) % coreDrills.length],
    ],
    recovery:
      i === sessionCount - 1
        ? "Mobility, light ball work, and reflection notes."
        : "Light stretching and hydration after training.",
  }));

  return {
    title: `${input.playerName || "Player"} Weekly Development Plan`,
    weeklyFocus: focusMap[input.trainingGoal],
    sessions,
    coachNote: `${levelIntensity[input.level]} Main aim this week: ${focusMap[input.trainingGoal].toLowerCase()}`,
  };
}
