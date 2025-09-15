"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileResponsiveWrapper } from "./mobile-responsive-wrapper";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  ariaLabel?: string;
}

interface AccessibleDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;
  pagination?: boolean;
  pageSize?: number;
  sorting?: boolean;
  filtering?: boolean;
  exportable?: boolean;
  onExport?: () => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

type SortDirection = "asc" | "desc" | null;

export function AccessibleDataTable<T extends Record<string, any>>({
  data,
  columns,
  title = "Data Table",
  description,
  pagination = true,
  pageSize = 10,
  sorting = true,
  filtering = false,
  exportable = false,
  onExport,
  className,
  emptyMessage = "No data available",
  loading = false,
}: AccessibleDataTableProps<T>) {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filterValue, setFilterValue] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">(isMobile ? "cards" : "table");
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const [announceText, setAnnounceText] = useState("");
  
  const tableRef = useRef<HTMLTableElement>(null);
  const announcerRef = useRef<HTMLDivElement>(null);
  
  // Announce changes to screen readers
  const announce = useCallback((text: string) => {
    setAnnounceText(text);
    setTimeout(() => setAnnounceText(""), 1000);
  }, []);

  // Filter data
  const filteredData = filtering && filterValue
    ? data.filter(item =>
        columns.some(column =>
          column.filterable &&
          String(item[column.key]).toLowerCase().includes(filterValue.toLowerCase())
        )
      )
    : data;

  // Sort data
  const sortedData = sortColumn && sortDirection
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : filteredData;

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = pagination
    ? sortedData.slice(startIndex, startIndex + pageSize)
    : sortedData;

  // Handle sorting
  const handleSort = useCallback((column: Column<T>) => {
    if (!column.sortable) return;
    
    if (sortColumn === column.key) {
      const newDirection = sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc";
      setSortDirection(newDirection);
      if (newDirection === null) {
        setSortColumn(null);
        announce("Sorting cleared");
      } else {
        announce(`Sorted by ${column.header} ${newDirection}ending`);
      }
    } else {
      setSortColumn(column.key);
      setSortDirection("asc");
      announce(`Sorted by ${column.header} ascending`);
    }
  }, [sortColumn, sortDirection, announce]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!focusedCell) return;
    
    const { row, col } = focusedCell;
    let newRow = row;
    let newCol = col;
    
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        newRow = Math.max(0, row - 1);
        break;
      case "ArrowDown":
        e.preventDefault();
        newRow = Math.min(paginatedData.length - 1, row + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        newCol = Math.max(0, col - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        newCol = Math.min(columns.length - 1, col + 1);
        break;
      case "Home":
        e.preventDefault();
        newCol = 0;
        break;
      case "End":
        e.preventDefault();
        newCol = columns.length - 1;
        break;
      case "PageUp":
        e.preventDefault();
        if (currentPage > 1) {
          setCurrentPage(currentPage - 1);
          announce(`Page ${currentPage - 1} of ${totalPages}`);
        }
        break;
      case "PageDown":
        e.preventDefault();
        if (currentPage < totalPages) {
          setCurrentPage(currentPage + 1);
          announce(`Page ${currentPage + 1} of ${totalPages}`);
        }
        break;
      default:
        return;
    }
    
    if (newRow !== row || newCol !== col) {
      setFocusedCell({ row: newRow, col: newCol });
      const cellValue = paginatedData[newRow]?.[columns[newCol]?.key];
      announce(`${columns[newCol]?.header}: ${cellValue}`);
    }
  }, [focusedCell, paginatedData, columns, currentPage, totalPages, announce]);

  // Mobile card view
  const MobileCardView = () => (
    <div className="space-y-3" role="list" aria-label={`${title} data cards`}>
      {paginatedData.map((row, index) => (
        <Card 
          key={index} 
          className="p-4"
          role="listitem"
          tabIndex={0}
          aria-label={`Data card ${index + 1} of ${paginatedData.length}`}
        >
          <div className="space-y-2">
            {columns.slice(0, 4).map((column) => (
              <div key={String(column.key)} className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">
                  {column.header}:
                </span>
                <div className="text-sm font-medium text-right flex-1 ml-2">
                  {column.render
                    ? column.render(row[column.key], row, index)
                    : String(row[column.key] || "-")}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          {description && <Skeleton className="h-4 w-64" />}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <MobileResponsiveWrapper className={className}>
      {/* Screen Reader Announcer */}
      <div
        ref={announcerRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {announceText}
      </div>

      <Card>
        <CardHeader>
          <div className={`flex ${isMobile ? "flex-col gap-3" : "items-start justify-between"}`}>
            <div>
              <CardTitle className={isMobile ? "text-lg" : ""}>{title}</CardTitle>
              {description && (
                <p className={`text-muted-foreground mt-1 ${isMobile ? "text-sm" : ""}`}>
                  {description}
                </p>
              )}
            </div>
            
            <div className={`flex gap-2 ${isMobile ? "flex-col" : "items-center"}`}>
              {filtering && (
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search data..."
                    value={filterValue}
                    onChange={(e) => {
                      setFilterValue(e.target.value);
                      setCurrentPage(1);
                      announce(`Filtering data by: ${e.target.value}`);
                    }}
                    className={`pl-8 ${isMobile ? "w-full" : "w-64"}`}
                    aria-label="Search table data"
                  />
                </div>
              )}
              
              <div className={`flex gap-2 ${isMobile ? "w-full" : "items-center"}`}>
                {isMobile && (
                  <div className="flex rounded-md border">
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setViewMode("table");
                        announce("Switched to table view");
                      }}
                      className="rounded-r-none"
                      aria-label="Table view"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "cards" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setViewMode("cards");
                        announce("Switched to card view");
                      }}
                      className="rounded-l-none"
                      aria-label="Card view"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {exportable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onExport?.();
                      announce("Data export initiated");
                    }}
                    className={isMobile ? "flex-1" : ""}
                    aria-label="Export table data"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {paginatedData.length === 0 ? (
            <div 
              className="text-center py-8 text-muted-foreground"
              role="status"
              aria-label={emptyMessage}
            >
              {emptyMessage}
            </div>
          ) : isMobile && viewMode === "cards" ? (
            <MobileCardView />
          ) : (
            <div className={`rounded-md border ${isMobile ? "overflow-x-auto" : ""}`}>
              <table
                ref={tableRef}
                className="w-full"
                role="table"
                aria-label={title}
                aria-describedby={description ? "table-description" : undefined}
                onKeyDown={handleKeyDown}
              >
                {description && (
                  <caption id="table-description" className="sr-only">
                    {description}
                  </caption>
                )}
                
                <thead>
                  <tr role="row">
                    {columns.map((column, colIndex) => (
                      <th
                        key={String(column.key)}
                        className={cn(
                          "px-4 py-3 text-left font-medium text-muted-foreground border-b",
                          column.sortable && "cursor-pointer hover:bg-muted/50",
                          isMobile && "text-xs px-2 py-2 min-w-[100px]",
                          column.align === "center" && "text-center",
                          column.align === "right" && "text-right"
                        )}
                        style={{ width: column.width }}
                        onClick={() => column.sortable && handleSort(column)}
                        role="columnheader"
                        aria-sort={
                          sortColumn === column.key
                            ? sortDirection === "asc"
                              ? "ascending"
                              : "descending"
                            : column.sortable
                            ? "none"
                            : undefined
                        }
                        aria-label={
                          column.ariaLabel ||
                          `${column.header}${column.sortable ? ", sortable column" : ""}`
                        }
                        tabIndex={column.sortable ? 0 : -1}
                      >
                        <div className="flex items-center gap-2">
                          <span className={isMobile ? "text-xs" : ""}>{column.header}</span>
                          {column.sortable && (
                            <div className="flex flex-col">
                              {sortColumn === column.key ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="h-3 w-3 text-primary" />
                                ) : (
                                  <ArrowDown className="h-3 w-3 text-primary" />
                                )
                              ) : (
                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody>
                  {paginatedData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      role="row"
                      className="border-b hover:bg-muted/50"
                      aria-rowindex={startIndex + rowIndex + 1}
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={String(column.key)}
                          className={cn(
                            "px-4 py-3",
                            isMobile && "text-xs px-2 py-2",
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right",
                            focusedCell?.row === rowIndex && focusedCell?.col === colIndex &&
                              "ring-2 ring-primary ring-offset-2"
                          )}
                          role="gridcell"
                          tabIndex={0}
                          aria-describedby={`${column.header}-${rowIndex}`}
                          onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                        >
                          {column.render
                            ? column.render(row[column.key], row, rowIndex)
                            : String(row[column.key] || "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && totalPages > 1 && (
            <div 
              className={`flex mt-4 ${isMobile ? "flex-col gap-3" : "items-center justify-between"}`}
              role="navigation"
              aria-label="Table pagination"
            >
              <div className={`text-muted-foreground ${isMobile ? "text-xs text-center" : "text-sm"}`}>
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of{" "}
                {sortedData.length} entries
              </div>
              
              <div className={`flex items-center gap-2 ${isMobile ? "justify-center" : ""}`}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    announce(`Page ${currentPage - 1} of ${totalPages}`);
                  }}
                  disabled={currentPage === 1}
                  className={isMobile ? "flex-1" : ""}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {!isMobile && "Previous"}
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCurrentPage(page);
                          announce(`Page ${page} of ${totalPages}`);
                        }}
                        className="w-8 h-8 p-0"
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    announce(`Page ${currentPage + 1} of ${totalPages}`);
                  }}
                  disabled={currentPage === totalPages}
                  className={isMobile ? "flex-1" : ""}
                  aria-label="Go to next page"
                >
                  {!isMobile && "Next"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </MobileResponsiveWrapper>
  );