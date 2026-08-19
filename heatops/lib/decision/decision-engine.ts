import type {
  ImpactAssessment,
} from "@/types/impact";

import type {
  RiskAssessment,
} from "@/types/risk";

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

  constraints?: {
    allowEarlierMove?: boolean;

    allowLaterMove?: boolean;

    allowSplit?: boolean;

    allowPrioritization?: boolean;

    earliestStart?: string | null;

    latestEnd?: string | null;
  };
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

  return Math.round(value * factor) / factor;
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

  return `${String(
    hours
  ).padStart(
    2,
    "0"
  )}:${String(
    minutes
  ).padStart(
    2,
    "0"
  )}`;
}

function shiftTime(
  time: string,
  minutes: number
): string {
  return minutesToTime(
    timeToMinutes(time) +
      minutes
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

export function calculateDecision(
  input: DecisionEngineInput
): DecisionRecommendation {
  const candidates: CandidateDecision[] =
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

  const currentPlan =
    createCandidate(
      "maintain",
      "Keep current schedule",
      "Maintain the operation without changing the current schedule.",
      operation.scheduledStart,
      operation.scheduledEnd,
      risk.score,
      0,
      impact.estimatedOperationalCost +
        impact.estimatedInventoryExposure,
      [
        "The current schedule remains unchanged.",
        ...risk.reasons,
      ]
    );

  candidates.push(
    currentPlan
  );

  const durationMinutes =
    Math.max(
      timeToMinutes(
        operation.scheduledEnd
      ) -
        timeToMinutes(
          operation.scheduledStart
        ),
      0
    );

  if (
    constraints.allowEarlierMove &&
    risk.score >= 35
  ) {
    const proposedStart =
      shiftTime(
        operation.scheduledStart,
        -120
      );

    const proposedEnd =
      minutesToTime(
        timeToMinutes(
          proposedStart
        ) +
          durationMinutes
      );

    const withinConstraint =
      !constraints.earliestStart ||
      timeToMinutes(
        proposedStart
      ) >=
        timeToMinutes(
          constraints.earliestStart
        );

    if (withinConstraint) {
      candidates.push(
        createCandidate(
          "move_earlier",
          "Move operation earlier",
          "Shift the operation into an earlier thermal window to reduce expected heat exposure.",
          proposedStart,
          proposedEnd,
          risk.score * 0.55,
          35,
          (
            impact.estimatedOperationalCost +
            impact.estimatedInventoryExposure
          ) *
            0.55,
          [
            "The current operation overlaps elevated thermal conditions.",
            "An earlier schedule may reduce the highest-risk exposure period.",
          ]
        )
      );
    }
  }

  if (
    constraints.allowLaterMove &&
    risk.score >= 35
  ) {
    const proposedStart =
      shiftTime(
        operation.scheduledStart,
        120
      );

    const proposedEnd =
      minutesToTime(
        timeToMinutes(
          proposedStart
        ) +
          durationMinutes
      );

    const withinConstraint =
      !constraints.latestEnd ||
      timeToMinutes(
        proposedEnd
      ) <=
        timeToMinutes(
          constraints.latestEnd
        );

    if (withinConstraint) {
      candidates.push(
        createCandidate(
          "move_later",
          "Move operation later",
          "Shift the operation away from the current high-exposure period.",
          proposedStart,
          proposedEnd,
          risk.score * 0.65,
          30,
          (
            impact.estimatedOperationalCost +
            impact.estimatedInventoryExposure
          ) *
            0.65,
          [
            "The operation can potentially be moved outside part of the affected window.",
            "The final recommendation should favor this option only when the thermal window is actually lower later.",
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
        (
          impact.estimatedOperationalCost +
          impact.estimatedInventoryExposure
        ) *
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
        (
          impact.estimatedOperationalCost +
          impact.estimatedInventoryExposure
        ) *
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
        (
          impact.estimatedOperationalCost +
          impact.estimatedInventoryExposure
        ) *
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
        (a, b) =>
          a.tradeOff
            .overallScore -
          b.tradeOff
            .overallScore
      );

  const recommendedAction =
    rankedCandidates[0];

  const alternatives =
    rankedCandidates
      .slice(1);

  const assumptions = [
    "Risk scores are calculated from deterministic HeatOps logic.",
    "Operational cost and inventory exposure are modeled estimates, not measured financial losses.",
    "Schedule alternatives are candidate actions and should be validated against site constraints.",
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
