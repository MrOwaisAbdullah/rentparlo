'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { contactFormSchema, type ContactFormData } from '@/lib/validations/auth';
import { sanitizeFormData } from '@/lib/security/sanitization';

interface ContactFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function ContactForm({ onSuccess, className }: ContactFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      subject: 'General',
      message: '',
      urgency: 'Medium'
    }
  });

  const formData = watch();

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsLoading(true);
      setSubmitStatus('idle');
      setErrorMessage('');

      // Sanitize form data
      const sanitizedData = sanitizeFormData(data);

      // Create FormData for API submission
      const formDataToSend = new FormData();
      Object.entries(sanitizedData).forEach(([key, value]) => {
        formDataToSend.set(key, value.toString());
      });

      // Submit to API route
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      setSubmitStatus('success');
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
          <p className="text-muted-foreground mb-4">
            Thank you for reaching out. We'll get back to you within 24 hours.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSubmitStatus('idle');
              reset();
            }}
          >
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Get in Touch</CardTitle>
              <CardDescription>
                Have a question or need help? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Error Alert */}
                {submitStatus === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <FormSection>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      id="name"
                      name="name"
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      error={errors.name?.message}
                      required
                      onChange={(value) => setValue('name', value as string)}
                    />

                    <FormField
                      id="email"
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      error={errors.email?.message}
                      required
                      onChange={(value) => setValue('email', value as string)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      id="subject"
                      name="subject"
                      label="Subject"
                      type="select"
                      options={[
                        { value: 'General', label: 'General Inquiry' },
                        { value: 'Support', label: 'Technical Support' },
                        { value: 'Business', label: 'Business Partnership' },
                        { value: 'Press', label: 'Press & Media' }
                      ]}
                      value={formData.subject}
                      error={errors.subject?.message}
                      required
                      onChange={(value) => setValue('subject', value as ContactFormData['subject'])}
                    />

                    <FormField
                      id="urgency"
                      name="urgency"
                      label="Priority Level"
                      type="select"
                      options={[
                        { value: 'Low', label: 'Low - General inquiry' },
                        { value: 'Medium', label: 'Medium - Standard request' },
                        { value: 'High', label: 'High - Urgent matter' }
                      ]}
                      value={formData.urgency}
                      error={errors.urgency?.message}
                      onChange={(value) => setValue('urgency', value as ContactFormData['urgency'])}
                    />
                  </div>

                  <FormField
                    id="message"
                    name="message"
                    label="Message"
                    type="textarea"
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    error={errors.message?.message}
                    required
                    description={`${formData.message.length}/1000 characters`}
                    onChange={(value) => setValue('message', value as string)}
                  />
                </FormSection>

                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={!isValid || isLoading}
                >
                  {isLoading ? 'Sending Message...' : 'Send Message'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to our{' '}
                  <a href="/privacy" className="underline hover:text-foreground">
                    Privacy Policy
                  </a>
                  . We'll only use your information to respond to your inquiry.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}