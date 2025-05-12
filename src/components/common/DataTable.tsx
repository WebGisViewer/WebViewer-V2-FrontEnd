/* src/components/common/DataTable.tsx */
import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Pagination,
    Skeleton,
    TablePagination,
    Checkbox,
    Toolbar,
    alpha,
    Chip,
    Tooltip,
    LinearProgress,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Delete as DeleteIcon,
    FilterAlt as FilterAltIcon,
    Sort as SortIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';

// Define column type for the data table
export interface Column<T = any> {
    id: string;
    label: string;
    minWidth?: number;
    maxWidth?: number;
    align?: 'left' | 'right' | 'center';
    format?: (value: any, row: T) => React.ReactNode;
    disablePadding?: boolean;
    disableSorting?: boolean;
    hidden?: boolean;
}

interface DataTableProps<T = any> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    rowsPerPageOptions?: number[];
    defaultRowsPerPage?: number;
    totalCount?: number;
    paginated?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    selectedRows?: string[];
    selectable?: boolean;
    onSelectRows?: (selectedIds: string[]) => void;
    getRowId?: (row: T) => string;
    onRowClick?: (row: T) => void;
    onPageChange?: (page: number) => void;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
    onSearch?: (searchTerm: string) => void;
    onSort?: (property: string, direction: 'asc' | 'desc') => void;
    actions?: React.ReactNode;
    emptyContent?: React.ReactNode;
    currentPage?: number;
    stickyHeader?: boolean;
    showTablePagination?: boolean;
    title?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    toolbarActions?: React.ReactNode;
}

/**
 * Reusable data table component with sorting, filtering, and pagination
 */
