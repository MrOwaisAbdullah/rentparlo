'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'file';
  placeholder?: string;
  value?: string | boolean;
  options?: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  accept?: string; // For file inputs
  multiple?: boolean; // For file inputs
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  isValid?: boolean;
  animation?: 'slide' | 'fade' | 'scale' | 'none';
  validationState?: 'idle' | 'validating' | 'valid' | 'invalid';
  autoFocus?: boolean;
  onChange: (value: string | boolean | FileList | null) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export function FormField({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  options,
  error,
  required,
  disabled,
  description,
  accept,
  multiple,
  className,
  icon: Icon,
  isLoading = false,
  isValid,
  animation = 'slide',
  validationState = 'idle',
  autoFocus = false,
  onChange,
  onBlur,
  onFocus
}: FormFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isPasswordField] = React.useState(type === 'password');
  
  // Animation variants
  const fieldVariants = {
    idle: { scale: 1, borderColor: 'hsl(var(--border))' },
    focused: { scale: 1.01, borderColor: 'hsl(var(--primary))' },
    error: { 
      x: [-5, 5, -5, 5, 0], 
      borderColor: 'hsl(var(--destructive))',
      transition: { duration: 0.4 }
    },
    valid: { 
      borderColor: 'hsl(var(--primary))',
      transition: { duration: 0.2 }
    }
  };
  
  const errorVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto' }
  };
  
  const successVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring" as const, stiffness: 300 } }
  };

  const handleChange = (newValue: string | boolean | FileList | null) => {
    onChange(newValue);
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
  const getValidationIcon = () => {
    if (isLoading || validationState === 'validating') {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (error || validationState === 'invalid') {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (isValid || validationState === 'valid') {
      return (
        <motion.div
          variants={successVariants}
          initial="hidden"
          animate="visible"
        >
          <Check className="h-4 w-4 text-green-600" />
        </motion.div>
      );
    }
    return null;
  };
  
  const getAnimationState = () => {
    if (error) return 'error';
    if (isValid || validationState === 'valid') return 'valid';
    if (isFocused) return 'focused';
    return 'idle';
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <motion.div
            variants={animation !== 'none' ? fieldVariants : undefined}
            animate={animation !== 'none' ? getAnimationState() : undefined}
            className="relative"
          >
            <Textarea
              id={id}
              name={name}
              placeholder={placeholder}
              value={value as string || ''}
              disabled={disabled || isLoading}
              className={cn(
                "transition-all duration-200",
                error && "border-destructive",
                isFocused && "ring-2 ring-primary/20",
                isValid && "border-green-500",
                Icon && "pl-10",
                className
              )}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onFocus={handleFocus}
              rows={4}
            />
            {Icon && (
              <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            )}
            <div className="absolute right-3 top-3">
              {getValidationIcon()}
            </div>
          </motion.div>
        );

      case 'select':
        return (
          <motion.div
            variants={animation !== 'none' ? fieldVariants : undefined}
            animate={animation !== 'none' ? getAnimationState() : undefined}
            className="relative"
          >
            <Select
              value={value as string || ''}
              onValueChange={(newValue) => handleChange(newValue)}
              disabled={disabled || isLoading}
            >
              <SelectTrigger 
                className={cn(
                  "transition-all duration-200",
                  error && "border-destructive",
                  isFocused && "ring-2 ring-primary/20",
                  isValid && "border-green-500",
                  Icon && "pl-10",
                  className
                )}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {Icon && (
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              {getValidationIcon()}
            </div>
          </motion.div>
        );

      case 'checkbox':
        return (
          <motion.div
            variants={animation !== 'none' ? fieldVariants : undefined}
            animate={animation !== 'none' ? getAnimationState() : undefined}
            className="flex items-center space-x-2"
          >
            <Checkbox
              id={id}
              name={name}
              checked={value as boolean || false}
              disabled={disabled || isLoading}
              onCheckedChange={(checked) => handleChange(checked === true)}
              className={cn(
                "transition-all duration-200",
                error && "border-destructive",
                isValid && "border-green-500"
              )}
            />
            <Label
              htmlFor={id}
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {label}
            </Label>
            {isLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-2" />
            )}
          </motion.div>
        );

      case 'file':
        return (
          <motion.div
            variants={animation !== 'none' ? fieldVariants : undefined}
            animate={animation !== 'none' ? getAnimationState() : undefined}
            className="space-y-2"
          >
            <Input
              id={id}
              name={name}
              type="file"
              accept={accept}
              multiple={multiple}
              disabled={disabled || isLoading}
              className={cn(
                "transition-all duration-200 cursor-pointer",
                error && "border-destructive",
                isFocused && "ring-2 ring-primary/20",
                isValid && "border-green-500",
                className
              )}
              onChange={(e) => handleChange(e.target.files)}
              onBlur={handleBlur}
              onFocus={handleFocus}
            />
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </motion.div>
        );

      case 'password':
        return (
          <motion.div
            variants={animation !== 'none' ? fieldVariants : undefined}
            animate={animation !== 'none' ? getAnimationState() : undefined}
            className="relative"
          >
            <Input
              id={id}
              name={name}
              type={showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              value={value as string || ''}
              disabled={disabled || isLoading}
              className={cn(
                "transition-all duration-200 pr-20",
                error && "border-destructive",
                isFocused && "ring-2 ring-primary/20",
                isValid && "border-green-500",
                Icon && "pl-10",
                className
              )}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onFocus={handleFocus}
            />
            {Icon && (
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              {getValidationIcon()}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled || isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </motion.div>
        );

      default:
        return (
          <motion.div
            variants={animation !== 'none' ? fieldVariants : undefined}
            animate={animation !== 'none' ? getAnimationState() : undefined}
            className="relative"
          >
            <Input
              id={id}
              name={name}
              type={type}
              placeholder={placeholder}
              value={value as string || ''}
              disabled={disabled || isLoading}
              autoFocus={autoFocus}
              className={cn(
                "transition-all duration-200",
                error && "border-destructive",
                isFocused && "ring-2 ring-primary/20",
                isValid && "border-green-500",
                Icon && "pl-10",
                (getValidationIcon() || isLoading) && "pr-10",
                className
              )}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onFocus={handleFocus}
            />
            {Icon && (
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getValidationIcon()}
            </div>
          </motion.div>
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className="space-y-2">
        {renderInput()}
        <AnimatePresence>
          {error && (
            <motion.div
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex items-center text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id} 
        className={cn(
          "text-sm font-medium transition-colors duration-200",
          isFocused && "text-primary",
          error && "text-destructive"
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
        {isLoading && (
          <Loader2 className="inline h-3 w-3 animate-spin ml-2" />
        )}
      </Label>
      {renderInput()}
      <AnimatePresence>
        {error && (
          <motion.div
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex items-center text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      {description && !error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}