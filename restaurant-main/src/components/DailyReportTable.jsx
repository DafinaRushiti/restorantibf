import React, { useState, useRef } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Button, 
  Box,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useReactToPrint } from 'react-to-print';

const DailyReportTable = ({ reports = [], loading, error, date, onDateChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const componentRef = useRef();

  console.log('Daily report raw data:', reports);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Daily Sales Report - ${date}`,
  });

  // Make sure reports is an array and each report has valid values
  const safeReports = Array.isArray(reports) ? reports.map(report => {
    console.log('Processing report:', report);
    
    // Try to access data from different possible data structures
    let staffName = 'Unknown Staff';
    if (report?.staffName) {
      staffName = report.staffName;
    } else if (report?.User?.fullName) {
      staffName = report.User.fullName;
    }
    
    let staffRole = 'N/A';
    if (report?.staffRole) {
      staffRole = report.staffRole;
    } else if (report?.User?.role) {
      staffRole = report.User.role;
    }

    // Get order count from different possible locations
    let orderCount = 0;
    if (report?.orderCount !== undefined) {
      orderCount = Number(report.orderCount);
    } else if (report?.details?.orderCount !== undefined) {
      orderCount = Number(report.details.orderCount);
    } else if (report?.details?.orders && Array.isArray(report.details.orders)) {
      orderCount = report.details.orders.length;
    }

    // Get item count from different possible locations
    let itemCount = 0;
    if (report?.itemCount !== undefined) {
      itemCount = Number(report.itemCount);
    } else if (report?.details?.itemCount !== undefined) {
      itemCount = Number(report.details.itemCount);
    }

    // Ensure totalSales is a valid number
    let totalSales = 0;
    if (report?.totalSales !== undefined) {
      totalSales = Number(report.totalSales);
    }
    
    return {
      staffName,
      staffRole,
      orderCount,
      itemCount,
      totalSales
    };
  }) : [];

  console.log('Normalized reports:', safeReports);

  // Filter reports based on search term
  const filteredReports = safeReports.filter(report => 
    report.staffName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals - ensure we're working with numbers
  const totalSales = filteredReports.reduce((sum, report) => sum + Number(report.totalSales), 0);
  const totalOrders = filteredReports.reduce((sum, report) => sum + Number(report.orderCount), 0);
  const totalItems = filteredReports.reduce((sum, report) => sum + Number(report.itemCount), 0);

  // Helper function to format currency consistently
  const formatCurrency = (value) => {
    // Ensure value is a number before calling toFixed
    return `$${Number(value).toFixed(2)}`;
  };

  return (
    <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="div">
          Daily Sales Report
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 200 }}
          />
          <TextField
            placeholder="Search by Staff Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ width: 250 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print Report
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <div ref={componentRef}>
            <Box mb={2} mt={2} className="print-header" style={{ display: 'none' }}>
              <Typography variant="h5" textAlign="center" gutterBottom>
                Daily Sales Report
              </Typography>
              <Typography variant="subtitle1" textAlign="center" gutterBottom>
                Date: {date}
              </Typography>
            </Box>
            <TableContainer>
              <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Staff Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Staff Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Orders</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Items Sold</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Sales</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Commission</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell>{report.staffName}</TableCell>
                      <TableCell>{report.staffRole}</TableCell>
                      <TableCell>{report.orderCount}</TableCell>
                      <TableCell>{report.itemCount}</TableCell>
                      <TableCell>{formatCurrency(report.totalSales)}</TableCell>
                      <TableCell>{formatCurrency(report.totalSales * 0.05)}</TableCell>
                    </TableRow>
                  ))}
                  {filteredReports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No reports found for this date
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {filteredReports.length > 0 && (
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>TOTALS</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{totalOrders}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{totalItems}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(totalSales)}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(totalSales * 0.05)}</TableCell>
                    </TableRow>
                  </TableHead>
                )}
              </Table>
            </TableContainer>
          </div>
        </>
      )}

      <style jsx="true">{`
        @media print {
          .print-header {
            display: block !important;
          }
          @page {
            size: landscape;
            margin: 1cm;
          }
        }
      `}</style>
    </Paper>
  );
};

export default DailyReportTable; 