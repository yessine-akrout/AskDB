'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { MdSearch, MdArrowDownward, MdArrowUpward } from 'react-icons/md';

type ResultTableProps = {
  columns: string[];
  rows: (string | number | null)[][];
};

export default function ResultTable({ columns, rows }: ResultTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleRows, setVisibleRows] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: number; direction: 'asc' | 'desc' } | null>(null);

  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const tableHeaderBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const tableTextColor = useColorModeValue('#1A202C', '#FFFFFF');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const lowerSearch = searchTerm.toLowerCase();
    return rows.filter((row) =>
      row.some((cell) => cell !== null && cell !== undefined && String(cell).toLowerCase().includes(lowerSearch))
    );
  }, [rows, searchTerm]);

  // Sort rows
  const sortedRows = useMemo(() => {
    let sortableRows = [...filteredRows];
    if (sortConfig !== null) {
      sortableRows.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bVal === null || bVal === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableRows;
  }, [filteredRows, sortConfig]);

  const displayedRows = sortedRows.slice(0, visibleRows);

  const handleSort = (index: number) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === index && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: index, direction });
  };

  if (!columns.length || !rows.length) {
    return (
      <Box p="16px" border="1px dashed" borderColor={borderColor} borderRadius="12px" textAlign="center">
        <Text color="gray.500" fontSize="sm">No rows returned.</Text>
      </Box>
    );
  }

  return (
    <Box border="1px solid" borderColor={borderColor} borderRadius="12px" overflow="hidden" bg="transparent" mt="10px">
      {/* Header */}
      <Flex justify="space-between" align="center" p="16px" borderBottom="1px solid" borderColor={borderColor}>
        <Text color={textColor} fontSize="sm" fontWeight="600">
          Results ({filteredRows.length} rows)
        </Text>
        <Flex align="center" bg={useColorModeValue('white', 'gray.800')} borderRadius="8px" border="1px solid" borderColor={borderColor} px="12px" py="6px">
          <Icon as={MdSearch} color="gray.400" me="8px" />
          <Input
            variant="unstyled"
            placeholder="Search..."
            fontSize="sm"
            size="sm"
            w={{ base: '100px', md: '180px' }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setVisibleRows(10); }}
          />
        </Flex>
      </Flex>

      {/* Table */}
      <TableContainer maxH="400px" overflowY="auto">
        <Table variant="simple" size="sm">
          <Thead position="sticky" top={0} bg={tableHeaderBg} zIndex={1} boxShadow="sm">
            <Tr>
              {columns.map((col, index) => (
                <Th 
                  key={index} 
                  cursor="pointer" 
                  onClick={() => handleSort(index)}
                  color="gray.500"
                  textTransform="none"
                  fontSize="xs"
                  fontWeight="600"
                  py="12px"
                  borderColor={borderColor}
                >
                  <Flex align="center">
                    {col}
                    {sortConfig?.key === index ? (
                      <Icon as={sortConfig.direction === 'asc' ? MdArrowUpward : MdArrowDownward} ms="4px" />
                    ) : (
                      <Box w="14px" /> /* Spacer */
                    )}
                  </Flex>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {displayedRows.length > 0 ? (
              displayedRows.map((row, rowIndex) => (
                <Tr key={rowIndex} _hover={{ bg: hoverBg }}>
                  {row.map((cell, cellIndex) => (
                    <Td 
                      key={cellIndex} 
                      color={tableTextColor}
                      fontSize="sm"
                      py="10px"
                      borderColor={borderColor}
                      whiteSpace="nowrap"
                    >
                      {cell !== null && cell !== undefined ? String(cell) : 'NULL'}
                    </Td>
                  ))}
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={columns.length} textAlign="center" py="20px" color="gray.500" borderColor="transparent">
                  No results found for "{searchTerm}"
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Footer / Pagination */}
      {visibleRows < filteredRows.length && (
        <Flex justify="center" p="12px" borderTop="1px solid" borderColor={borderColor} bg={tableHeaderBg}>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setVisibleRows((prev) => prev + 20)}
            borderColor={borderColor}
            _hover={{ bg: hoverBg }}
          >
            Show more
          </Button>
        </Flex>
      )}
    </Box>
  );
}
