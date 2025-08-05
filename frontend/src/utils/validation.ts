import { z } from 'zod';
import React from 'react';

// Frontend validation schemas matching backend
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character'
  );

export const phoneSchema = z.string()
  .optional()
  .refine(
    (val) => !val || /^\+?[1-9]\d{1,14}$/.test(val),
    'Please enter a valid phone number'
  );

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, apostrophes, and hyphens');

// Form validation functions
export const validateEmail = (email: string): string | null => {
  try {
    emailSchema.parse(email);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Invalid email';
  }
};

export const validatePassword = (password: string): string | null => {
  try {
    passwordSchema.parse(password);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Invalid password';
  }
};

export const validatePhone = (phone: string): string | null => {
  try {
    phoneSchema.parse(phone);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Invalid phone number';
  }
};

export const validateName = (name: string): string | null => {
  try {
    nameSchema.parse(name);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Invalid name';
  }
};

// Real-time validation for forms
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateForm = (data: Record<string, any>, schema: z.ZodSchema): ValidationResult => {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};

// Input sanitization for frontend
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

// File validation
export const validateFile = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
}): string | null => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'] } = options;
  
  if (file.size > maxSize) {
    return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
  }
  
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }
  
  return null;
};

// Password strength indicator
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push('Add special characters (@$!%*?&)');
  
  if (password.length >= 12) score += 1;
  
  return { score, feedback };
};

// Form schemas for different components
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema,
  phoneNumber: phoneSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const profileUpdateSchema = z.object({
  fullName: nameSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  interests: z.array(z.string()).max(10, 'Maximum 10 interests allowed').optional(),
  phoneNumber: phoneSchema,
});

export const eventCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  type: z.enum(['SOCIAL', 'SPORTS', 'TRIP', 'ILM', 'CAFE_MEETUP', 'VOLUNTEER', 'MONTHLY_EVENT', 'LOCAL_TRIP']),
  date: z.string().refine((date) => new Date(date) > new Date(), 'Event date must be in the future'),
  location: z.string().min(3, 'Location must be at least 3 characters').max(200, 'Location too long'),
  maxAttendees: z.number().int().min(1).max(10000).optional(),
});

// Debounced validation for real-time feedback
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Custom hook for form validation
export const useFormValidation = <T>(
  initialValues: T,
  schema: z.ZodSchema<T>
) => {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  
  const validate = React.useCallback((data: T) => {
    const result = validateForm(data, schema);
    setErrors(result.errors);
    return result.isValid;
  }, [schema]);
  
  const handleChange = React.useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate single field
    const fieldSchema = schema.shape[field as string];
    if (fieldSchema) {
      try {
        fieldSchema.parse(value);
        setErrors(prev => ({ ...prev, [field]: '' }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors(prev => ({ ...prev, [field]: error.errors[0].message }));
        }
      }
    }
  }, [schema]);
  
  const handleSubmit = React.useCallback((onSubmit: (data: T) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault();
      if (validate(values)) {
        onSubmit(values);
      }
    };
  }, [values, validate]);
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit,
    validate,
    isValid: Object.keys(errors).length === 0,
  };
};

// Export types
export type ValidationSchema = z.ZodSchema;
export type FormValidationHook<T> = ReturnType<typeof useFormValidation<T>>;