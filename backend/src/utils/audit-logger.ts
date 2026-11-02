/**
 * Audit Logger - Traçabilité des actions sensibles
 * Conforme aux bonnes pratiques de sécurité (OWASP A09:2021)
 */

import { logger } from './logger';
import { Request } from 'express';

export enum AuditAction {
  // Authentification
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  TOKEN_REFRESH = 'TOKEN_REFRESH',

  // Utilisateurs
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_ROLE_CHANGE = 'USER_ROLE_CHANGE',

  // Annonces
  ANNOUNCEMENT_CREATE = 'ANNOUNCEMENT_CREATE',
  ANNOUNCEMENT_UPDATE = 'ANNOUNCEMENT_UPDATE',
  ANNOUNCEMENT_DELETE = 'ANNOUNCEMENT_DELETE',
  ANNOUNCEMENT_PUBLISH = 'ANNOUNCEMENT_PUBLISH',
  ANNOUNCEMENT_ARCHIVE = 'ANNOUNCEMENT_ARCHIVE',

  // Achats
  PURCHASE_CREATE = 'PURCHASE_CREATE',
  PURCHASE_CONFIRM = 'PURCHASE_CONFIRM',
  PURCHASE_CANCEL = 'PURCHASE_CANCEL',
  PURCHASE_REFUND = 'PURCHASE_REFUND',
  PURCHASE_DELIVERY_UPDATE = 'PURCHASE_DELIVERY_UPDATE',

  // Paiements
  PAYMENT_INITIATE = 'PAYMENT_INITIATE',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILURE = 'PAYMENT_FAILURE',

  // Sécurité
  FRAUD_DETECTED = 'FRAUD_DETECTED',
  MODERATION_REJECT = 'MODERATION_REJECT',
  ACCESS_DENIED = 'ACCESS_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Administration
  ADMIN_ACTION = 'ADMIN_ACTION',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_DELETE = 'DATA_DELETE',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export interface AuditLogEntry {
  action: AuditAction;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

/**
 * Enregistre une action dans les logs d'audit
 */
export function logAudit(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const auditEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
  };

  // Log avec niveau approprié selon la sévérité
  const logLevel = entry.severity === AuditSeverity.CRITICAL ? 'error' :
                   entry.severity === AuditSeverity.WARNING ? 'warn' : 'info';

  logger[logLevel]('AUDIT', {
    ...auditEntry,
    // Marquer explicitement comme audit log pour faciliter le filtrage
    auditLog: true,
  });

  // En production, on pourrait aussi :
  // - Envoyer vers un SIEM (Splunk, ELK, Datadog)
  // - Stocker dans une table dédiée (audit_logs)
  // - Envoyer des alertes pour actions critiques
}

/**
 * Helper pour logger une action réussie
 */
export function logAuditSuccess(
  action: AuditAction,
  userId: string,
  options?: {
    userEmail?: string;
    userRole?: string;
    resourceType?: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    severity?: AuditSeverity;
  }
): void {
  logAudit({
    action,
    severity: options?.severity || AuditSeverity.INFO,
    userId,
    userEmail: options?.userEmail,
    userRole: options?.userRole,
    resourceType: options?.resourceType,
    resourceId: options?.resourceId,
    details: options?.details,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    success: true,
  });
}

/**
 * Helper pour logger une action échouée
 */
export function logAuditFailure(
  action: AuditAction,
  errorMessage: string,
  options?: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    resourceType?: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    severity?: AuditSeverity;
  }
): void {
  logAudit({
    action,
    severity: options?.severity || AuditSeverity.WARNING,
    userId: options?.userId,
    userEmail: options?.userEmail,
    userRole: options?.userRole,
    resourceType: options?.resourceType,
    resourceId: options?.resourceId,
    details: options?.details,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    success: false,
    errorMessage,
  });
}

/**
 * Helper pour logger une détection de fraude
 */
export function logFraudDetection(
  userId: string,
  resourceType: string,
  resourceId: string,
  reasons: string[],
  riskScore: number,
  action: 'ALLOW' | 'REVIEW' | 'BLOCK'
): void {
  logAudit({
    action: AuditAction.FRAUD_DETECTED,
    severity: action === 'BLOCK' ? AuditSeverity.CRITICAL : AuditSeverity.WARNING,
    userId,
    resourceType,
    resourceId,
    details: {
      reasons,
      riskScore,
      fraudAction: action,
    },
    success: true,
  });
}

/**
 * Helper pour logger un rejet de modération
 */
export function logModerationReject(
  userId: string,
  resourceType: string,
  resourceId: string,
  reasons: string[],
  score: number
): void {
  logAudit({
    action: AuditAction.MODERATION_REJECT,
    severity: AuditSeverity.WARNING,
    userId,
    resourceType,
    resourceId,
    details: {
      reasons,
      moderationScore: score,
    },
    success: true,
  });
}

/**
 * Helper pour logger un accès refusé
 */
export function logAccessDenied(
  action: string,
  userId?: string,
  reason?: string,
  ipAddress?: string
): void {
  logAudit({
    action: AuditAction.ACCESS_DENIED,
    severity: AuditSeverity.WARNING,
    userId,
    details: {
      attemptedAction: action,
      reason,
    },
    ipAddress,
    success: false,
    errorMessage: reason || 'Access denied',
  });
}

/**
 * Middleware Express pour extraire les informations de contexte
 */
export function getAuditContext(req: Request): {
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userFromReq = (req as any).user;

  return {
    ipAddress: (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress,
    userAgent: req.headers?.['user-agent'],
    userId: userFromReq?.userId,
    userEmail: userFromReq?.email,
    userRole: userFromReq?.role,
  };
}
