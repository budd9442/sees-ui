// Calculation utility functions for SEES application

export interface GPAConfig {
  method: 'weighted' | 'cumulative' | 'custom';
  gradePoints: Record<string, number>;
  weights?: Record<string, number>;
  customFormula?: string;
}

export interface TiebreakerConfig {
  enabled: boolean;
  weights: {
    gpa: number;
    credits: number;
    attendance: number;
    extracurricular: number;
  };
}

export interface RankingEntry {
  studentId: string;
  name: string;
  gpa: number;
  credits: number;
  attendance?: number;
  extracurricular?: number;
  pathway?: string;
  specialization?: string;
}

// GPA Calculation Functions
export const gpaCalculations = {
  /**
   * Calculate weighted GPA
   */
  calculateWeightedGPA: (grades: { grade: string; credits: number; moduleType?: string }[], config: GPAConfig): number => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    grades.forEach(({ grade, credits, moduleType }) => {
      const points = config.gradePoints[grade.toUpperCase()];
      if (points !== undefined) {
        // Apply weights if module type is specified
        const weight = config.weights?.[moduleType || 'default'] || 1;
        totalPoints += points * credits * weight;
        totalCredits += credits;
      }
    });
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  },

  /**
   * Calculate cumulative GPA
   */
  calculateCumulativeGPA: (grades: { grade: string; credits: number }[]): number => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    const gradePoints: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0,
    };
    
    grades.forEach(({ grade, credits }) => {
      const points = gradePoints[grade.toUpperCase()];
      if (points !== undefined) {
        totalPoints += points * credits;
        totalCredits += credits;
      }
    });
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  },

  /**
   * Calculate semester GPA
   */
  calculateSemesterGPA: (semesterGrades: { grade: string; credits: number }[]): number => {
    return gpaCalculations.calculateCumulativeGPA(semesterGrades);
  },

  /**
   * Calculate GPA trend (improvement/decline)
   */
  calculateGPATrend: (gpaHistory: number[]): {
    trend: 'improving' | 'declining' | 'stable';
    change: number;
    percentage: number;
  } => {
    if (gpaHistory.length < 2) {
      return { trend: 'stable', change: 0, percentage: 0 };
    }
    
    const latest = gpaHistory[gpaHistory.length - 1];
    const previous = gpaHistory[gpaHistory.length - 2];
    const change = latest - previous;
    const percentage = previous > 0 ? (change / previous) * 100 : 0;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (change > 0.1) trend = 'improving';
    else if (change < -0.1) trend = 'declining';
    
    return { trend, change, percentage };
  },
};

// Academic Class Calculations
export const academicClassCalculations = {
  /**
   * Determine academic class based on GPA
   */
  determineAcademicClass: (gpa: number): string => {
    if (gpa >= 3.7) return 'First Class';
    if (gpa >= 3.0) return 'Second Upper';
    if (gpa >= 2.5) return 'Second Lower';
    return 'Third/Pass';
  },

  /**
   * Calculate class distribution
   */
  calculateClassDistribution: (students: { gpa: number }[]): Record<string, number> => {
    const distribution: Record<string, number> = {
      'First Class': 0,
      'Second Upper': 0,
      'Second Lower': 0,
      'Third/Pass': 0,
    };
    
    students.forEach(student => {
      const academicClass = academicClassCalculations.determineAcademicClass(student.gpa);
      distribution[academicClass]++;
    });
    
    return distribution;
  },

  /**
   * Calculate class percentages
   */
  calculateClassPercentages: (distribution: Record<string, number>): Record<string, number> => {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    const percentages: Record<string, number> = {};
    
    Object.entries(distribution).forEach(([className, count]) => {
      percentages[className] = total > 0 ? (count / total) * 100 : 0;
    });
    
    return percentages;
  },
};

