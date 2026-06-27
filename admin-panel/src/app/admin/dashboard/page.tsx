"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import {
  MdBarChart,
  MdPeople,
  MdAdminPanelSettings,
  MdGroup,
  MdCheckCircle,
  MdBlock,
  MdError,
} from "react-icons/md";
import { API_BASE_URL, buildAuthHeaders } from "@/lib/api";

type QueryLog = {
  id?: string;
  user_email?: string | null;
  question?: string;
  generated_sql?: string | null;
  status?: string;
  error_message?: string | null;
  row_count?: number | null;
  result_json?: string | null;
  created_at?: string;
  createdAt?: string;
  timestamp?: string;
  date?: string;
};

type User = {
  id?: string;
  email?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
};

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Flex
      bg="white"
      borderRadius="20px"
      p="20px"
      align="center"
      boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
      minH="97px"
    >
      <Flex
        w="56px"
        h="56px"
        borderRadius="full"
        bg="#F4F7FE"
        align="center"
        justify="center"
        color="#4318FF"
        fontSize="26px"
        me="18px"
        flexShrink={0}
      >
        {icon}
      </Flex>

      <Box>
        <Text fontSize="sm" color="#A3AED0" fontWeight="500" mb="4px">
          {label}
        </Text>

        <Text fontSize="36px" lineHeight="100%" color="#1B2559" fontWeight="500">
          {value}
        </Text>
      </Box>
    </Flex>
  );
}

function normalizeStatus(status?: string | null) {
  return (status || "unknown").toLowerCase().trim();
}

function normalizeRole(role?: string | null) {
  return (role || "").toLowerCase().trim();
}

function parseLogDate(rawDate?: string): Date | null {
  if (!rawDate) return null;

  const normalDate = new Date(rawDate);
  if (!Number.isNaN(normalDate.getTime())) {
    return normalDate;
  }

  // Handles formats like: 07/05/2026, 14:46
  const match = rawDate.match(
    /^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})/,
  );

  if (match) {
    const [, day, month, year, hour, minute] = match;

    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

function getLogDate(log: QueryLog): Date | null {
  const rawDate = log.created_at || log.createdAt || log.timestamp || log.date;
  return parseLogDate(rawDate);
}

function getLast7DaysData(logs: QueryLog[]) {
  const today = new Date();

  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);

    return {
      date,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      count: 0,
    };
  });

  logs.forEach((log) => {
    const logDate = getLogDate(log);
    if (!logDate) return;

    logDate.setHours(0, 0, 0, 0);

    const matchingDay = days.find(
      (day) => day.date.getTime() === logDate.getTime(),
    );

    if (matchingDay) {
      matchingDay.count += 1;
    }
  });

  return days;
}

function getStatusBreakdown(logs: QueryLog[]) {
  const statuses = {
    success: 0,
    access_denied: 0,
    invalid: 0,
    error: 0,
    validation_failed: 0,
    execution_failed: 0,
    unknown: 0,
  };

  logs.forEach((log) => {
    const status = normalizeStatus(log.status);

    if (status in statuses) {
      statuses[status as keyof typeof statuses] += 1;
    } else {
      statuses.unknown += 1;
    }
  });

  return [
    { label: "Success", value: statuses.success },
    { label: "Blocked", value: statuses.access_denied },
    { label: "Invalid", value: statuses.invalid },
    {
      label: "Errors",
      value:
        statuses.error +
        statuses.validation_failed +
        statuses.execution_failed +
        statuses.unknown,
    },
  ];
}

