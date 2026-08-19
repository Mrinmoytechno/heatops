import type {
  ImpactAssessment,
} from "@/types/impact";

import type {
  RiskAssessment,
} from "@/types/risk";

import type {
  ThermalForecast,
  ThermalObservation,
} from "@/types/thermal";

import type {
  CandidateDecision,
  DecisionActionType,
  DecisionRecommendation,
  RecommendationPriority,
} from "@/types/decision";

type DecisionEngineInput = {
  impact: ImpactAssessment;

  risk: RiskAssessment;

  operation: {
    scheduledStart: string;

    scheduledEnd: string;

    operationalPriority?: number | null;

    workforceCount?: number;
  };

  thermalForecast?: ThermalForecast | null;

  constraints?: {
    allowEarlierMove?: boolean;

    allowLaterMove?: boolean;

    allowSplit?: boolean;

    allowPrioritization?: boolean;

    earliestStart?: string | null;

    latestEnd?: string | null;
  };
};

type ThermalWindow = {
  startTime: string;

  endTime: string;

  averageTemperatureC: number;

  thermalScore: number;

  observationCount: number;
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 100
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

function round(
  value: number,
  decimals = 1
): number {
  const factor = 10 ** decimals;

  return (
    Math.round(value * factor) /
    factor
  );
}

function getPriority(
  riskLevel: RiskAssessment["level"]
): RecommendationPriority {
  switch (riskLevel) {
    case "critical":
      return "critical";

    case "high":
      return "high";

    case "moderate":
      return "medium";

    case "low":
      return "low";
  }
}

function timeToMinutes(
  value: string
): number {
  const [
    hours,
    minutes,
  ] = value
    .split(":")
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
}

function minutesToTime(
  value: number
): string {
  const normalized =
    ((value % 1440) + 1440) %
    1440;

  const hours =
    Math.floor(
      normalized / 60
    );

  const minutes =
    normalized % 60;

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

function getObservationTime(
  observation: ThermalObservation
): string {
  const date =
    new Date(
      observation.timestamp
    );

  return `${String(
    date.getHours()
  ).padStart(
    2,
    "0"
  )}:${String(
    date.getMinutes()
  ).padStart(
    2,
    "0"
  )}`;
}

function getObservationMinutes(
  observation: ThermalObservation
): number {
  return timeToMinutes(
    getObservationTime(
      observation
    )
  );
}

function getTemperatureF(
  temperatureC: number
): number {
  return (
    temperatureC * 9 / 5 +
    32
  );
}

function getThermalScore(
  temperatureC: number
): number {
  const temperatureF =
    getTemperatureF(
      temperatureC
    );

  return clamp(
    (
      (temperatureF - 75) /
      35
    ) * 100
  );
}

function calculateOverallScore(
  riskScore: number,
  disruptionScore: number,
  modeledCost: number
): number {
  const normalizedCost =
    Math.min(
      modeledCost / 1000,
      100
    );

  return round(
    riskScore * 0.55 +
    disruptionScore * 0.3 +
    normalizedCost * 0.15
  );
}

function createCandidate(
  actionType: DecisionActionType,
  label: string,
  description: string,
  proposedStartTime: string | null,
  proposedEndTime: string | null,
  riskScore: number,
  disruptionScore: number,
  modeledCost: number,
  reasons: string[]
): CandidateDecision {
  return {
    actionType,

    label,

    description,

    proposedStartTime,

    proposedEndTime,

    tradeOff: {
      riskScore:
        round(
          clamp(riskScore)
        ),

      disruptionScore:
        round(
          clamp(
            disruptionScore
          )
        ),

      modeledCost:
        round(
          Math.max(
            modeledCost,
            0
          )
        ),

      overallScore:
        calculateOverallScore(
          clamp(riskScore),
          clamp(
            disruptionScore
          ),
          Math.max(
            modeledCost,
            0
          )
        ),
    },

    reasons,
  };
}

function calculateOperationDurationMinutes(
  scheduledStart: string,
  scheduledEnd: string
): number {
  const start =
    timeToMinutes(
      scheduledStart
    );

  const end =
    timeToMinutes(
      scheduledEnd
    );

  if (end >= start) {
    return end - start;
  }

  return (
    1440 -
    start +
    end
  );
}

function getObservationsForWindow(
  observations: ThermalObservation[],
  startMinutes: number,
  endMinutes: number
): ThermalObservation[] {
  return observations.filter(
    (
      observation
    ) => {
      const observationMinutes =
        getObservationMinutes(
          observation
        );

      if (
        startMinutes <=
        endMinutes
      ) {
        return (
          observationMinutes >=
            startMinutes &&
          observationMinutes <
            endMinutes
        );
      }

      return (
        observationMinutes >=
          startMinutes ||
        observationMinutes <
          endMinutes
      );
    }
  );
}

function calculateWindow(
  observations: ThermalObservation[],
  startMinutes: number,
  durationMinutes: number
): ThermalWindow | null {
  if (
    durationMinutes <= 0 ||
    durationMinutes > 1440
  ) {
    return null;
  }

  const endMinutes =
    (
      startMinutes +
      durationMinutes
    ) % 1440;

  const windowObservations =
    getObservationsForWindow(
      observations,
      startMinutes,
      endMinutes
    );

  if (
    windowObservations.length === 0
  ) {
    return null;
  }

  const totalTemperatureC =
    windowObservations.reduce(
      (
        total,
        observation
      ) =>
        total +
        observation.temperatureC,
      0
    );

  const averageTemperatureC =
    totalTemperatureC /
    windowObservations.length;

  const averageThermalScore =
    windowObservations.reduce(
      (
        total,
        observation
      ) =>
        total +
        getThermalScore(
          observation.temperatureC
        ),
      0
    ) /
    windowObservations.length;

  return {
    startTime:
      minutesToTime(
        startMinutes
      ),

    endTime:
      minutesToTime(
        endMinutes
      ),

    averageTemperatureC:
      round(
        averageTemperatureC
      ),

    thermalScore:
      round(
        averageThermalScore
      ),

    observationCount:
      windowObservations.length,
  };
}

function getCurrentThermalWindow(
  observations: ThermalObservation[],
  operationStart: string,
  durationMinutes: number
): ThermalWindow | null {
  return calculateWindow(
    observations,
    timeToMinutes(
      operationStart
    ),
    durationMinutes
  );
}

function isWithinConstraints(
  startMinutes: number,
  durationMinutes: number,
  earliestStart: string | null,
  latestEnd: string | null
): boolean {
  const endMinutes =
    startMinutes +
    durationMinutes;

  if (
    earliestStart &&
    startMinutes <
      timeToMinutes(
        earliestStart
      )
  ) {
    return false;
  }

  if (
    latestEnd &&
    endMinutes >
      timeToMinutes(
        latestEnd
      )
  ) {
    return false;
  }

  return true;
}

function findThermalCandidates(
  observations: ThermalObservation[],
  operationStart: string,
  durationMinutes: number,
  constraints: {
    allowEarlierMove: boolean;
    allowLaterMove: boolean;
    earliestStart: string | null;
    latestEnd: string | null;
  }
): ThermalWindow[] {
  if (
    observations.length === 0 ||
    durationMinutes <= 0
  ) {
    return [];
  }

  const currentStartMinutes =
    timeToMinutes(
      operationStart
    );

  const uniqueObservationMinutes =
    Array.from(
      new Set(
        observations.map(
          getObservationMinutes
        )
      )
    ).sort(
      (
        a,
        b
      ) => a - b
    );

  const candidates =
    uniqueObservationMinutes
      .filter(
        (
          startMinutes
        ) => {
          if (
            startMinutes <
            currentStartMinutes
          ) {
            return (
              constraints.allowEarlierMove
            );
          }

          if (
            startMinutes >
            currentStartMinutes
          ) {
            return (
              constraints.allowLaterMove
            );
          }

          return false;
        }
      )
      .filter(
        (
          startMinutes
        ) =>
          isWithinConstraints(
            startMinutes,
            durationMinutes,
            constraints.earliestStart,
            constraints.latestEnd
          )
      )
      .map(
        (
          startMinutes
        ) =>
          calculateWindow(
            observations,
            startMinutes,
            durationMinutes
          )
      )
      .filter(
        (
          window
        ): window is ThermalWindow =>
          window !== null
      )
      .sort(
        (
          a,
          b
        ) =>
          a.thermalScore -
          b.thermalScore
      );

  const uniqueCandidates =
    new Map<
      string,
      ThermalWindow
    >();

  for (
    const candidate
    of candidates
  ) {
    const key =
      `${candidate.startTime}-${candidate.endTime}`;

    if (
      !uniqueCandidates.has(
        key
      )
    ) {
      uniqueCandidates.set(
        key,
        candidate
      );
    }
  }

  return Array.from(
    uniqueCandidates.values()
  );
}

function calculateThermalRiskReduction(
  currentWindow: ThermalWindow,
  candidateWindow: ThermalWindow
): number {
  if (
    currentWindow.thermalScore <=
    0
  ) {
    return 0;
  }

  return clamp(
    (
      (
        currentWindow.thermalScore -
        candidateWindow.thermalScore
      ) /
      currentWindow.thermalScore
    ) *
      100
  );
}

export function calculateDecision(
  input: DecisionEngineInput
): DecisionRecommendation {
  const candidates:
    CandidateDecision[] =
    [];

  const {
    impact,
    risk,
    operation,
  } = input;

  const constraints = {
    allowEarlierMove:
      input.constraints
        ?.allowEarlierMove ??
      true,

    allowLaterMove:
      input.constraints
        ?.allowLaterMove ??
      true,

    allowSplit:
      input.constraints
        ?.allowSplit ??
      true,

    allowPrioritization:
      input.constraints
        ?.allowPrioritization ??
      true,

    earliestStart:
      input.constraints
        ?.earliestStart ??
      null,

    latestEnd:
      input.constraints
        ?.latestEnd ??
      null,
  };

  const baseModeledCost =
    impact.estimatedOperationalCost +
    impact.estimatedInventoryExposure;

  const currentPlan =
    createCandidate(
      "maintain",
      "Keep current schedule",
      "Maintain the operation without changing the current schedule.",
      operation.scheduledStart,
      operation.scheduledEnd,
      risk.score,
      0,
      baseModeledCost,
      [
        "The current schedule remains unchanged.",
        ...risk.reasons,
      ]
    );

  candidates.push(
    currentPlan
  );

  const durationMinutes =
    calculateOperationDurationMinutes(
      operation.scheduledStart,
      operation.scheduledEnd
    );

  const observations =
    input.thermalForecast
      ?.observations
      .slice()
      .sort(
        (
          a,
          b
        ) =>
          new Date(
            a.timestamp
          ).getTime() -
          new Date(
            b.timestamp
          ).getTime()
      ) ??
    [];

  const currentThermalWindow =
    getCurrentThermalWindow(
      observations,
      operation.scheduledStart,
      durationMinutes
    );

  const thermalCandidates =
    findThermalCandidates(
      observations,
      operation.scheduledStart,
      durationMinutes,
      {
        allowEarlierMove:
          constraints.allowEarlierMove,

        allowLaterMove:
          constraints.allowLaterMove,

        earliestStart:
          constraints.earliestStart,

        latestEnd:
          constraints.latestEnd,
      }
    );

  if (
    currentThermalWindow &&
    thermalCandidates.length > 0 &&
    risk.score >= 35
  ) {
    const lowerRiskWindows =
      thermalCandidates
        .filter(
          (
            candidate
          ) =>
            candidate.thermalScore <
            currentThermalWindow.thermalScore
        )
        .slice(
          0,
          2
        );

    for (
      const candidateWindow
      of lowerRiskWindows
    ) {
      const proposedStartMinutes =
        timeToMinutes(
          candidateWindow.startTime
        );

      const isEarlier =
        proposedStartMinutes <
        timeToMinutes(
          operation.scheduledStart
        );

      const actionType:
        DecisionActionType =
        isEarlier
          ? "move_earlier"
          : "move_later";

      const thermalRiskReduction =
        calculateThermalRiskReduction(
          currentThermalWindow,
          candidateWindow
        );

      const modeledRiskScore =
        clamp(
          risk.score *
            (
              1 -
              thermalRiskReduction /
                100
            )
        );

      const scheduleDistance =
        Math.abs(
          proposedStartMinutes -
            timeToMinutes(
              operation.scheduledStart
            )
        );

      const disruptionScore =
        clamp(
          15 +
            (
              scheduleDistance /
              60
            ) *
              10
        );

      const modeledCost =
        baseModeledCost *
        (
          1 -
          thermalRiskReduction /
            100
        );

      candidates.push(
        createCandidate(
          actionType,
          isEarlier
            ? "Move operation earlier"
            : "Move operation later",
          "Shift the operation into a lower-risk thermal window identified from normalized thermal forecast data.",
          candidateWindow.startTime,
          candidateWindow.endTime,
          modeledRiskScore,
          disruptionScore,
          modeledCost,
          [
            `The current schedule has an average thermal score of ${currentThermalWindow.thermalScore}.`,
            `The proposed window has an average thermal score of ${candidateWindow.thermalScore}.`,
            `The proposed window is based on available thermal observations from the selected provider.`,
            `Average temperature in the proposed window: ${getTemperatureF(candidateWindow.averageTemperatureC).toFixed(1)}°F.`,
          ]
        )
      );
    }
  }

  if (
    constraints.allowSplit &&
    risk.score >= 60
  ) {
    candidates.push(
      createCandidate(
        "split_operation",
        "Split operation",
        "Divide the operation into smaller blocks to reduce continuous exposure.",
        null,
        null,
        risk.score * 0.7,
        45,
        baseModeledCost *
          0.7,
        [
          "The operation has significant thermal exposure.",
          "Splitting the work can reduce continuous exposure while preserving operational progress.",
        ]
      )
    );
  }

  if (
    constraints.allowPrioritization &&
    risk.score >= 50
  ) {
    candidates.push(
      createCandidate(
        "prioritize",
        "Prioritize before peak conditions",
        "Complete the most temperature-sensitive or operationally important work before the highest-risk period.",
        null,
        null,
        risk.score * 0.6,
        25,
        baseModeledCost *
          0.6,
        [
          "The operation has meaningful operational or temperature sensitivity.",
          "Earlier prioritization can reduce exposure without requiring the entire schedule to move.",
        ]
      )
    );
  }

  if (
    risk.score >= 80
  ) {
    candidates.push(
      createCandidate(
        "reduce_exposure",
        "Reduce exposure",
        "Reduce the duration or workforce exposure of the operation during the highest-risk thermal period.",
        null,
        null,
        risk.score * 0.45,
        55,
        baseModeledCost *
          0.5,
        [
          "The current risk level is critical.",
          "The operation should not continue unchanged through the highest-risk period.",
        ]
      )
    );
  }

  const rankedCandidates =
    candidates
      .sort(
        (
          a,
          b
        ) =>
          a.tradeOff
            .overallScore -
          b.tradeOff
            .overallScore
      );

  const recommendedAction =
    rankedCandidates[0];

  const alternatives =
    rankedCandidates.slice(
      1
    );

  const assumptions = [
    "Risk scores are calculated from deterministic HeatOps logic.",
    "Operational cost and inventory exposure are modeled estimates, not measured financial losses.",
    "Schedule alternatives are generated from available normalized thermal forecast observations and validated against configured scheduling constraints.",
    "If no lower-risk thermal window is available, HeatOps does not invent a replacement time.",
  ];

  return {
    operationId:
      impact.operationId,

    zoneId:
      impact.zoneId,

    priority:
      getPriority(
        risk.level
      ),

    recommendedAction,

    alternatives,

    impact,

    risk,

    reasons: [
      ...recommendedAction
        .reasons,
      ...risk.reasons,
    ],

    assumptions,
  };
    }
