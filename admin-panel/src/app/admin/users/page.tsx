"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  NativeSelect,
  Text,
  Image,
} from "@chakra-ui/react";
import { MdAdd, MdDeleteOutline, MdRefresh, MdPeople } from "react-icons/md";
import { API_BASE_URL, buildAuthHeaders } from "@/lib/api";

type User = {
  id: string;
  email: string;
  role: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
};

type CreateUserForm = {
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
};

const initialForm: CreateUserForm = {
  email: "",
  password: "",
  role: "stagiaire",
  first_name: "",
  last_name: "",
  avatar_url: "",
};

function normalizeAvatarUrl(url?: string | null) {
  if (!url) return "";

  let value = url.trim();
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  value = value.replace(/\\/g, "/");

  if (value.startsWith("/")) {
    return value;
  }

  const fileName = value.split("/").pop() || "";
  if (fileName && /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(fileName)) {
    return `/img/users/${fileName}`;
  }

  return "";
}

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

function formatRole(role: string) {
  const labels: Record<string, string> = {
    stagiaire: "Stagiaire",
    directeur: "Directeur",
    admin: "Admin",
  };

  return labels[role] || role;
}

function getRoleStyle(role: string) {
  if (role === "admin") {
    return {
      bg: "#F2EFFF",
      color: "#4318FF",
    };
  }

  if (role === "directeur") {
    return {
      bg: "#EAFBF1",
      color: "#05CD99",
    };
  }
  if (role === "stagiaire") {
    return {
      bg: "#FFF4E5",
      color: "#FF8A00",
    };
  }

  return {
    bg: "#EFF4FB",
    color: "#3965FF",
  };
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
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
      <Flex align="center" mb="20px">
        {icon ? (
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
        ) : null}

        <Text color="#1B2559" fontSize="22px" fontWeight="700">
          {title}
        </Text>
      </Flex>
      {children}
    </Box>
  );
}