// Ranking and Tiebreaker Functions
export const rankingCalculations = {
  /**
   * Calculate weighted tiebreaker score
   */
  calculateTiebreakerScore: (entry: RankingEntry, config: TiebreakerConfig): number => {
    if (!config.enabled) return entry.gpa;
    
    const { weights } = config;
    let score = 0;
    
    // Normalize values to 0-1 scale
    const normalizedGPA = entry.gpa / 4.0;
    const normalizedCredits = Math.min(entry.credits / 120, 1); // Assuming 120 credits max
    const normalizedAttendance = (entry.attendance || 0) / 100;
    const normalizedExtracurricular = Math.min((entry.extracurricular || 0) / 10, 1); // Assuming 10 max
    
    score = 
      normalizedGPA * weights.gpa +
      normalizedCredits * weights.credits +
      normalizedAttendance * weights.attendance +
      normalizedExtracurricular * weights.extracurricular;
    
    return score;
  },

  /**
   * Rank students with tiebreaker logic
   */
  rankStudents: (students: RankingEntry[], config: TiebreakerConfig): RankingEntry[] => {
    return students
      .map(student => ({
        ...student,
        tiebreakerScore: rankingCalculations.calculateTiebreakerScore(student, config),
      }))
      .sort((a, b) => {
        // Primary sort by GPA
        if (Math.abs(a.gpa - b.gpa) > 0.001) {
          return b.gpa - a.gpa;
        }
        
        // Secondary sort by tiebreaker score
        return b.tiebreakerScore - a.tiebreakerScore;
      });
  },

  /**
   * Identify tied students
   */
  identifyTiedStudents: (rankedStudents: RankingEntry[], tolerance: number = 0.001): Array<RankingEntry[]> => {
    const tiedGroups: Array<RankingEntry[]> = [];
    let currentGroup: RankingEntry[] = [];
    
    rankedStudents.forEach((student, index) => {
      if (index === 0) {
        currentGroup = [student];
      } else {
        const prevStudent = rankedStudents[index - 1];
        if (Math.abs(student.gpa - prevStudent.gpa) <= tolerance) {
          currentGroup.push(student);
        } else {
          if (currentGroup.length > 1) {
            tiedGroups.push([...currentGroup]);
          }
          currentGroup = [student];
        }
      }
    });
    
    if (currentGroup.length > 1) {
      tiedGroups.push(currentGroup);
    }
    
    return tiedGroups;
  },
};

// Pathway Demand Calculations
export const pathwayCalculations = {
  /**
   * Calculate pathway demand percentage
   */
  calculateDemandPercentage: (demand: number, capacity: number): number => {
    return capacity > 0 ? (demand / capacity) * 100 : 0;
  },

  /**
   * Determine if pathway allocation should be GPA-based
   */
  shouldUseGPABasedAllocation: (demandPercentage: number, threshold: number = 60): boolean => {
    return demandPercentage >= threshold;
  },

  /**
   * Calculate pathway utilization
   */
  calculatePathwayUtilization: (enrolled: number, capacity: number): {
    utilization: number;
    status: 'underutilized' | 'optimal' | 'overutilized';
  } => {
    const utilization = capacity > 0 ? (enrolled / capacity) * 100 : 0;
    
    let status: 'underutilized' | 'optimal' | 'overutilized' = 'optimal';
    if (utilization < 80) status = 'underutilized';
    else if (utilization > 100) status = 'overutilized';
    
    return { utilization, status };
  },

  /**
   * Calculate pathway preference scores
   */
  calculatePreferenceScores: (student: any, pathways: any[]): Record<string, number> => {
    const scores: Record<string, number> = {};
    
    pathways.forEach(pathway => {
      let score = 0;
      
      // Interest alignment (0-40 points)
      if (student.interests) {
        const interestMatch = student.interests.filter((interest: string) => 
          pathway.keywords?.includes(interest)
        ).length;
        score += (interestMatch / pathway.keywords?.length || 1) * 40;
      }
      
      // Academic performance alignment (0-30 points)
      const gpaScore = Math.min(student.gpa / 4.0, 1) * 30;
      score += gpaScore;
      
      // Career goal alignment (0-20 points)
      if (student.careerGoals && pathway.careerPaths) {
        const goalMatch = student.careerGoals.some((goal: string) => 
          pathway.careerPaths.includes(goal)
        );
        score += goalMatch ? 20 : 0;
      }
      
      // Prerequisite satisfaction (0-10 points)
      const prereqSatisfied = pathway.prerequisites?.every((prereq: string) => 
        student.completedModules?.includes(prereq)
      ) || true;
      score += prereqSatisfied ? 10 : 0;
      
      scores[pathway.id] = score;
    });
    
    return scores;
  },
};

