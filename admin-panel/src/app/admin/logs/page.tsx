"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  NativeSelect,
  Table,
  Text,
} from "@chakra-ui/react";
import {
  MdRefresh,
  MdHistory,
  MdTerminal,
  MdExpandMore,
  MdChevronRight,
} from "react-icons/md";
import { API_BASE_URL, buildAuthHeaders } from "@/lib/api";

type AdminLogItem = {
  id: string;
  user_email?: string | null;
  action: string;
  status: string;
  details?: string | null;
  created_at?: string | null;
};

type QueryResultJson = {
  columns?: string[];
  rows?: any[][];
  row_count?: number;
};

type QueryLogItem = {
  id: string;
  user_email?: string | null;
  question: string;
  generated_sql?: string | null;
  status: string;
  error_message?: string | null;
  row_count?: number | null;
  result_json?: string | null;
  created_at?: string | null;
};

function formatCreatedAt(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusStyle(status: string) {
  switch (status) {
    case "success":
      return { bg: "#E6FAF5", color: "#01B574" };
    case "validation_failed":
    case "execution_failed":
    case "failed":
    case "llm_failed":
    case "invalid_query":
      return { bg: "#FEEFEE", color: "#EE5D50" };
    default:
      return { bg: "#F4F7FE", color: "#4318FF" };
  }
}

function getActionStyle(action: string) {
  switch (action) {
    case "login":
      return { bg: "#E6FAF5", color: "#01B574" };
    case "logout":
      return { bg: "#FFF6DA", color: "#FFB547" };
    case "register":
      return { bg: "#EFF4FB", color: "#3965FF" };
    case "delete_user":
      return { bg: "#FEEFEE", color: "#EE5D50" };
    default:
      return { bg: "#F4F7FE", color: "#4318FF" };
  }
}

function SectionShell({
  title,
  icon,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Box
      bg="white"
      borderRadius="20px"
      p="24px"
      boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
      w="100%"
    >
      <Flex align="center" justify="space-between" cursor="pointer" onClick={onToggle}>
        <Flex align="center">
          <Flex
            w="42px"
            h="42px"
            borderRadius="12px"
            bg="#F4F7FE"
            align="center"
            justify="center"
            color="#4318FF"
            fontSize="22px"
            me="12px"
          >
            {icon}
          </Flex>

          <Box>
            <Text color="#1B2559" fontSize="22px" fontWeight="700">
              {title}
            </Text>
            <Text color="#A3AED0" fontSize="13px" mt="2px">
              {count} élément{count === 1 ? "" : "s"}
            </Text>
          </Box>
        </Flex>

        <Flex
          w="38px"
          h="38px"
          borderRadius="12px"
          bg="#F4F7FE"
          align="center"
          justify="center"
          color="#4318FF"
          fontSize="24px"
        >
          {open ? <MdExpandMore /> : <MdChevronRight />}
        </Flex>
      </Flex>

      {open ? <Box mt="20px">{children}</Box> : null}
    </Box>
  );
}

function AdminLogRow({ log }: { log: AdminLogItem }) {
  const actionStyle = getActionStyle(log.action);
  const statusStyle = getStatusStyle(log.status);

  return (
    <Flex
      align="center"
      justify="space-between"
      p="18px"
      borderRadius="18px"
      bg="#FAFCFE"
      border="1px solid #E9EDF7"
      gap="16px"
      wrap="wrap"
    >
      <Flex direction="column" minW="240px" flex="1">
        <Text color="#1B2559" fontSize="15px" fontWeight="600">
          {log.user_email || "Utilisateur inconnu"}
        </Text>
        <Text color="#707EAE" fontSize="13px" mt="4px">
          {log.details || "Aucun détail"}
        </Text>
      </Flex>

      <Flex align="center" gap="12px" flexWrap="wrap">
        <Box
          px="12px"
          py="8px"
          borderRadius="999px"
          bg={actionStyle.bg}
          color={actionStyle.color}
          fontSize="13px"
          fontWeight="600"
          textTransform="capitalize"
        >
          {log.action}
        </Box>

        <Box
          px="12px"
          py="8px"
          borderRadius="999px"
          bg={statusStyle.bg}
          color={statusStyle.color}
          fontSize="13px"
          fontWeight="600"
          textTransform="capitalize"
        >
          {log.status}
        </Box>

        <Text color="#A3AED0" fontSize="13px" minW="145px" textAlign="right">
          {formatCreatedAt(log.created_at)}
        </Text>
      </Flex>
    </Flex>
  );
}

function ResultTable({ result }: { result: QueryResultJson }) {
  const columns = result.columns || [];
  const rows = result.rows || [];

  if (!columns.length || !rows.length) {
    return (
      <Text color="#707EAE" fontSize="13px">
        Aucun tableau d’exécution disponible.
      </Text>
    );
  }

  return (
    <Box
      bg="white"
      border="1px solid #E9EDF7"
      borderRadius="12px"
      p="12px"
      overflowX="auto"
    >
      <Table.Root size="sm" variant="line">
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.ColumnHeader key={column} color="#1B2559">
                {column}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, rowIndex) => (
            <Table.Row key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <Table.Cell key={`${rowIndex}-${cellIndex}`} color="#1B2559">
                  {cell === null || cell === undefined ? "-" : String(cell)}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

function QueryLogRow({ log }: { log: QueryLogItem }) {
  const [open, setOpen] = useState(false);
  const statusStyle = getStatusStyle(log.status);

  let parsedResult: QueryResultJson | null = null;
  if (log.result_json) {
    try {
      parsedResult = JSON.parse(log.result_json);
    } catch {
      parsedResult = null;
    }
  }

  return (
    <Box
      p="18px"
      borderRadius="18px"
      bg="#FAFCFE"
      border="1px solid #E9EDF7"
    >
      <Flex justify="space-between" align="start" gap="16px" wrap="wrap">
        <Box flex="1" minW="260px">
          <Text color="#1B2559" fontSize="15px" fontWeight="600">
            {log.user_email || "Utilisateur inconnu"}
          </Text>
          <Text color="#1B2559" fontSize="14px" mt="8px" fontWeight="500">
            {log.question}
          </Text>
        </Box>

        <Flex align="center" gap="12px" flexWrap="wrap">
          <Box
            px="12px"
            py="8px"
            borderRadius="999px"
            bg={statusStyle.bg}
            color={statusStyle.color}
            fontSize="13px"
            fontWeight="600"
            textTransform="capitalize"
          >
            {log.status}
          </Box>

          <Box
            px="12px"
            py="8px"
            borderRadius="999px"
            bg="#F4F7FE"
            color="#4318FF"
            fontSize="13px"
            fontWeight="600"
          >
            lignes : {log.row_count ?? 0}
          </Box>

          <Text color="#A3AED0" fontSize="13px" minW="145px" textAlign="right">
            {formatCreatedAt(log.created_at)}
          </Text>

          <Button
            size="sm"
            bg="#F4F7FE"
            color="#4318FF"
            borderRadius="12px"
            _hover={{ bg: "#E9EDF7" }}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <MdExpandMore /> : <MdChevronRight />}
          </Button>
        </Flex>
      </Flex>

      {open ? (
        <Box mt="14px">
          <Box mt="10px">
            <Text color="#707EAE" fontSize="12px" fontWeight="600" mb="6px">
              SQL généré
            </Text>
            <Box
              bg="white"
              border="1px solid #E9EDF7"
              borderRadius="12px"
              p="12px"
              overflowX="auto"
            >
              <Text
                color="#1B2559"
                fontSize="13px"
                whiteSpace="pre-wrap"
                fontFamily="monospace"
              >
                {log.generated_sql || "Aucun SQL généré"}
              </Text>
            </Box>
          </Box>

          {log.error_message ? (
            <Box mt="10px">
              <Text color="#EE5D50" fontSize="12px" fontWeight="600" mb="6px">
                Erreur
              </Text>
              <Box
                bg="#FFF5F5"
                border="1px solid #FEEFEE"
                borderRadius="12px"
                p="12px"
              >
                <Text color="#EE5D50" fontSize="13px">
                  {log.error_message}
                </Text>
              </Box>
            </Box>
          ) : null}

          <Box mt="10px">
            <Text color="#707EAE" fontSize="12px" fontWeight="600" mb="6px">
              Résultat exécuté
            </Text>
            {parsedResult ? (
              <ResultTable result={parsedResult} />
            ) : (
              <Text color="#707EAE" fontSize="13px">
                Aucun tableau d’exécution disponible.
              </Text>
            )}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

export default function LogsPage() {
  const [adminLogs, setAdminLogs] = useState<AdminLogItem[]>([]);
  const [queryLogs, setQueryLogs] = useState<QueryLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activityOpen, setActivityOpen] = useState(false);
  const [queryOpen, setQueryOpen] = useState(true);

  const [activitySearch, setActivitySearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");

  const [activityActionFilter, setActivityActionFilter] = useState("all");
  const [activityStatusFilter, setActivityStatusFilter] = useState("all");

  const [queryStatusFilter, setQueryStatusFilter] = useState("all");
  const [queryUserFilter, setQueryUserFilter] = useState("all");

  const [activitySort, setActivitySort] = useState("newest");
  const [querySort, setQuerySort] = useState("newest");

  async function fetchAllLogs() {
    try {
      setLoading(true);
      setError("");

      const [adminResponse, queryResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/logs`, {
          method: "GET",
          headers: buildAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/admin/query-logs`, {
          method: "GET",
          headers: buildAuthHeaders(),
        }),
      ]);

      const adminData = await adminResponse.json();
      const queryData = await queryResponse.json();

      if (!adminResponse.ok) {
        throw new Error(adminData.detail || "Échec de la récupération des journaux d’activité.");
      }

      if (!queryResponse.ok) {
        throw new Error(queryData.detail || "Échec de la récupération des journaux de requêtes.");
      }

      setAdminLogs(adminData.logs || []);
      setQueryLogs(queryData.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la récupération des journaux.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllLogs();
  }, []);

  const queryUsers = useMemo(() => {
    const emails = Array.from(
      new Set(
        queryLogs
          .map((log) => (log.user_email || "").trim())
          .filter(Boolean)
      )
    );
    return emails.sort((a, b) => a.localeCompare(b));
  }, [queryLogs]);

  const filteredAdminLogs = useMemo(() => {
    let items = [...adminLogs];

    if (activitySearch.trim()) {
      const q = activitySearch.toLowerCase();
      items = items.filter(
        (log) =>
          (log.user_email || "").toLowerCase().includes(q) ||
          (log.action || "").toLowerCase().includes(q) ||
          (log.details || "").toLowerCase().includes(q)
      );
    }

    if (activityActionFilter !== "all") {
      items = items.filter((log) => log.action === activityActionFilter);
    }

    if (activityStatusFilter !== "all") {
      items = items.filter((log) => log.status === activityStatusFilter);
    }

    items.sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return activitySort === "newest" ? bDate - aDate : aDate - bDate;
    });

    return items;
  }, [adminLogs, activitySearch, activityActionFilter, activityStatusFilter, activitySort]);

  const filteredQueryLogs = useMemo(() => {
    let items = [...queryLogs];

    if (querySearch.trim()) {
      const q = querySearch.toLowerCase();
      items = items.filter(
        (log) =>
          (log.user_email || "").toLowerCase().includes(q) ||
          (log.question || "").toLowerCase().includes(q) ||
          (log.generated_sql || "").toLowerCase().includes(q) ||
          (log.error_message || "").toLowerCase().includes(q)
      );
    }

    if (queryStatusFilter !== "all") {
      items = items.filter((log) => log.status === queryStatusFilter);
    }

    if (queryUserFilter !== "all") {
      items = items.filter((log) => (log.user_email || "") === queryUserFilter);
    }

    items.sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return querySort === "newest" ? bDate - aDate : aDate - bDate;
    });

    return items;
  }, [queryLogs, querySearch, queryStatusFilter, queryUserFilter, querySort]);

  return (
    <Box px="0px">
      {error ? (
        <Box
          mb="20px"
          p="16px"
          borderRadius="16px"
          bg="#FEEFEE"
          color="#E31A1A"
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
        >
          {error}
        </Box>
      ) : null}

      <Flex direction="column" gap="20px" pt="15px">
        <SectionShell
          title="Journaux d’activité"
          icon={<MdHistory />}
          count={filteredAdminLogs.length}
          open={activityOpen}
          onToggle={() => setActivityOpen((prev) => !prev)}
        >
          <Flex justify="space-between" gap="12px" wrap="wrap" mb="18px">
            <Flex gap="12px" wrap="wrap" flex="1">
              <Input
                placeholder="Rechercher..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                maxW="280px"
                h="42px"
                borderRadius="14px"
                borderColor="#E9EDF7"
              />

              <NativeSelect.Root maxW="170px">
                <NativeSelect.Field
                  value={activityActionFilter}
                  onChange={(e) => setActivityActionFilter(e.target.value)}
                  h="42px"
                  borderRadius="14px"
                  borderColor="#E9EDF7"
                >
                  <option value="all">Toutes les actions</option>
                  <option value="login">login</option>
                  <option value="logout">logout</option>
                  <option value="register">register</option>
                  <option value="delete_user">delete_user</option>
                </NativeSelect.Field>
              </NativeSelect.Root>

              <NativeSelect.Root maxW="170px">
                <NativeSelect.Field
                  value={activityStatusFilter}
                  onChange={(e) => setActivityStatusFilter(e.target.value)}
                  h="42px"
                  borderRadius="14px"
                  borderColor="#E9EDF7"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="success">success</option>
                  <option value="failed">failed</option>
                </NativeSelect.Field>
              </NativeSelect.Root>

              <NativeSelect.Root maxW="170px">
                <NativeSelect.Field
                  value={activitySort}
                  onChange={(e) => setActivitySort(e.target.value)}
                  h="42px"
                  borderRadius="14px"
                  borderColor="#E9EDF7"
                >
                  <option value="newest">Plus récents d’abord</option>
                  <option value="oldest">Plus anciens d’abord</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Flex>

            <Button
              bg="#4318FF"
              color="white"
              borderRadius="16px"
              px="18px"
              h="42px"
              _hover={{ bg: "#3311DB" }}
              onClick={fetchAllLogs}
            >
              <MdRefresh style={{ marginRight: 8 }} />
              Actualiser
            </Button>
          </Flex>

          {loading ? (
            <Text color="#707EAE">Chargement des journaux d’activité...</Text>
          ) : filteredAdminLogs.length === 0 ? (
            <Text color="#707EAE">Aucun journal d’activité trouvé.</Text>
          ) : (
            <Flex direction="column" gap="14px">
              {filteredAdminLogs.map((log) => (
                <AdminLogRow key={log.id} log={log} />
              ))}
            </Flex>
          )}
        </SectionShell>

        <SectionShell
          title="Journaux des requêtes"
          icon={<MdTerminal />}
          count={filteredQueryLogs.length}
          open={queryOpen}
          onToggle={() => setQueryOpen((prev) => !prev)}
        >
          <Flex justify="space-between" gap="12px" wrap="wrap" mb="18px">
            <Flex gap="12px" wrap="wrap" flex="1">
              <Input
                placeholder="Rechercher ..."
                value={querySearch}
                onChange={(e) => setQuerySearch(e.target.value)}
                maxW="280px"
                h="42px"
                borderRadius="14px"
                borderColor="#E9EDF7"
              />

              <NativeSelect.Root maxW="190px">
                <NativeSelect.Field
                  value={queryUserFilter}
                  onChange={(e) => setQueryUserFilter(e.target.value)}
                  h="42px"
                  borderRadius="14px"
                  borderColor="#E9EDF7"
                >
                  <option value="all">Tous les utilisateurs</option>
                  {queryUsers.map((email) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>

              <NativeSelect.Root maxW="170px">
                <NativeSelect.Field
                  value={queryStatusFilter}
                  onChange={(e) => setQueryStatusFilter(e.target.value)}
                  h="42px"
                  borderRadius="14px"
                  borderColor="#E9EDF7"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="success">success</option>
                  <option value="validation_failed">validation_failed</option>
                  <option value="execution_failed">execution_failed</option>
                  <option value="invalid_query">invalid_query</option>
                  <option value="llm_failed">llm_failed</option>
                </NativeSelect.Field>
              </NativeSelect.Root>

              <NativeSelect.Root maxW="170px">
                <NativeSelect.Field
                  value={querySort}
                  onChange={(e) => setQuerySort(e.target.value)}
                  h="42px"
                  borderRadius="14px"
                  borderColor="#E9EDF7"
                >
                  <option value="newest">Plus récents d’abord</option>
                  <option value="oldest">Plus anciens d’abord</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Flex>

            <Button
              bg="#4318FF"
              color="white"
              borderRadius="16px"
              px="18px"
              h="42px"
              _hover={{ bg: "#3311DB" }}
              onClick={fetchAllLogs}
            >
              <MdRefresh style={{ marginRight: 8 }} />
              Actualiser
            </Button>
          </Flex>

          {loading ? (
            <Text color="#707EAE">Chargement des journaux des requêtes...</Text>
          ) : filteredQueryLogs.length === 0 ? (
            <Text color="#707EAE">Aucun journal de requête trouvé.</Text>
          ) : (
            <Flex direction="column" gap="14px">
              {filteredQueryLogs.map((log) => (
                <QueryLogRow key={log.id} log={log} />
              ))}
            </Flex>
          )}
        </SectionShell>
      </Flex>
    </Box>
  );
}