function UserRow({
  user,
  deleting,
  onDelete,
}: {
  user: User;
  deleting: boolean;
  onDelete: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    "Utilisateur sans nom";

  const initials =
    user.first_name?.[0]?.toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "U";

  const avatar = normalizeAvatarUrl(user.avatar_url);
  const hasAvatar = !!avatar && !imageError;
  const roleStyle = getRoleStyle(user.role);

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
      <Flex align="center" gap="14px" minW="260px" flex="1">
        <Flex
          w="48px"
          h="48px"
          borderRadius="16px"
          bg={hasAvatar ? "transparent" : "#F4F7FE"}
          align="center"
          justify="center"
          overflow="hidden"
          flexShrink={0}
        >
          {hasAvatar ? (
            <Image
              src={avatar}
              alt={fullName}
              w="100%"
              h="100%"
              objectFit="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Text color="#1B2559" fontWeight="700" fontSize="md">
              {initials}
            </Text>
          )}
        </Flex>

        <Box>
          <Text color="#1B2559" fontSize="16px" fontWeight="600" lineHeight="1.2">
            {fullName}
          </Text>
          <Text color="#707EAE" fontSize="14px" mt="4px">
            {user.email}
          </Text>
        </Box>
      </Flex>

      <Flex align="center" gap="12px" flexWrap="wrap">
        <Box
          px="12px"
          py="8px"
          borderRadius="999px"
          bg={roleStyle.bg}
          color={roleStyle.color}
          fontSize="13px"
          fontWeight="600"
        >
          {formatRole(user.role)}
        </Box>

        <Text color="#A3AED0" fontSize="13px" minW="145px" textAlign="right">
          {formatCreatedAt(user.created_at)}
        </Text>

        <Button
          size="sm"
          bg="transparent"
          color="#EE5D50"
          border="1px solid #FEEFEE"
          borderRadius="12px"
          _hover={{ bg: "#FEEFEE" }}
          onClick={onDelete}
          loading={deleting}
        >
          <MdDeleteOutline style={{ marginRight: 6 }} />
          Supprimer
        </Button>
      </Flex>
    </Flex>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateUserForm>(initialForm);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bDate - aDate;
    });
  }, [users]);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        setUsers([
          { id: '1', email: 'admin@askdb.demo', first_name: 'Demo', last_name: 'Admin', role: 'admin', created_at: new Date().toISOString() },
          { id: '2', email: 'messi@gmail.com', first_name: 'Lionel', last_name: 'Messi', role: 'admin', created_at: new Date().toISOString() },
          { id: '3', email: 'stagiaire@company.com', first_name: 'Stagiaire', last_name: 'Test', role: 'stagiaire', created_at: new Date().toISOString() }
        ]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "GET",
        headers: buildAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch users.");
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function updateForm<K extends keyof CreateUserForm>(
    key: K,
    value: CreateUserForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        alert("La création d'utilisateur est désactivée en mode démo.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role,
          first_name: form.first_name || null,
          last_name: form.last_name || null,
          avatar_url: form.avatar_url || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create user.");
      }

      setForm(initialForm);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    const confirmed = window.confirm("Supprimer cet utilisateur ?");
    if (!confirmed) return;

    try {
      setDeletingUserId(userId);
      setError("");

      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        alert("La suppression d'utilisateur est désactivée en mode démo.");
        setDeletingUserId(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: buildAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete user.");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setDeletingUserId(null);
    }
  }

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

      <Grid templateColumns={{ base: "1fr" }} gap="20px" pt="15px">
        <SectionCard title="Créer un utilisateur" icon={<MdAdd />}>
          <Box as="form" onSubmit={handleCreateUser}>
            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap="16px"
              mb="16px"
            >
              <Input
                placeholder="Prénom"
                value={form.first_name}
                onChange={(e) => updateForm("first_name", e.target.value)}
                h="56px"
                borderRadius="16px"
                borderColor="#E9EDF7"
                _focusVisible={{ borderColor: "#4318FF", boxShadow: "none" }}
              />
              <Input
                placeholder="Nom"
                value={form.last_name}
                onChange={(e) => updateForm("last_name", e.target.value)}
                h="56px"
                borderRadius="16px"
                borderColor="#E9EDF7"
                _focusVisible={{ borderColor: "#4318FF", boxShadow: "none" }}
              />
            </Grid>

            <Grid templateColumns={{ base: "1fr" }} gap="16px" mb="16px">
              <Input
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                required
                h="56px"
                borderRadius="16px"
                borderColor="#E9EDF7"
                _focusVisible={{ borderColor: "#4318FF", boxShadow: "none" }}
              />
            </Grid>

            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap="16px"
              mb="16px"
            >
              <Input
                placeholder="Mot de passe"
                type="password"
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                required
                h="56px"
                borderRadius="16px"
                borderColor="#E9EDF7"
                _focusVisible={{ borderColor: "#4318FF", boxShadow: "none" }}
              />

              <NativeSelect.Root>
                <NativeSelect.Field
                  value={form.role}
                  onChange={(e) => updateForm("role", e.target.value)}
                  h="56px"
                  borderRadius="16px"
                  borderColor="#E9EDF7"
                >
                  <option value="stagiaire">Stagiaire</option>
                  <option value="directeur">Directeur</option>
                  <option value="admin">Admin</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Grid>

            <Grid templateColumns={{ base: "1fr" }} gap="16px" mb="20px">
              <Input
                placeholder="URL de l'avatar (optionnel)"
                value={form.avatar_url}
                onChange={(e) => updateForm("avatar_url", e.target.value)}
                h="56px"
                borderRadius="16px"
                borderColor="#E9EDF7"
                _focusVisible={{ borderColor: "#4318FF", boxShadow: "none" }}
              />
            </Grid>

            <Flex justify="flex-end">
              <Button
                type="submit"
                bg="#4318FF"
                color="white"
                borderRadius="16px"
                px="18px"
                h="46px"
                _hover={{ bg: "#3311DB" }}
                loading={submitting}
              >
                <MdAdd style={{ marginRight: 8 }} />
                Créer l'utilisateur
              </Button>
            </Flex>
          </Box>
        </SectionCard>

        <Box
          bg="white"
          borderRadius="20px"
          p="24px"
          boxShadow="14px 17px 40px 4px rgba(112, 144, 176, 0.08)"
          w="100%"
        >
          <Flex align="center" justify="space-between" mb="20px">
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
                <MdPeople />
              </Flex>

              <Text color="#1B2559" fontSize="22px" fontWeight="700">
                Liste des utilisateurs
              </Text>
            </Flex>

            <Button
              bg="#4318FF"
              color="white"
              borderRadius="16px"
              px="18px"
              h="42px"
              _hover={{ bg: "#3311DB" }}
              onClick={fetchUsers}
            >
              <MdRefresh style={{ marginRight: 8 }} />
              Actualiser
            </Button>
          </Flex>

          {loading ? (
            <Text color="#707EAE">Chargement des utilisateurs...</Text>
          ) : sortedUsers.length === 0 ? (
            <Text color="#707EAE">Aucun utilisateur trouvé.</Text>
          ) : (
            <Flex direction="column" gap="14px">
              {sortedUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  deleting={deletingUserId === user.id}
                  onDelete={() => handleDeleteUser(user.id)}
                />
              ))}
            </Flex>
          )}
        </Box>
      </Grid>
    </Box>
  );
}