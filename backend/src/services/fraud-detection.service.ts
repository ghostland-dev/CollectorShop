/**
 * Service de détection de fraude v1
 * Règles basiques pour détecter les comportements suspects
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FraudDetectionResult {
  isFraudulent: boolean;
  riskScore: number; // 0-100, plus élevé = plus risqué
  reasons: string[];
  action: 'ALLOW' | 'REVIEW' | 'BLOCK';
}

interface PurchasePattern {
  purchaseCount: number;
  totalAmount: number;
  averageAmount: number;
  timeSinceFirstPurchase: number; // en heures
  purchasesInLastHour: number;
  purchasesInLastDay: number;
}

/**
 * Analyse le pattern d'achat d'un utilisateur
 */
async function analyzePurchasePattern(userId: string): Promise<PurchasePattern> {
  const purchases = await prisma.purchase.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: 'asc' },
  });

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const purchasesInLastHour = purchases.filter((p) => new Date(p.createdAt) >= oneHourAgo).length;
  const purchasesInLastDay = purchases.filter((p) => new Date(p.createdAt) >= oneDayAgo).length;

  const totalAmount = purchases.reduce((sum, p) => sum + p.amount, 0);
  const averageAmount = purchases.length > 0 ? totalAmount / purchases.length : 0;

  const firstPurchase = purchases[0];
  const timeSinceFirstPurchase = firstPurchase
    ? (now.getTime() - new Date(firstPurchase.createdAt).getTime()) / (1000 * 60 * 60)
    : 0;

  return {
    purchaseCount: purchases.length,
    totalAmount,
    averageAmount,
    timeSinceFirstPurchase,
    purchasesInLastHour,
    purchasesInLastDay,
  };
}

/**
 * Détecte les achats suspects basés sur le pattern
 */
function detectSuspiciousPurchasePattern(pattern: PurchasePattern): string[] {
  const reasons: string[] = [];

  // Trop d'achats en peu de temps
  if (pattern.purchasesInLastHour > 5) {
    reasons.push(`Trop d'achats dans la dernière heure (${pattern.purchasesInLastHour})`);
  }

  if (pattern.purchasesInLastDay > 20) {
    reasons.push(`Trop d'achats dans les dernières 24h (${pattern.purchasesInLastDay})`);
  }

  // Nouveau compte avec beaucoup d'achats
  if (pattern.purchaseCount > 10 && pattern.timeSinceFirstPurchase < 24) {
    reasons.push('Nouveau compte avec activité suspecte');
  }

  // Montants suspects
  if (pattern.averageAmount > 10000) {
    reasons.push(`Montant moyen très élevé (${pattern.averageAmount.toFixed(2)}€)`);
  }

  return reasons;
}

/**
 * Vérifie si l'utilisateur essaie d'acheter sa propre annonce
 */
async function checkSelfPurchase(buyerId: string, announcementId: string): Promise<boolean> {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    select: { sellerId: true },
  });

  return announcement?.sellerId === buyerId;
}

/**
 * Vérifie si l'utilisateur a déjà un achat en attente pour cette annonce
 */
async function checkDuplicatePurchase(buyerId: string, announcementId: string): Promise<boolean> {
  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      buyerId,
      announcementId,
      status: 'PENDING',
    },
  });

  return !!existingPurchase;
}

/**
 * Calcule le score de risque
 */
function calculateRiskScore(reasons: string[], pattern: PurchasePattern): number {
  let score = 0;

  // Score basé sur les raisons
  score += reasons.length * 15;

  // Score basé sur le pattern
  if (pattern.purchasesInLastHour > 3) {
    score += 20;
  }
  if (pattern.purchasesInLastDay > 15) {
    score += 25;
  }
  if (pattern.purchaseCount > 10 && pattern.timeSinceFirstPurchase < 24) {
    score += 30;
  }
  if (pattern.averageAmount > 10000) {
    score += 15;
  }

  return Math.min(100, score);
}

/**
 * Détermine l'action à prendre
 */
function determineAction(riskScore: number, hasBlockingReasons: boolean): 'ALLOW' | 'REVIEW' | 'BLOCK' {
  if (hasBlockingReasons) {
    return 'BLOCK';
  }
  if (riskScore >= 50) {
    return 'REVIEW';
  }
  return 'ALLOW';
}

/**
 * Détecte la fraude pour un achat
 */
export async function detectFraudForPurchase(
  buyerId: string,
  announcementId: string,
  amount: number
): Promise<FraudDetectionResult> {
  const reasons: string[] = [];
  let hasBlockingReasons = false;

  // Vérification : achat de sa propre annonce
  const isSelfPurchase = await checkSelfPurchase(buyerId, announcementId);
  if (isSelfPurchase) {
    reasons.push('Tentative d\'achat de sa propre annonce');
    hasBlockingReasons = true;
  }

  // Vérification : achat en double
  const isDuplicate = await checkDuplicatePurchase(buyerId, announcementId);
  if (isDuplicate) {
    reasons.push('Achat en double pour cette annonce');
    hasBlockingReasons = true;
  }

  // Analyse du pattern d'achat
  const pattern = await analyzePurchasePattern(buyerId);
  const suspiciousPatternReasons = detectSuspiciousPurchasePattern(pattern);
  reasons.push(...suspiciousPatternReasons);

  // Vérification du montant
  if (amount <= 0) {
    reasons.push('Montant invalide');
    hasBlockingReasons = true;
  }

  if (amount > 50000) {
    reasons.push(`Montant très élevé (${amount}€)`);
  }

  // Calcul du score de risque
  const riskScore = calculateRiskScore(reasons, pattern);

  // Détermination de l'action
  const action = determineAction(riskScore, hasBlockingReasons);

  return {
    isFraudulent: hasBlockingReasons || riskScore >= 70,
    riskScore,
    reasons,
    action,
  };
}

