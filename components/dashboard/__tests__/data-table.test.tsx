import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DataTable } from "../data-table";

describe("DataTable Component", () => {
  const mockColumns = [
    {
      key: "title",
      label: "Title",
      sortable: true,
    },
    {
      key: "views",
      label: "Views",
      sortable: true,
      type: "number" as const,
    },
    {
      key: "contacts",
      label: "Contacts",
      sortable: true,
      type: "number" as const,
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      sortable: true,
      type: "percentage" as const,
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
    },
  ];

  const mockData = [
    {
      id: "1",
      title: "BMW 3 Series 2020",
      views: 1250,
      contacts: 65,
      conversionRate: 5.2,
      status: "active",
    },
    {
      id: "2",
      title: "Canon EOS R5 Camera",
      views: 890,
      contacts: 42,
      conversionRate: 4.7,
      status: "active",
    },
    {
      id: "3",
      title: "MacBook Pro 16-inch",
      views: 2100,
      contacts: 98,
      conversionRate: 4.67,
      status: "paused",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render table with data", () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Views")).toBeInTheDocument();
    expect(screen.getByText("Contacts")).toBeInTheDocument();
    expect(screen.getByText("Conversion Rate")).toBeInTheDocument();

    expect(screen.getByText("BMW 3 Series 2020")).toBeInTheDocument();
    expect(screen.getByText("1,250")).toBeInTheDocument();
    expect(screen.getByText("65")).toBeInTheDocument();
    expect(screen.getByText("5.2%")).toBeInTheDocument();
  });

  it("should handle sorting by column", () => {
    const onSort = vi.fn();
    render(<DataTable columns={mockColumns} data={mockData} onSort={onSort} />);

    const titleHeader = screen.getByText("Title");
    fireEvent.click(titleHeader);

    expect(onSort).toHaveBeenCalledWith("title", "asc");

    fireEvent.click(titleHeader);
    expect(onSort).toHaveBeenCalledWith("title", "desc");
  });

  it("should show sort indicators", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        sortBy="views"
        sortDirection="desc"
      />
    );

    const viewsHeader = screen.getByText("Views");
    expect(viewsHeader.closest("th")).toHaveClass("sorted-desc");
  });

  it("should handle row selection", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        selectable={true}
        onSelectionChange={onSelectionChange}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // First data row checkbox

    expect(onSelectionChange).toHaveBeenCalledWith(["1"]);
  });

  it("should handle select all", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        selectable={true}
        onSelectionChange={onSelectionChange}
      />
    );

    const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(selectAllCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith(["1", "2", "3"]);
  });

  it("should handle pagination", () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          currentPage: 1,
          totalPages: 3,
          pageSize: 10,
          totalItems: 25,
        }}
        onPageChange={onPageChange}
      />
    );

    const nextButton = screen.getByLabelText("Next page");
    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should show loading state", () => {
    render(<DataTable columns={mockColumns} data={[]} loading={true} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should show empty state", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
        emptyMessage="No listings found"
      />
    );

    expect(screen.getByText("No listings found")).toBeInTheDocument();
  });

  it("should handle row click", () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        onRowClick={onRowClick}
      />
    );

    const firstRow = screen.getByText("BMW 3 Series 2020").closest("tr");
    fireEvent.click(firstRow!);

    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it("should format different data types correctly", () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    // Number formatting
    expect(screen.getByText("1,250")).toBeInTheDocument();
    expect(screen.getByText("2,100")).toBeInTheDocument();

    // Percentage formatting
    expect(screen.getByText("5.2%")).toBeInTheDocument();
    expect(screen.getByText("4.7%")).toBeInTheDocument();
  });

  it("should handle custom cell rendering", () => {
    const customColumns = [
      ...mockColumns,
      {
        key: "actions",
        label: "Actions",
        render: (value: any, row: any) => (
          <button data-testid={`edit-${row.id}`}>Edit</button>
        ),
      },
    ];

    render(<DataTable columns={customColumns} data={mockData} />);

    expect(screen.getByTestId("edit-1")).toBeInTheDocument();
    expect(screen.getByTestId("edit-2")).toBeInTheDocument();
    expect(screen.getByTestId("edit-3")).toBeInTheDocument();
  });

  it("should handle filtering", () => {
    const onFilter = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        filterable={true}
        onFilter={onFilter}
      />
    );

    const filterInput = screen.getByPlaceholderText("Filter data...");
    fireEvent.change(filterInput, { target: { value: "BMW" } });

    expect(onFilter).toHaveBeenCalledWith("BMW");
  });

  it("should show row count and pagination info", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          currentPage: 1,
          totalPages: 3,
          pageSize: 10,
          totalItems: 25,
        }}
      />
    );

    expect(screen.getByText("Showing 1-3 of 25 items")).toBeInTheDocument();
  });

  it("should handle keyboard navigation", () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        onRowClick={onRowClick}
      />
    );

    const firstRow = screen.getByText("BMW 3 Series 2020").closest("tr");
    firstRow!.focus();

    fireEvent.keyDown(firstRow!, { key: "Enter" });
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);

    fireEvent.keyDown(firstRow!, { key: " " });
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });

  it("should handle column resizing", () => {
    const onColumnResize = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        resizable={true}
        onColumnResize={onColumnResize}
      />
    );

    const resizeHandle = screen.getAllByTestId("resize-handle")[0];
    fireEvent.mouseDown(resizeHandle);
    fireEvent.mouseMove(resizeHandle, { clientX: 150 });
    fireEvent.mouseUp(resizeHandle);

    expect(onColumnResize).toHaveBeenCalled();
  });

  it("should show column visibility controls", () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        showColumnControls={true}
      />
    );

    const columnButton = screen.getByLabelText("Column visibility");
    fireEvent.click(columnButton);

    expect(screen.getByText("Show/Hide Columns")).toBeInTheDocument();
  });

  it("should handle bulk actions", () => {
    const onBulkAction = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        selectable={true}
        bulkActions={[
          { label: "Delete", action: "delete" },
          { label: "Export", action: "export" },
        ]}
        onBulkAction={onBulkAction}
        selectedRows={["1", "2"]}
      />
    );

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(onBulkAction).toHaveBeenCalledWith("delete", ["1", "2"]);
  });

  it("should handle expandable rows", () => {
    const expandedContent = (row: any) => (
      <div data-testid={`expanded-${row.id}`}>
        Expanded content for {row.title}
      </div>
    );

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        expandable={true}
        renderExpandedRow={expandedContent}
      />
    );

    const expandButton = screen.getAllByLabelText("Expand row")[0];
    fireEvent.click(expandButton);

    expect(screen.getByTestId("expanded-1")).toBeInTheDocument();
  });

  it("should handle sticky headers", () => {
    render(
      <DataTable columns={mockColumns} data={mockData} stickyHeader={true} />
    );

    const headerRow = screen.getByRole("row");
    expect(headerRow).toHaveClass("sticky");
  });

  it("should show loading skeleton for individual cells", () => {
    const loadingData = mockData.map((row) => ({ ...row, loading: true }));

    render(
      <DataTable
        columns={mockColumns}
        data={loadingData}
        showLoadingSkeleton={true}
      />
    );

    expect(screen.getAllByTestId("loading-skeleton")).toHaveLength(15); // 3 rows × 5 columns
  });

  it("should handle error state for individual rows", () => {
    const errorData = [
      { ...mockData[0], error: "Failed to load" },
      ...mockData.slice(1),
    ];

    render(<DataTable columns={mockColumns} data={errorData} />);

    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });
});
