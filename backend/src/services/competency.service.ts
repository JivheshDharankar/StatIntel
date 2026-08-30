export interface CompetencyScoreCalculation {
  previousScore: number;
  quizScorePercent: number; // 0 - 100
  weight: number;           // impact weight, default 0.25
  newEstimatedScore: number;
  targetScore: number;
  oldGap: number;
  newGap: number;
  gapClosedPercentage: number;
  evidenceExplanation: string;
}

export class CompetencyScoringService {
  /**
   * Transparent Bayesian/Exponential Moving Average update model for competency evidence.
   * 
   * FORMULA:
   * new_score = previous_score * (1 - weight) + quiz_percentage * weight
   * old_gap = max(target_score - previous_score, 0)
   * new_gap = max(target_score - new_score, 0)
   * gap_closed_percentage = old_gap > 0 ? ((old_gap - new_gap) / old_gap) * 100 : 0
   * 
   * All values are conservatively bounded between 0 and 100 with 2 decimal precision.
   */
  static calculateUpdatedCompetency(
    previousScore: number,
    quizScore: number,
    totalQuestions: number,
    targetScore: number = 80,
    impactWeight: number = 0.25
  ): CompetencyScoreCalculation {
    const rawQuizPercent = totalQuestions > 0 ? (quizScore / totalQuestions) * 100 : 0;
    const quizScorePercent = Math.round(rawQuizPercent * 100) / 100;
    
    // Conservative weighted combination
    const rawNewScore = previousScore * (1 - impactWeight) + quizScorePercent * impactWeight;
    const newEstimatedScore = Math.round(Math.min(100, Math.max(0, rawNewScore)) * 100) / 100;
    
    const oldGap = Math.round(Math.max(0, targetScore - previousScore) * 100) / 100;
    const newGap = Math.round(Math.max(0, targetScore - newEstimatedScore) * 100) / 100;
    
    const rawGapClosed = oldGap > 0 ? ((oldGap - newGap) / oldGap) * 100 : 0;
    const gapClosedPercentage = Math.round(Math.min(100, Math.max(0, rawGapClosed)) * 100) / 100;

    const delta = Math.round((newEstimatedScore - previousScore) * 100) / 100;
    const sign = delta >= 0 ? '+' : '';
    const evidenceExplanation = `Quiz performance (${quizScore}/${totalQuestions} = ${quizScorePercent}%) updated estimated competency by ${sign}${delta} points (Weight: ${Math.round(impactWeight * 100)}%). Estimated gap closed: ${gapClosedPercentage}%.`;

    return {
      previousScore,
      quizScorePercent,
      weight: impactWeight,
      newEstimatedScore,
      targetScore,
      oldGap,
      newGap,
      gapClosedPercentage,
      evidenceExplanation
    };
  }
}