function DataTable<T extends Record<string, any>>({
                                                      columns,
                                                      data,
                                                      loading = false,
                                                      rowsPerPageOptions = [10, 25, 50, 100],
                                                      defaultRowsPerPage = 10,
                                                      totalCount,
                                                      paginated = false,
                                                      searchable = false,
                                                      searchPlaceholder = 'Search...',
                                                      selectedRows = [],
                                                      selectable = false,
                                                      onSelectRows,
                                                      getRowId = (row: T) => row.id?.toString() || '',
                                                      onRowClick,
                                                      onPageChange,
                                                      onRowsPerPageChange,
                                                      onSearch,
                                                      onSort,
                                                      actions,
                                                      emptyContent,
                                                      currentPage = 1,
                                                      stickyHeader = true,
                                                      showTablePagination = false,
                                                      title,
                                                      sortBy,
                                                      sortDirection = 'asc',
                                                      toolbarActions,
                                                  }: DataTableProps<T>) {
    const [page, setPage] = useState(currentPage);
    const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
    const [searchTerm, setSearchTerm] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>(sortDirection);
    const [orderBy, setOrderBy] = useState<string>(sortBy || '');
    const [selected, setSelected] = useState<string[]>(selectedRows);

    // Calculate the total rows for client-side pagination
    const totalRows = totalCount || data.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    // Calculate displayed rows for client-side pagination
    const displayedRows = paginated && !onPageChange
        ? data.slice((page - 1) * rowsPerPage, page * rowsPerPage)
        : data;

    // Handle sort request
    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        const newDirection = isAsc ? 'desc' : 'asc';
        setOrder(newDirection);
        setOrderBy(property);

        if (onSort) {
            onSort(property, newDirection);
        }
    };

    // Handle search input
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
        setPage(1); // Reset to first page on search

        if (onSearch) {
            onSearch(value);
        }
    };

    // Handle page change
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        if (showTablePagination) {
            setPage(newPage + 1);
            if (onPageChange) {
                onPageChange(newPage + 1);
            }
        } else {
            setPage(newPage);
            if (onPageChange) {
                onPageChange(newPage);
            }
        }
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(1); // Reset to first page

        if (onRowsPerPageChange) {
            onRowsPerPageChange(newRowsPerPage);
        }
    };

    // Handle row selection
    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = data.map((row) => getRowId(row));
            setSelected(newSelected);
            if (onSelectRows) {
                onSelectRows(newSelected);
            }
            return;
        }
        setSelected([]);
        if (onSelectRows) {
            onSelectRows([]);
        }
    };

    // Handle single row selection
    const handleRowSelect = (event: React.MouseEvent<HTMLTableRowElement>, id: string) => {
        if (!selectable) return;

        event.stopPropagation();
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = [...selected, id];
        } else {
            newSelected = selected.filter((item) => item !== id);
        }

        setSelected(newSelected);
        if (onSelectRows) {
            onSelectRows(newSelected);
        }
    };

    // Handle row click
    const handleRowClick = (row: T) => {
        if (onRowClick) {
            onRowClick(row);
        }
    };

    // Check if a row is selected
    const isSelected = (id: string) => selected.indexOf(id) !== -1;

    // Render loading skeleton rows
    const renderLoadingRows = () => {
        return Array.from({ length: rowsPerPage }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
                {selectable && (
                    <TableCell padding="checkbox">
                        <Skeleton variant="rectangular" width={24} height={24} />
                    </TableCell>
                )}
                {columns.filter(col => !col.hidden).map((column) => (
                    <TableCell key={`skeleton-cell-${column.id}-${index}`}>
                        <Skeleton variant="text" />
                    </TableCell>
                ))}
                {actions && (
                    <TableCell>
                        <Skeleton variant="rectangular" width={80} height={36} />
                    </TableCell>
                )}
            </TableRow>
        ));
    };

    // Render empty state
    const renderEmptyState = () => {
        return (
            <TableRow>
                <TableCell
                    colSpan={columns.filter(col => !col.hidden).length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                    align="center"
                    sx={{ py: 6 }}
                >
                    {emptyContent ? (
                        emptyContent
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="body1" color="text.secondary">
                                No data to display
                            </Typography>
                            {searchTerm && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Try adjusting your search criteria
                                </Typography>
                            )}
                        </Box>
                    )}
                </TableCell>
            </TableRow>
        );
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
            {(title || searchable || toolbarActions || selected.length > 0) && (
                <Toolbar
                    sx={{
                        pl: { sm: 2 },
                        pr: { xs: 1, sm: 1 },
                        ...(selected.length > 0 && {
                            bgcolor: (theme) =>
                                alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                        }),
                    }}
                >
                    {selected.length > 0 ? (
                        <Typography
                            sx={{ flex: '1 1 100%' }}
                            color="inherit"
                            variant="subtitle1"
                            component="div"
                        >
                            {selected.length} selected
                        </Typography>
                    ) : (
                        <>
                            {title && (
                                <Typography
                                    sx={{ flex: '1 1 100%' }}
                                    variant="h6"
                                    id="tableTitle"
                                    component="div"
                                >
                                    {title}
                                </Typography>
                            )}

                            {searchable && (
                                <Box sx={{ flex: '1 1 100%' }}>
                                    <TextField
                                        size="small"
                                        placeholder={searchPlaceholder}
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                            endAdornment: searchTerm && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            if (onSearch) onSearch('');
                                                        }}
                                                        edge="end"
                                                    >
                                                        <Chip
                                                            label="Clear"
                                                            size="small"
                                                            onDelete={() => {
                                                                setSearchTerm('');
                                                                if (onSearch) onSearch('');
                                                            }}
                                                        />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        fullWidth
                                    />
                                </Box>
                            )}
                        </>
                    )}

                    {selected.length > 0 ? (
                        <Tooltip title="Delete">
                            <IconButton>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        toolbarActions
                    )}
                </Toolbar>
            )}

            {loading && <LinearProgress />}

            <TableContainer sx={{ maxHeight: stickyHeader ? 600 : 'auto' }}>
                <Table stickyHeader={stickyHeader} aria-label="data table">
                    <TableHead>
                        <TableRow>
                            {selectable && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        indeterminate={selected.length > 0 && selected.length < data.length}
                                        checked={data.length > 0 && selected.length === data.length}
                                        onChange={handleSelectAllClick}
                                        inputProps={{
                                            'aria-label': 'select all',
                                        }}
                                    />
                                </TableCell>
                            )}

                            {columns.filter(col => !col.hidden).map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align || 'left'}
                                    style={{
                                        minWidth: column.minWidth,
                                        maxWidth: column.maxWidth,
                                        padding: column.disablePadding ? '16px 0' : undefined,
                                    }}
                                    sortDirection={orderBy === column.id ? order : false}
                                >
                                    {column.disableSorting ? (
                                        column.label
                                    ) : (
                                        <TableSortLabel
                                            active={orderBy === column.id}
                                            direction={orderBy === column.id ? order : 'asc'}
                                            onClick={() => handleRequestSort(column.id)}
                                        >
                                            {column.label}
                                        </TableSortLabel>
                                    )}
                                </TableCell>
                            ))}

                            {actions && <TableCell align="right">Actions</TableCell>}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            renderLoadingRows()
                        ) : displayedRows.length > 0 ? (
                            displayedRows.map((row, index) => {
                                const id = getRowId(row);
                                const isRowSelected = selectable && isSelected(id);

                                return (
                                    <TableRow
                                        hover
                                        onClick={() => handleRowClick(row)}
                                        role="checkbox"
                                        aria-checked={isRowSelected}
                                        tabIndex={-1}
                                        key={id || index}
                                        selected={isRowSelected}
                                        sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                    >
                                        {selectable && (
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    color="primary"
                                                    checked={isRowSelected}
                                                    onClick={(event) => handleRowSelect(event as any, id)}
                                                />
                                            </TableCell>
                                        )}

                                        {columns.filter(col => !col.hidden).map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell
                                                    key={`${id}-${column.id}`}
                                                    align={column.align || 'left'}
                                                    style={{
                                                        maxWidth: column.maxWidth,
                                                        padding: column.disablePadding ? '16px 0' : undefined,
                                                    }}
                                                >
                                                    {column.format ? column.format(value, row) : value}
                                                </TableCell>
                                            );
                                        })}

                                        {actions && (
                                            <TableCell align="right">
                                                {typeof actions === 'function' ? actions(row) : actions}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        ) : (
                            renderEmptyState()
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {paginated && (
                showTablePagination ? (
                    <TablePagination
                        rowsPerPageOptions={rowsPerPageOptions}
                        component="div"
                        count={totalRows}
                        rowsPerPage={rowsPerPage}
                        page={page - 1}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            px: 2,
                            py: 2,
                            borderTop: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Showing {Math.min((page - 1) * rowsPerPage + 1, totalRows)} - {Math.min(page * rowsPerPage, totalRows)} of {totalRows} items
                        </Typography>

                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(event, page) => handleChangePage(null, page)}
                            shape="rounded"
                            color="primary"
                            size="small"
                        />
                    </Box>
                )
            )}
        </Paper>
    );
}

export default DataTable;