// Credit Calculations
export const creditCalculations = {
  /**
   * Calculate total credits completed
   */
  calculateCompletedCredits: (grades: { grade: string; credits: number }[]): number => {
    return grades
      .filter(grade => !['F', 'W', 'IP'].includes(grade.grade.toUpperCase()))
      .reduce((total, grade) => total + grade.credits, 0);
  },

  /**
   * Calculate credits in progress
   */
  calculateInProgressCredits: (grades: { grade: string; credits: number }[]): number => {
    return grades
      .filter(grade => grade.grade.toUpperCase() === 'IP')
      .reduce((total, grade) => total + grade.credits, 0);
  },

  /**
   * Calculate remaining credits
   */
  calculateRemainingCredits: (totalRequired: number, completed: number, inProgress: number): number => {
    return Math.max(0, totalRequired - completed - inProgress);
  },

  /**
   * Calculate graduation progress percentage
   */
  calculateGraduationProgress: (completedCredits: number, totalRequired: number): number => {
    return totalRequired > 0 ? (completedCredits / totalRequired) * 100 : 0;
  },

  /**
   * Calculate semester credit load
   */
  calculateSemesterCredits: (semesterGrades: { credits: number }[]): number => {
    return semesterGrades.reduce((total, grade) => total + grade.credits, 0);
  },
};

// Performance Analytics
export const performanceCalculations = {
  /**
   * Calculate module performance statistics
   */
  calculateModuleStats: (grades: { grade: string; credits: number }[]): {
    averageGrade: number;
    passRate: number;
    gradeDistribution: Record<string, number>;
  } => {
    const gradePoints: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0,
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    let passedCredits = 0;
    const gradeDistribution: Record<string, number> = {};
    
    grades.forEach(({ grade, credits }) => {
      const points = gradePoints[grade.toUpperCase()];
      if (points !== undefined) {
        totalPoints += points * credits;
        totalCredits += credits;
        
        if (points >= 1.0) {
          passedCredits += credits;
        }
        
        gradeDistribution[grade] = (gradeDistribution[grade] || 0) + credits;
      }
    });
    
    return {
      averageGrade: totalCredits > 0 ? totalPoints / totalCredits : 0,
      passRate: totalCredits > 0 ? (passedCredits / totalCredits) * 100 : 0,
      gradeDistribution,
    };
  },

  /**
   * Calculate attendance statistics
   */
  calculateAttendanceStats: (attendanceRecords: { present: boolean; total: number }[]): {
    attendanceRate: number;
    totalSessions: number;
    attendedSessions: number;
  } => {
    const totalSessions = attendanceRecords.reduce((sum, record) => sum + record.total, 0);
    const attendedSessions = attendanceRecords.reduce((sum, record) => 
      sum + (record.present ? record.total : 0), 0
    );
    
    return {
      attendanceRate: totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0,
      totalSessions,
      attendedSessions,
    };
  },

  /**
   * Calculate performance trends
   */
  calculatePerformanceTrends: (historicalData: { period: string; gpa: number }[]): {
    trend: 'improving' | 'declining' | 'stable';
    change: number;
    volatility: number;
  } => {
    if (historicalData.length < 2) {
      return { trend: 'stable', change: 0, volatility: 0 };
    }
    
    const gpas = historicalData.map(d => d.gpa);
    const latest = gpas[gpas.length - 1];
    const earliest = gpas[0];
    const change = latest - earliest;
    
    // Calculate volatility (standard deviation)
    const mean = gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length;
    const variance = gpas.reduce((sum, gpa) => sum + Math.pow(gpa - mean, 2), 0) / gpas.length;
    const volatility = Math.sqrt(variance);
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (change > 0.2) trend = 'improving';
    else if (change < -0.2) trend = 'declining';
    
    return { trend, change, volatility };
  },
};

// Statistical Functions
export const statisticalCalculations = {
  /**
   * Calculate mean
   */
  mean: (values: number[]): number => {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  },

  /**
   * Calculate median
   */
  median: (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  },

  /**
   * Calculate standard deviation
   */
  standardDeviation: (values: number[]): number => {
    if (values.length < 2) return 0;
    
    const mean = statisticalCalculations.mean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  },

  /**
   * Calculate percentile
   */
  percentile: (values: number[], percentile: number): number => {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    
    if (Number.isInteger(index)) {
      return sorted[index];
    }
    
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  },
};

// Utility Functions
export const calculationUtils = {
  /**
   * Round to specified decimal places
   */
  round: (value: number, decimals: number = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * Format percentage
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${calculationUtils.round(value, decimals)}%`;
  },

  /**
   * Format GPA
   */
  formatGPA: (gpa: number, decimals: number = 2): string => {
    return calculationUtils.round(gpa, decimals).toFixed(decimals);
  },

  /**
   * Calculate percentage change
   */
  percentageChange: (oldValue: number, newValue: number): number => {
    return oldValue !== 0 ? ((newValue - oldValue) / oldValue) * 100 : 0;
  },

  /**
   * Normalize value to 0-1 range
   */
  normalize: (value: number, min: number, max: number): number => {
    return max !== min ? (value - min) / (max - min) : 0;
  },
};
