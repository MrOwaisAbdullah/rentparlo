'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    details: 'support@rentparlo.pk',
    description: 'Send us an email anytime!'
  },
  {
    icon: Phone,
    title: 'Phone',
    details: '+92 300 123 4567',
    description: 'Mon-Fri from 9am to 6pm'
  },
  {
    icon: MapPin,
    title: 'Office',
    details: 'Gulshan-e-Iqbal, Karachi',
    description: 'Come say hello at our office'
  },
  {
    icon: Clock,
    title: 'Working Hours',
    details: 'Mon-Fri: 9:00 AM - 6:00 PM',
    description: 'Saturday: 10:00 AM - 4:00 PM'
  }
];

const faqItems = [
  {
    question: 'How quickly do you respond to inquiries?',
    answer: 'We typically respond to all inquiries within 24 hours during business days.'
  },
  {
    question: 'Do you provide support in Urdu?',
    answer: 'Yes, our support team is fluent in both English and Urdu.'
  },
  {
    question: 'Can I schedule a call instead of sending an email?',
    answer: 'Absolutely! Just mention your preferred time in the message and we\'ll reach out to you.'
  }
];

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
                      onChange={(value) => setValue('subject', value as string)}
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
                      onChange={(value) => setValue('urgency', value as string)}
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

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Reach out to us directly through any of these channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="font-semibold text-foreground">{item.details}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="text-sm font-medium">{item.question}</h4>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                  {index < faqItems.length - 1 && <hr className="my-4" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="/help"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Help Center →
              </a>
              <Link
                href="/blog"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Blog & Guides →
              </Link>
              <a
                href="/terms"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service →
              </a>
              <a
                href="/privacy"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}