// Validation utility functions for SEES application

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FieldValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: FieldValidationRule;
}

// Email Validation
export const emailValidation = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate email with detailed result
   */
  validateEmail: (email: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (!emailValidation.isValidEmail(email)) {
      errors.push('Invalid email format');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Password Validation
export const passwordValidation = {
  /**
   * Validate password strength
   */
  validatePassword: (password: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      warnings.push('Password should contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      warnings.push('Password should contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      warnings.push('Password should contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      warnings.push('Password should contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },
};

// Student ID Validation
export const studentIdValidation = {
  /**
   * Validate student ID format
   */
  validateStudentId: (studentId: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!studentId) {
      errors.push('Student ID is required');
      return { isValid: false, errors };
    }
    
    // Student ID should be alphanumeric and 6-10 characters
    const studentIdRegex = /^[A-Z0-9]{6,10}$/;
    if (!studentIdRegex.test(studentId)) {
      errors.push('Student ID must be 6-10 alphanumeric characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// GPA Validation
export const gpaValidation = {
  /**
   * Validate GPA value
   */
  validateGPA: (gpa: number | string): ValidationResult => {
    const errors: string[] = [];
    
    const numGpa = typeof gpa === 'string' ? parseFloat(gpa) : gpa;
    
    if (isNaN(numGpa)) {
      errors.push('GPA must be a valid number');
    } else if (numGpa < 0 || numGpa > 4.0) {
      errors.push('GPA must be between 0.0 and 4.0');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Calculate GPA from grades
   */
  calculateGPA: (grades: { grade: string; credits: number }[]): number => {
    const gradePoints: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0,
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    grades.forEach(({ grade, credits }) => {
      const points = gradePoints[grade.toUpperCase()];
      if (points !== undefined) {
        totalPoints += points * credits;
        totalCredits += credits;
      }
    });
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  },
};

// Credit Validation
export const creditValidation = {
  /**
   * Validate credit value
   */
  validateCredits: (credits: number | string): ValidationResult => {
    const errors: string[] = [];
    
    const numCredits = typeof credits === 'string' ? parseInt(credits) : credits;
    
    if (isNaN(numCredits)) {
      errors.push('Credits must be a valid number');
    } else if (numCredits < 0 || numCredits > 6) {
      errors.push('Credits must be between 0 and 6');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate semester credit load
   */
  validateSemesterCredits: (credits: number): ValidationResult => {
    const errors: string[] = [];
    
    if (credits < 12) {
      errors.push('Minimum 12 credits required per semester');
    } else if (credits > 24) {
      errors.push('Maximum 24 credits allowed per semester');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Phone Number Validation
export const phoneValidation = {
  /**
   * Validate phone number format
   */
  validatePhone: (phone: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!phone) {
      return { isValid: true, errors: [] }; // Phone is optional
    }
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      errors.push('Phone number must be at least 10 digits');
    } else if (cleanPhone.length > 15) {
      errors.push('Phone number must be no more than 15 digits');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Format phone number for display
   */
  formatPhone: (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
    }
    
    return phone;
  },
};

// Date Validation
export const dateValidation = {
  /**
   * Validate date format
   */
  validateDate: (date: string | Date): ValidationResult => {
    const errors: string[] = [];
    
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      errors.push('Invalid date format');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate date range
   */
  validateDateRange: (startDate: string | Date, endDate: string | Date): ValidationResult => {
    const errors: string[] = [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime())) {
      errors.push('Invalid start date');
    }
    
    if (isNaN(end.getTime())) {
      errors.push('Invalid end date');
    }
    
    if (start >= end) {
      errors.push('End date must be after start date');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate birth date (must be reasonable age)
   */
  validateBirthDate: (birthDate: string | Date): ValidationResult => {
    const errors: string[] = [];
    
    const date = new Date(birthDate);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    
    if (age < 16) {
      errors.push('Age must be at least 16 years');
    } else if (age > 100) {
      errors.push('Age must be less than 100 years');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// File Validation
export const fileValidation = {
  /**
   * Validate file type
   */
  validateFileType: (file: File, allowedTypes: string[]): ValidationResult => {
    const errors: string[] = [];
    
    if (allowedTypes.includes('*')) {
      return { isValid: true, errors: [] };
    }
    
    const isValidType = allowedTypes.some(type => {
      if (type.includes('*')) {
        const extension = type.split('*')[1];
        return file.name.toLowerCase().endsWith(extension.toLowerCase());
      }
      return file.type === type;
    });
    
    if (!isValidType) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate file size
   */
  validateFileSize: (file: File, maxSizeMB: number): ValidationResult => {
    const errors: string[] = [];
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Form Validation
export const formValidation = {
  /**
   * Validate form fields
   */
  validateForm: (data: Record<string, any>, rules: ValidationRules): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    Object.entries(rules).forEach(([field, rule]) => {
      const value = data[field];
      
      // Required validation
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field} is required`);
        return;
      }
      
      // Skip other validations if field is empty and not required
      if (!value || value.toString().trim() === '') {
        return;
      }
      
      // Length validations
      if (rule.minLength && value.toString().length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      
      if (rule.maxLength && value.toString().length > rule.maxLength) {
        errors.push(`${field} must be no more than ${rule.maxLength} characters`);
      }
      
      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value.toString())) {
        errors.push(`${field} format is invalid`);
      }
      
      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          errors.push(customError);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Validate CSV data
   */
  validateCSVData: (data: any[], requiredFields: string[]): ValidationResult => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push('No data found in CSV');
      return { isValid: false, errors };
    }
    
    // Check required fields
    const firstRow = data[0];
    const missingFields = requiredFields.filter(field => !(field in firstRow));
    
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate each row
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push(`Row ${index + 1}: ${field} is required`);
        }
      });
    });
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Business Rule Validation
export const businessValidation = {
  /**
   * Validate pathway selection rules
   */
  validatePathwaySelection: (student: any, pathway: string): ValidationResult => {
    const errors: string[] = [];
    
    // Check if student is eligible for pathway selection
    if (student.academicYear !== 1) {
      errors.push('Only L1 students can select pathways');
    }
    
    // Check GPA requirements
    if (student.gpa < 2.0) {
      errors.push('Minimum GPA of 2.0 required for pathway selection');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate module registration
   */
  validateModuleRegistration: (student: any, module: any): ValidationResult => {
    const errors: string[] = [];
    
    // Check prerequisites
    if (module.prerequisites && module.prerequisites.length > 0) {
      const completedModules = student.completedModules || [];
      const missingPrereqs = module.prerequisites.filter((prereq: string) => 
        !completedModules.includes(prereq)
      );
      
      if (missingPrereqs.length > 0) {
        errors.push(`Missing prerequisites: ${missingPrereqs.join(', ')}`);
      }
    }
    
    // Check credit limits
    const currentCredits = student.currentSemesterCredits || 0;
    if (currentCredits + module.credits > 24) {
      errors.push('Exceeds maximum semester credit limit (24)');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate grade entry
   */
  validateGradeEntry: (grade: string, credits: number): ValidationResult => {
    const errors: string[] = [];
    
    const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W', 'IP'];
    
    if (!validGrades.includes(grade.toUpperCase())) {
      errors.push(`Invalid grade. Valid grades: ${validGrades.join(', ')}`);
    }
    
    if (credits < 0 || credits > 6) {
      errors.push('Credits must be between 0 and 6');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Generic Validation Helpers
export const validationHelpers = {
  /**
   * Combine multiple validation results
   */
  combineResults: (...results: ValidationResult[]): ValidationResult => {
    const allErrors = results.flatMap(r => r.errors);
    const allWarnings = results.flatMap(r => r.warnings || []);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
    };
  },

  /**
   * Create a validation rule
   */
  createRule: (rule: FieldValidationRule): FieldValidationRule => rule,

  /**
   * Check if value is empty
   */
  isEmpty: (value: any): boolean => {
    return value === null || value === undefined || value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  },

  /**
   * Sanitize input
   */
  sanitizeInput: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },
};
