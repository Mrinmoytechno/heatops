import {
  HeatOpsNotification,
  NotificationGenerationResult,
  OperatingPlanNotificationInput,
  RiskChangeNotificationInput,
  SimulationNotificationInput,
} from "./types";

function createNotificationId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function buildResult(
  notifications: HeatOpsNotification[],
): NotificationGenerationResult {
  return {
    notifications,

    totalGenerated: notifications.length,

    criticalCount: notifications.filter(
      (notification) =>
        notification.severity === "critical",
    ).length,

    highCount: notifications.filter(
      (notification) =>
        notification.severity === "high",
    ).length,

    mediumCount: notifications.filter(
      (notification) =>
        notification.severity === "medium",
    ).length,

    lowCount: notifications.filter(
      (notification) =>
        notification.severity === "low",
    ).length,

    infoCount: notifications.filter(
      (notification) =>
        notification.severity === "info",
    ).length,
  };
}

export function generateOperatingPlanNotifications(
  input: OperatingPlanNotificationInput,
): NotificationGenerationResult {
  const notifications: HeatOpsNotification[] = [];

  if (input.actionsRequired > 0) {
    notifications.push({
      id: createNotificationId(),

      siteId: input.siteId,

      type: "critical_action_required",

      severity:
        input.actionsRequired >= 3
          ? "critical"
          : "high",

      title:
        input.actionsRequired === 1
          ? "Operational action required"
          : `${input.actionsRequired} operational actions required`,

      message:
        input.actionsRequired === 1
          ? "HeatOps identified an operation that requires a change to the current operating plan."
          : `HeatOps identified ${input.actionsRequired} operations that require changes to the current operating plan.`,

      status: "unread",

      action: {
        label: "View operating plan",
        href: `/operating-plan?siteId=${input.siteId}`,
      },

      createdAt: now(),
    });
  }

  if (
    input.actionsRequired === 0 &&
    input.recommendations > 0
  ) {
    notifications.push({
      id: createNotificationId(),

      siteId: input.siteId,

      type: "operating_plan_ready",

      severity: "medium",

      title: "Operating plan updated",

      message: `HeatOps generated ${input.recommendations} operational recommendation${
        input.recommendations === 1 ? "" : "s"
      } for the latest thermal analysis.`,

      status: "unread",

      action: {
        label: "Review recommendations",
        href: `/operating-plan?siteId=${input.siteId}`,
      },

      createdAt: now(),
    });
  }

  if (
    input.actionsRequired === 0 &&
    input.recommendations === 0 &&
    input.monitoringItems > 0
  ) {
    notifications.push({
      id: createNotificationId(),

      siteId: input.siteId,

      type: "operating_plan_ready",

      severity: "info",

      title: "No immediate operating changes required",

      message:
        "HeatOps completed the latest analysis. Current operations can continue while monitored conditions remain within the current operating thresholds.",

      status: "unread",

      action: {
        label: "View analysis",
        href: `/operating-plan?siteId=${input.siteId}`,
      },

      createdAt: now(),
    });
  }

  return buildResult(notifications);
}

export function generateRiskChangeNotification(
  input: RiskChangeNotificationInput,
): NotificationGenerationResult {
  const notifications: HeatOpsNotification[] = [];

  const riskDifference =
    input.currentRisk - input.previousRisk;

  if (Math.abs(riskDifference) < 10) {
    return buildResult(notifications);
  }

  const riskIncreased = riskDifference > 0;

  const subject = input.operationName
    ? input.operationName
    : "An operation";

  if (riskIncreased) {
    notifications.push({
      id: createNotificationId(),

      siteId: input.siteId,

      type: "risk_changed",

      severity:
        input.currentRisk >= 80
          ? "critical"
          : input.currentRisk >= 60
            ? "high"
            : "medium",

      title: "Operational risk increased",

      message: `${subject} increased from ${Math.round(
        input.previousRisk,
      )}/100 to ${Math.round(
        input.currentRisk,
      )}/100 following the latest thermal analysis.`,

      status: "unread",

      relatedOperationId:
        input.operationId,

      action: {
        label: "Review operating plan",
        href: `/operating-plan?siteId=${input.siteId}`,
      },

      createdAt: now(),
    });
  } else {
    notifications.push({
      id: createNotificationId(),

      siteId: input.siteId,

      type: "risk_changed",

      severity: "info",

      title: "Operational risk decreased",

      message: `${subject} decreased from ${Math.round(
        input.previousRisk,
      )}/100 to ${Math.round(
        input.currentRisk,
      )}/100 following the latest thermal analysis.`,

      status: "unread",

      relatedOperationId:
        input.operationId,

      action: {
        label: "Review operating plan",
        href: `/operating-plan?siteId=${input.siteId}`,
      },

      createdAt: now(),
    });
  }

  return buildResult(notifications);
}

export function generateSimulationNotification(
  input: SimulationNotificationInput,
): NotificationGenerationResult {
  const notifications: HeatOpsNotification[] = [];

  const riskImprovement =
    input.riskBefore - input.riskAfter;

  if (riskImprovement < 5) {
    return buildResult(notifications);
  }

  notifications.push({
    id: createNotificationId(),

    siteId: input.siteId,

    type: "simulation_insight",

    severity:
      riskImprovement >= 20
        ? "high"
        : "medium",

    title: "A lower-risk operating scenario was identified",

    message: `"${input.name}" reduced modeled operational risk from ${Math.round(
      input.riskBefore,
    )}/100 to ${Math.round(
      input.riskAfter,
    )}/100.`,

    status: "unread",

    relatedSimulationId:
      input.simulationId,

    action: {
      label: "View simulation",
      href: `/simulations?siteId=${input.siteId}`,
    },

    createdAt: now(),
  });

  return buildResult(notifications);
}

export function combineNotificationResults(
  ...results: NotificationGenerationResult[]
): NotificationGenerationResult {
  const notifications = results.flatMap(
    (result) => result.notifications,
  );

  return buildResult(notifications);
      }
