/**
 * GPA Calculation Utilities for Student Frontend
 */

export interface GradeEntry {
    points: number;
    credits: number;
    [key: string]: any;
}

/**
 * Calculates the weighted GPA for a set of grades.
 * (Sum of Grade Points * Credits) / (Total Credits)
 */
export function calculateGPA(grades: GradeEntry[]): number {
    if (!grades || grades.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    grades.forEach(g => {
        // Only include released/valid grades
        if (g.credits > 0) {
            totalPoints += (g.points * g.credits);
            totalCredits += g.credits;
        }
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

/**
 * Determines academic class based on GPA
 */
export function getAcademicClass(gpa: number): string {
    if (gpa >= 3.7) return 'First Class';
    if (gpa >= 3.3) return 'Second Class Upper';
    if (gpa >= 3.0) return 'Second Class Lower';
    if (gpa >= 2.0) return 'Third Class';
    return 'Pass/Fail';
}
