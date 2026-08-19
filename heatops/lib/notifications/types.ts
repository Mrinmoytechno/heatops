export type NotificationType =
  | "critical_action_required"
  | "operating_plan_ready"
  | "forecast_changed"
  | "risk_changed"
  | "simulation_insight";

export type NotificationSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info";

export type NotificationStatus =
  | "unread"
  | "read"
  | "dismissed";

export type NotificationAction = {
  label: string;
  href: string;
};

export type HeatOpsNotification = {
  id: string;

  siteId: string;

  type: NotificationType;

  severity: NotificationSeverity;

  title: string;

  message: string;

  status: NotificationStatus;

  relatedOperationId?: string;

  relatedSimulationId?: string;

  action?: NotificationAction;

  createdAt: string;

  readAt?: string;

  dismissedAt?: string;
};

export type OperatingPlanNotificationInput = {
  siteId: string;

  actionsRequired: number;

  recommendations: number;

  monitoringItems: number;

  title: string;
};

export type RiskChangeNotificationInput = {
  siteId: string;

  operationId?: string;

  operationName?: string;

  previousRisk: number;

  currentRisk: number;
};

export type SimulationNotificationInput = {
  siteId: string;

  simulationId: string;

  name: string;

  riskBefore: number;

  riskAfter: number;

  modeledImpact?: number | null;
};

export type NotificationGenerationResult = {
  notifications: HeatOpsNotification[];

  totalGenerated: number;

  criticalCount: number;

  highCount: number;

  mediumCount: number;

  lowCount: number;

  infoCount: number;
};
