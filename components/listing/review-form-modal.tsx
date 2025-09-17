"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export const reviewFormSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be between 1 and 5"),
  title: z.string().min(1, "Title is required").max(100, "Title must be at most 100 characters"),
  comment: z.string().min(20, "Comment must be at least 20 characters"),
  images: z.custom<FileList>().optional(),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormModalProps {
  listingId: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export function ReviewFormModal({
  listingId,
  isOpen,
  onClose,
  onReviewSubmitted,
}: ReviewFormModalProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // When modal opens, check auth status
      setAuthLoading(loading);
    }
  }, [isOpen, loading]);

  useEffect(() => {
    // Update auth loading state when useAuth loading changes
    setAuthLoading(loading);
  }, [loading]);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    if (!user) {
      toast.info("Please log in or register to submit a review.");
      onClose();
      router.push("/auth/login");
      return;
    }

    const formData = new FormData();
    formData.append('rating', String(values.rating));
    formData.append('title', values.title);
    formData.append('comment', values.comment);
    formData.append('listingId', listingId);
    if (values.images) {
        Array.from(values.images).forEach(file => {
            formData.append('images', file);
        });
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      onReviewSubmitted();
      onClose();
      form.reset();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this listing.
          </DialogDescription>
        </DialogHeader>
        {authLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-lg font-semibold">You need to be logged in to write a review.</p>
            <Button onClick={() => {
              onClose();
              router.push("/auth/login");
            }}>
              Login or Register
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={
                              `cursor-pointer w-6 h-6 ` +
                              (field.value >= star ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")
                            }
                            onClick={() => field.onChange(star)}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Great experience!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Comment</FormLabel>
                    <FormControl>
                      <Textarea placeholder="I rented this item..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="images"
                render={({ field: { onChange, value, ...props } }) => (
                  <FormItem>
                    <FormLabel>Images (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                          type="file" 
                          multiple 
                          accept="image/*"
                          onChange={(e) => onChange(e.target.files)}
                          {...props}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
