"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { ExportButtonProps } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export function ExportButton({
  data,
  filename,
  format,
  onExport,
  disabled = false,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (exportFormat: "csv" | "pdf" | "excel") => {
    if (disabled || isExporting) return;

    setIsExporting(true);

    try {
      // Call the onExport callback if provided
      if (onExport) {
        onExport();
      }

      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real implementation, you would:
      // 1. Convert data to the specified format
      // 2. Create a downloadable file
      // 3. Trigger the download

      switch (exportFormat) {
        case "csv":
          exportToCSV(data, filename);
          break;
        case "pdf":
          // exportToPDF(data, filename);
          console.log("PDF export not implemented yet");
          break;
        case "excel":
          // exportToExcel(data, filename);
          console.log("Excel export not implemented yet");
          break;
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes in values
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  // Single format button
  if (format !== "csv" && format !== "pdf" && format !== "excel") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport(format as any)}
        disabled={disabled || isExporting || !data.length}
        className={cn(disabled && "opacity-50 cursor-not-allowed")}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <>
            {getFormatIcon(format)}
            <span className="ml-2">Export {format.toUpperCase()}</span>
          </>
        )}
      </Button>
    );
  }

  // Multi-format dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || !data.length}
          className={cn(disabled && "opacity-50 cursor-not-allowed")}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
