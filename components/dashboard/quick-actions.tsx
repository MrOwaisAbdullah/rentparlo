"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuickActionsProps } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              asChild
              variant="outline"
              className={cn(
                "h-auto p-4 flex flex-col items-center gap-2 text-center",
                action.disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={action.disabled}
            >
              <Link href={action.disabled ? "#" : action.href}>
                <action.icon className="h-6 w-6" />
                <div>
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
