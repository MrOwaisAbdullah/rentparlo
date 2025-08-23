'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  component?: React.ComponentType;
  validation?: () => boolean | Promise<boolean>;
}

export interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  children: React.ReactNode;
  onNext?: () => void | Promise<void>;
  onPrevious?: () => void;
  onStepClick?: (stepIndex: number) => void;
  nextLabel?: string;
  previousLabel?: string;
  submitLabel?: string;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  isLoading?: boolean;
  showProgress?: boolean;
  showStepNumbers?: boolean;
  allowStepNavigation?: boolean;
  saveProgress?: boolean;
  onProgressSave?: (step: number, data: any) => void;
  completedSteps?: Set<number>;
  className?: string;
  variant?: 'default' | 'compact' | 'vertical';
  animation?: 'slide' | 'fade' | 'scale' | 'none';
}

export function MultiStepForm({
  steps,
  currentStep,
  children,
  onNext,
  onPrevious,
  onStepClick,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  submitLabel = 'Submit',
  canGoNext = true,
  canGoPrevious = true,
  isLoading = false,
  showProgress = true,
  showStepNumbers = true,
  allowStepNavigation = true,
  saveProgress = false,
  onProgressSave,
  completedSteps = new Set(),
  className,
  variant = 'default',
  animation = 'slide'
}: MultiStepFormProps) {
  const [animationDirection, setAnimationDirection] = React.useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  
  // Helper function to determine step state
  const getStepState = (stepIndex: number): 'completed' | 'active' | 'inactive' => {
    if (completedSteps.has(stepIndex) || stepIndex < currentStep) {
      return 'completed';
    } else if (stepIndex === currentStep) {
      return 'active';
    } else {
      return 'inactive';
    }
  };
  
  // Helper function to determine if step is clickable
  const isStepClickable = (stepIndex: number): boolean => {
    if (!allowStepNavigation) return false;
    
    // Can always click on completed steps or current step
    if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
      return true;
    }
    
    // Can click on next step if current step is completed or optional
    if (stepIndex === currentStep + 1) {
      return completedSteps.has(currentStep) || steps[currentStep]?.optional === true;
    }
    
    return false;
  };
  
  // Handler for step navigation
  const handleStepClick = (stepIndex: number) => {
    if (isStepClickable(stepIndex) && onStepClick) {
      onStepClick(stepIndex);
    }
  };
  
  // Handler for previous button
  const handlePrevious = async () => {
    if (!isFirstStep && canGoPrevious && !isLoading && !isTransitioning) {
      setAnimationDirection('backward');
      if (onPrevious) {
        onPrevious();
      }
    }
  };
  
  // Handler for next button
  const handleNext = async () => {
    if (canGoNext && !isLoading && !isTransitioning) {
      setAnimationDirection('forward');
      setIsTransitioning(true);
      
      try {
        // Validate current step if validation function exists
        const currentStepData = steps[currentStep];
        if (currentStepData?.validation) {
          const isValid = await currentStepData.validation();
          if (!isValid) {
            setIsTransitioning(false);
            return;
          }
        }
        
        // Save progress if enabled
        if (saveProgress && onProgressSave) {
          onProgressSave(currentStep, {});
        }
        
        // Call next handler
        if (onNext) {
          await onNext();
        }
      } catch (error) {
        console.error('Error proceeding to next step:', error);
      } finally {
        setIsTransitioning(false);
      }
    }
  };
  
  // Animation variants
  const contentVariants = {
    slide: {
      initial: (direction: 'forward' | 'backward') => ({
        x: direction === 'forward' ? 50 : -50,
        opacity: 0
      }),
      animate: { x: 0, opacity: 1 },
      exit: (direction: 'forward' | 'backward') => ({
        x: direction === 'forward' ? -50 : 50,
        opacity: 0
      })
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    scale: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.95, opacity: 0 }
    },
    none: {
      initial: {},
      animate: {},
      exit: {}
    }
  };
  
  const progressVariants = {
    initial: { width: 0 },
    animate: { width: `${progressPercentage}%` }
  };
  
  const stepVariants = {
    inactive: { scale: 1, opacity: 0.6 },
    active: { scale: 1.1, opacity: 1 },
    completed: { scale: 1, opacity: 1 }
  };

  return (
    <div className={cn(
      "w-full space-y-3 sm:space-y-4",
      variant === 'compact' && "space-y-2 sm:space-y-3",
      variant === 'vertical' && "lg:grid lg:grid-cols-4 lg:gap-4 xl:gap-6 lg:space-y-0",
      className
    )}>
      {/* Mobile step indicator */}
      <div className="lg:hidden">
        {showProgress && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm sm:text-base font-medium">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <div className="relative">
              <Progress value={0} className="h-2 sm:h-3" />
              <motion.div
                variants={progressVariants}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute top-0 left-0 h-2 sm:h-3 bg-primary rounded-full"
              />
            </div>
          </div>
        )}
        
        {/* Mobile step title */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1 sm:space-y-2 mt-3 sm:mt-4"
        >
          <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight">
            {steps[currentStep]?.title}
          </h2>
          {steps[currentStep]?.description && (
            <p className="text-xs sm:text-sm text-muted-foreground px-4">
              {steps[currentStep].description}
            </p>
          )}
        </motion.div>
      </div>

      {/* Desktop step indicators */}
      <div className={cn(
        "hidden lg:block",
        variant === 'vertical' && "lg:col-span-1"
      )}>
        {showStepNumbers && (
          <div className={cn(
            "flex items-center justify-between",
            variant === 'vertical' && "flex-col items-start space-y-3 lg:space-y-4"
          )}>
            {steps.map((step, index) => {
              const stepState = getStepState(index);
              const isClickable = isStepClickable(index);
              const StepIcon = step.icon;

              return (
                <div key={step.id} className={cn(
                  "flex items-center",
                  variant === 'vertical' && "w-full"
                )}>
                  <motion.div
                    className={cn(
                      "flex items-center cursor-pointer group transition-all duration-200",
                      !isClickable && "cursor-default",
                      variant === 'vertical' && "w-full p-3 rounded-lg border",
                      variant === 'vertical' && stepState === 'active' && "border-primary bg-primary/5",
                      variant === 'vertical' && stepState === 'completed' && "border-green-500 bg-green-50"
                    )}
                    variants={stepVariants}
                    animate={stepState}
                    whileHover={isClickable ? { scale: 1.02 } : {}}
                    whileTap={isClickable ? { scale: 0.98 } : {}}
                    onClick={() => isClickable && handleStepClick(index)}
                  >
                    {/* Step circle */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-full border-2 transition-all duration-200 relative",
                        stepState === 'completed'
                          ? "bg-green-500 border-green-500 text-white"
                          : stepState === 'active'
                          ? "border-primary text-primary bg-primary/10"
                          : "border-muted-foreground/30 text-muted-foreground bg-background",
                        isClickable && "group-hover:border-primary group-hover:bg-primary/10 cursor-pointer"
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {stepState === 'completed' ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check className="w-3 h-3" />
                          </motion.div>
                        ) : stepState === 'active' && isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Loader2 className="w-3 h-3 animate-spin" />
                          </motion.div>
                        ) : StepIcon ? (
                          <StepIcon className="w-3 h-3" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </AnimatePresence>
                      
                      {/* Active step indicator */}
                      {stepState === 'active' && (
                        <motion.div
                          className="absolute -inset-1 border-2 border-primary rounded-full"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.2, opacity: 1 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        />
                      )}
                    </div>

                    {/* Step title */}
                    <div className={cn(
                      "ml-2 min-w-0",
                      variant === 'vertical' && "flex-1"
                    )}>
                      <h4
                        className={cn(
                          "text-xs font-medium",
                          variant === 'vertical' ? "truncate-none" : "truncate",
                          stepState === 'active' ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </h4>
                      {step.description && variant === 'vertical' && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      )}
                      {step.optional && (
                        <span className="text-[10px] text-muted-foreground">
                          (Optional)
                        </span>
                      )}
                    </div>
                  </motion.div>

                  {/* Connector line */}
                  {index < steps.length - 1 && variant !== 'vertical' && (
                    <motion.div
                      className="flex-1 h-0.5 mx-2 bg-muted-foreground/20"
                      initial={false}
                      animate={{
                        backgroundColor: index < currentStep 
                          ? "hsl(var(--primary))" 
                          : "hsl(var(--muted-foreground) / 0.2)"
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Desktop step header */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-center space-y-2 lg:space-y-3 mt-4 lg:mt-6",
            variant === 'vertical' && "text-left mt-3 lg:mt-4"
          )}
        >
          <h2 className="text-lg lg:text-xl xl:text-2xl font-bold tracking-tight">
            {steps[currentStep]?.title}
          </h2>
          {steps[currentStep]?.description && (
            <p className="text-xs lg:text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          )}
        </motion.div>
      </div>

      {/* Form content */}
      <div className={cn(
        "min-h-[300px] sm:min-h-[400px] lg:min-h-[450px] relative",
        variant === 'vertical' && "lg:col-span-3"
      )}>
        <AnimatePresence mode="wait" custom={animationDirection}>
          <motion.div
            key={currentStep}
            custom={animationDirection}
            variants={contentVariants[animation]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        
        {/* Loading overlay */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10"
            >
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Processing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <motion.div
        layout
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t",
          variant === 'vertical' && "lg:col-span-4"
        )}
      >
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || !canGoPrevious || isLoading || isTransitioning}
          className={cn(
            "h-11 sm:h-12 transition-all duration-200 order-2 sm:order-1",
            isFirstStep && "invisible"
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {previousLabel}
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-3 sm:gap-0 order-1 sm:order-2">
          {/* Progress dots for mobile */}
          <div className="flex justify-center sm:hidden space-x-1.5">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-200 cursor-pointer",
                  index === currentStep
                    ? "bg-primary scale-125"
                    : index < currentStep
                    ? "bg-green-500"
                    : "bg-muted-foreground/30"
                )}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => isStepClickable(index) && handleStepClick(index)}
              />
            ))}
          </div>
          
          {steps[currentStep]?.optional && (
            <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              (Optional)
            </span>
          )}
          
          <Button
            onClick={handleNext}
            disabled={!canGoNext || isLoading || isTransitioning}
            className="w-full sm:w-auto min-w-[120px] h-11 sm:h-12 order-3"
          >
            <AnimatePresence mode="wait">
              {isLoading || isTransitioning ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isLastStep ? 'Creating...' : 'Next'}
                </motion.div>
              ) : (
                <motion.div
                  key="normal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  {isLastStep ? submitLabel : nextLabel}
                  {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}