function QueriesThisWeekCard({ logs }: { logs: QueryLog[] }) {
  const data = getLast7DaysData(logs);
  const maxValue = Math.max(...data.map((item) => item.count), 1);
  const totalThisWeek = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Box
      bg="white"
      borderRadius="20px"
      p="24px"
      boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
      minH="345px"
    >
      <Flex justify="space-between" align="center" mb="24px">
        <Box>
          <Text color="#1B2559" fontSize="30px" fontWeight="600" lineHeight="100%">
            Queries this week
          </Text>

          <Text color="#A3AED0" fontSize="sm" fontWeight="500" mt="8px">
            Total questions asked over the last 7 days
          </Text>
        </Box>

        <Flex
          w="37px"
          h="37px"
          borderRadius="10px"
          bg="#F4F7FE"
          align="center"
          justify="center"
          color="#4318FF"
          fontSize="22px"
        >
          <MdBarChart />
        </Flex>
      </Flex>

      <Text fontSize="34px" color="#1B2559" fontWeight="500" lineHeight="100%">
        {totalThisWeek}
      </Text>

      <Text color="#A3AED0" fontSize="sm" fontWeight="500" mt="8px" mb="28px">
        Total queries this week
      </Text>

      <Flex align="end" justify="space-between" h="160px" mt="10px">
        {data.map((item) => {
          const height =
            item.count === 0 ? 8 : Math.max((item.count / maxValue) * 100, 12);

          return (
            <Flex
              key={item.label}
              direction="column"
              align="center"
              justify="end"
              h="100%"
            >
              <Box
                w="22px"
                h={`${height}%`}
                bg="linear-gradient(180deg, #6AD2FF 0%, #4318FF 100%)"
                borderRadius="10px"
              />

              <Text mt="10px" fontSize="sm" color="#A3AED0" fontWeight="500">
                {item.label}
              </Text>

              <Text mt="2px" fontSize="xs" color="#1B2559" fontWeight="600">
                {item.count}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
}

function StatusBreakdownCard({ logs }: { logs: QueryLog[] }) {
  const data = getStatusBreakdown(logs);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Box
      bg="white"
      borderRadius="20px"
      p="24px"
      boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
      minH="345px"
    >
      <Flex justify="space-between" align="center" mb="24px">
        <Box>
          <Text color="#1B2559" fontSize="30px" fontWeight="600" lineHeight="100%">
            Status Breakdown
          </Text>

          <Text color="#A3AED0" fontSize="sm" fontWeight="500" mt="8px">
            SQL generation and security results
          </Text>
        </Box>

        <Flex
          w="37px"
          h="37px"
          borderRadius="10px"
          bg="#F4F7FE"
          align="center"
          justify="center"
          color="#4318FF"
          fontSize="22px"
        >
          <MdBarChart />
        </Flex>
      </Flex>

      <Text fontSize="34px" color="#1B2559" fontWeight="500" lineHeight="100%">
        {total}
      </Text>

      <Text color="#A3AED0" fontSize="sm" fontWeight="500" mt="8px" mb="28px">
        Total recorded queries
      </Text>

      <Flex direction="column" gap="18px">
        {data.map((item) => {
          const width =
            item.value === 0 ? 2 : Math.max((item.value / maxValue) * 100, 8);

          return (
            <Box key={item.label}>
              <Flex justify="space-between" mb="6px">
                <Text color="#1B2559" fontSize="sm" fontWeight="600">
                  {item.label}
                </Text>

                <Text color="#707EAE" fontSize="sm" fontWeight="600">
                  {item.value}
                </Text>
              </Flex>

              <Box bg="#F4F7FE" h="10px" borderRadius="full" overflow="hidden">
                <Box
                  h="100%"
                  w={`${width}%`}
                  bg="linear-gradient(90deg, #4318FF 0%, #6AD2FF 100%)"
                  borderRadius="full"
                />
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}

function extractLogsFromResponse(data: any): QueryLog[] {
  if (Array.isArray(data)) return data;

  const logs =
    data?.logs ||
    data?.query_logs ||
    data?.items ||
    data?.data ||
    data?.results ||
    [];

  return Array.isArray(logs) ? logs : [];
}

function extractUsersFromResponse(data: any): User[] {
  if (Array.isArray(data)) return data;

  const users =
    data?.users ||
    data?.items ||
    data?.data ||
    data?.results ||
    [];

  return Array.isArray(users) ? users : [];
}

export default function DashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [nonAdminUsers, setNonAdminUsers] = useState(0);
  const [queryLogs, setQueryLogs] = useState<QueryLog[]>([]);

  const successfulQueries = useMemo(
    () =>
      queryLogs.filter((log) => normalizeStatus(log.status) === "success")
        .length,
    [queryLogs],
  );

  const blockedQueries = useMemo(
    () =>
      queryLogs.filter((log) => normalizeStatus(log.status) === "access_denied")
        .length,
    [queryLogs],
  );

  const failedQueries = useMemo(
    () =>
      queryLogs.filter((log) =>
        ["invalid", "error", "validation_failed", "execution_failed"].includes(
          normalizeStatus(log.status),
        ),
      ).length,
    [queryLogs],
  );

  async function fetchUserStats() {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      setTotalUsers(142);
      setTotalAdmins(5);
      setNonAdminUsers(137);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: buildAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch user stats.");
      }

      const users = extractUsersFromResponse(data);

      setTotalUsers(users.length);
      setTotalAdmins(
        users.filter((user) => normalizeRole(user.role) === "admin").length,
      );
      setNonAdminUsers(
        users.filter((user) => normalizeRole(user.role) !== "admin").length,
      );
    } catch (err) {
      console.error("Error fetching user stats:", err);
      setTotalUsers(0);
      setTotalAdmins(0);
      setNonAdminUsers(0);
    }
  }

  async function fetchQueryLogs() {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      setQueryLogs([
        { id: 1, user_id: '1', email: 'admin@askdb.demo', query: 'Show all orders', sql_query: 'SELECT * FROM Orders;', status: 'success', created_at: new Date().toISOString() },
        { id: 2, user_id: '1', email: 'messi@gmail.com', query: 'Delete all customers', sql_query: '', status: 'access_denied', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, user_id: '2', email: 'stagiaire@company.com', query: 'Top 5 products', sql_query: 'SELECT TOP 5 * FROM Products;', status: 'success', created_at: new Date(Date.now() - 7200000).toISOString() }
      ] as any);
      return;
    }
    try {
      const endpoints = [`${API_BASE_URL}/query-logs`, `${API_BASE_URL}/admin/query-logs`];

      let finalLogs: QueryLog[] = [];
      let lastError: any = null;

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: buildAuthHeaders(),
          });

          const data = await res.json();

          console.log("DASHBOARD QUERY LOGS RESPONSE:", endpoint, data);

          if (!res.ok) {
            throw new Error(data.detail || `Failed to fetch query logs from ${endpoint}.`);
          }

          finalLogs = extractLogsFromResponse(data);

          if (finalLogs.length > 0) {
            break;
          }
        } catch (err) {
          lastError = err;
        }
      }

      if (!finalLogs.length && lastError) {
        console.warn("No query logs found from dashboard endpoints:", lastError);
      }

      setQueryLogs(finalLogs);
    } catch (err) {
      console.error("Error fetching query logs:", err);
      setQueryLogs([]);
    }
  }

  useEffect(() => {
    fetchUserStats();
    fetchQueryLogs();
  }, []);

  return (
    <Box pt="15px" px="0px">
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }}
        gap="20px"
        mb="20px"
      >
        <StatCard icon={<MdPeople />} label="Users" value={totalUsers} />

        <StatCard
          icon={<MdAdminPanelSettings />}
          label="Administrateurs"
          value={totalAdmins}
        />

        <StatCard
          icon={<MdGroup />}
          label="Non-admin users"
          value={nonAdminUsers}
        />

        <StatCard
          icon={<MdCheckCircle />}
          label="Successful queries"
          value={successfulQueries}
        />

        <StatCard
          icon={<MdBlock />}
          label="Blocked queries"
          value={blockedQueries}
        />

        <StatCard
          icon={<MdError />}
          label="Failed queries"
          value={failedQueries}
        />
      </Grid>

      <Grid templateColumns={{ base: "1fr", xl: "1.6fr 1fr" }} gap="20px">
        <GridItem>
          <QueriesThisWeekCard logs={queryLogs} />
        </GridItem>

        <GridItem>
          <StatusBreakdownCard logs={queryLogs} />
        </GridItem>
      </Grid>
    </Box>
  );
}