"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  MoreVertical,
  Grid3X3,
  List,
} from "lucide-react";
import { DataTableProps, ColumnDef } from "@/types/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileResponsiveWrapper } from "./mobile-responsive-wrapper";
import { cn } from "@/lib/utils";

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pagination = true,
  sorting = true,
  filtering = true,
  exportable = false,
  loading = false,
  title = "Data Table",
}: DataTableProps<T>) {
  const isMobile = useIsMobile();
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterValue, setFilterValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "cards">(
    isMobile ? "cards" : "table"
  );
  const itemsPerPage = isMobile ? 5 : 10;

  // Filter data
  const filteredData = useMemo(() => {
    if (!filterValue) return data;

    return data.filter((item) =>
      columns.some((column) => {
        if (!column.filterable) return false;
        const value = item[column.key];
        return String(value).toLowerCase().includes(filterValue.toLowerCase());
      })
    );
  }, [data, filterValue, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, pagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (column: ColumnDef<T>) => {
    if (!column.sortable) return;

    if (sortColumn === column.key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column.key);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    // Placeholder for export functionality
    console.log("Export data:", sortedData);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
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

  // Mobile card view component
  const MobileCardView = () => (
    <div className="space-y-3">
      {paginatedData.map((row, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-2">
            {columns.slice(0, 4).map((column) => (
              <div
                key={String(column.key)}
                className="flex justify-between items-start"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {column.header}:
                </span>
                <div className="text-sm font-medium text-right flex-1 ml-2">
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] || "-")}
                </div>
              </div>
            ))}
            {columns.length > 4 && (
              <Button variant="ghost" size="sm" className="w-full mt-2">
                <MoreVertical className="h-4 w-4 mr-2" />
                View More
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <MobileResponsiveWrapper
      className="w-full"
      mobileClassName="w-full"
      desktopClassName="w-full"
    >
      <Card>
        <CardHeader>
          <div
            className={`flex ${isMobile ? "flex-col gap-3" : "items-center justify-between"}`}
          >
            <CardTitle className={isMobile ? "text-lg" : ""}>
              {title}
            </CardTitle>
            <div
              className={`flex gap-2 ${isMobile ? "flex-col" : "items-center"}`}
            >
              {filtering && (
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className={`pl-8 ${isMobile ? "w-full" : "w-64"}`}
                  />
                </div>
              )}
              <div
                className={`flex gap-2 ${isMobile ? "w-full" : "items-center"}`}
              >
                {isMobile && (
                  <div className="flex rounded-md border">
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="rounded-r-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "cards" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("cards")}
                      className="rounded-l-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {exportable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className={isMobile ? "flex-1" : ""}
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
          {isMobile && viewMode === "cards" ? (
            <MobileCardView />
          ) : (
            <div
              className={`rounded-md border ${isMobile ? "overflow-x-auto" : ""}`}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        key={String(column.key)}
                        className={cn(
                          column.sortable && "cursor-pointer hover:bg-muted/50",
                          isMobile && "text-xs px-2 py-3 min-w-[100px]"
                        )}
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={isMobile ? "text-xs" : ""}>
                            {column.header}
                          </span>
                          {column.sortable && (
                            <div className="flex flex-col">
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3",
                                  sortColumn === column.key &&
                                    sortDirection === "asc"
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )}
                              />
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 -mt-1",
                                  sortColumn === column.key &&
                                    sortDirection === "desc"
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, index) => (
                      <TableRow key={index}>
                        {columns.map((column) => (
                          <TableCell
                            key={String(column.key)}
                            className={isMobile ? "text-xs px-2 py-3" : ""}
                          >
                            {column.render
                              ? column.render(row[column.key], row)
                              : String(row[column.key] || "-")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination && totalPages > 1 && (
            <div
              className={`flex mt-4 ${isMobile ? "flex-col gap-3" : "items-center justify-between"}`}
            >
              <div
                className={`text-muted-foreground ${isMobile ? "text-xs text-center" : "text-sm"}`}
              >
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
                {sortedData.length} entries
              </div>
              <div
                className={`flex items-center gap-2 ${isMobile ? "justify-center" : ""}`}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={isMobile ? "flex-1" : ""}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {!isMobile && "Previous"}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(isMobile ? 3 : 5, totalPages) },
                    (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={isMobile ? "flex-1" : ""}
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
}
