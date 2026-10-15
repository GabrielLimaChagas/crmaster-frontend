import { useEffect, useState } from "react";
import {
  BellIcon,
  EnvelopeIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import Header from "../components/base/Header";
import Table, { type Column } from "../components/base/Table";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import IconButton from "../components/core/IconButton";
import Row from "../components/core/Row";
import {
  getNotifications,
  deleteNotification,
  clearCompanyNotifications,
  userService,
  companyService,
  type NotificationItem,
  type UserItem,
  type CompanyItem,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString("pt-BR");
  } catch {
    return dateStr;
  }
};

const NotificationList: React.FC = () => {
  const { user: authUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [, setCurrentUser] = useState<UserItem | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());

  const toggleExpand = (id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const fetchTenantAndNotifications = async (targetCompanyId?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      let resolvedCompanyId = targetCompanyId;

      if (!resolvedCompanyId && authUser?.company_id) {
        resolvedCompanyId = authUser.company_id;
      }

      // Se não informado, recupera do localStorage ou da sessão do usuário
      if (!resolvedCompanyId) {
        const storedCid = localStorage.getItem("company_id") || localStorage.getItem("companyId");
        if (storedCid && !isNaN(Number(storedCid))) {
          resolvedCompanyId = Number(storedCid);
        }
      }

      const [users, companies] = await Promise.all([
        userService.getAll().catch(() => []),
        companyService.getAll().catch(() => []),
      ]);

      const user = users && users.length > 0 ? users[0] : null;
      setCurrentUser(user);

      if (!resolvedCompanyId) {
        resolvedCompanyId = user?.company_id || (companies && companies.length > 0 ? companies[0].id : 1);
        localStorage.setItem("company_id", String(resolvedCompanyId));
      }
      setCompanyId(resolvedCompanyId);

      const comp = companies?.find((c: CompanyItem) => c.id === resolvedCompanyId) || (companies && companies.length > 0 ? companies[0] : null);
      if (comp) {
        setCompanyName(comp.name);
      }

      const data = await getNotifications(resolvedCompanyId);
      setNotifications(data || []);
    } catch {
      setError("Não foi possível carregar as notificações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantAndNotifications();
  }, [authUser]);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Deseja realmente excluir esta notificação?")) return;

    try {
      await deleteNotification(id);
      // Remove imediatamente do estado local sem recarregar a tela
      setNotifications((prev) =>
        prev.filter((item) => String(item.id) !== String(id))
      );
      setFeedback("Notificação excluída com sucesso.");
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setError("Não foi possível excluir a notificação. Tente novamente.");
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    if (!companyId) {
      setError("Empresa ativa não identificada para realizar a limpeza.");
      return;
    }

    if (!window.confirm(`Deseja realmente limpar todas as notificações da empresa "${companyName || `#${companyId}`}"?`)) {
      return;
    }

    try {
      await clearCompanyNotifications(companyId);
      setNotifications([]);
      setFeedback("Todas as notificações da empresa foram excluídas com sucesso.");
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setError("Não foi possível limpar as notificações. Tente novamente.");
    }
  };

  const columns: Column<NotificationItem>[] = [
    {
      header: "ID",
      accessor: "id",
      className: "w-16 text-center text-xs text-neutral-500 font-mono",
    },
    {
      header: "Título / Assunto",
      accessor: (n) => (
        <Row className="items-center gap-2">
          <BellIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-neutral-800 text-sm">
            {n.title || "Notificação do Sistema"}
          </span>
        </Row>
      ),
      className: "w-64",
    },
    {
      header: "Destinatário",
      accessor: (n) => (
        <Row className="items-center gap-1.5 text-xs text-neutral-700">
          <EnvelopeIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="truncate max-w-[200px]" title={n.recipient}>
            {n.recipient || "-"}
          </span>
        </Row>
      ),
      className: "w-56",
    },
    {
      header: "Conteúdo da Mensagem",
      accessor: (n) => {
        const isExpanded = expandedIds.has(n.id);
        const hasLineBreaks = (n.content || "").includes("\n");
        const isLong = (n.content || "").length > 80 || hasLineBreaks;

        return (
          <div className="flex flex-col gap-1 max-w-xl py-1 text-left">
            <div
              className={`text-xs text-neutral-700 transition-all ${
                isExpanded
                  ? "whitespace-pre-wrap break-words bg-neutral-50 p-2.5 rounded-lg border border-neutral-200"
                  : "line-clamp-2"
              }`}
            >
              {n.content}
            </div>
            {isLong && (
              <button
                type="button"
                onClick={() => toggleExpand(n.id)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 self-start cursor-pointer hover:underline focus:outline-none flex items-center gap-1 mt-0.5"
              >
                {isExpanded ? (
                  <>
                    <ChevronUpIcon className="w-3.5 h-3.5" />
                    <span>Recolher</span>
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                    <span>Ver mais</span>
                  </>
                )}
              </button>
            )}
          </div>
        );
      },
    },
    {
      header: "Data de Envio",
      accessor: (n) => (
        <span className="text-xs text-neutral-500 whitespace-nowrap">
          {formatDateTime(n.created_at || n.createdAt || n.date)}
        </span>
      ),
      className: "w-40 text-center",
    },
    {
      header: "Ações",
      className: "text-right w-20",
      accessor: (item) => (
        <Row className="text-neutral-600 justify-end pr-2">
          <IconButton
            icon={
              <TrashIcon className="w-4 h-4 text-neutral-400 hover:text-red-600 cursor-pointer transition shrink-0" />
            }
            onClick={() => handleDelete(item.id)}
            title="Excluir notificação"
          />
        </Row>
      ),
    },
  ];

  return (
    <Col className="w-full min-h-full bg-neutral-100">
      <Header
        title="Central de Notificações"
        rightAttachment={
          <Row className="gap-2 items-center">
            <Button
              label="Atualizar"
              variant="secondary"
              className="flex items-center gap-1 text-xs border border-neutral-300 hover:bg-neutral-100 px-3 py-1.5"
              onClick={() => fetchTenantAndNotifications(companyId || undefined)}
              leftAttachment={<ArrowPathIcon className="w-3.5 h-3.5 inline mr-1" />}
            />
            {notifications.length > 0 && (
              <Button
                label="Limpar Todas"
                variant="secondary"
                className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs px-3 py-1.5 rounded-lg transition"
                onClick={handleClearAll}
              />
            )}
          </Row>
        }
      />

      <Col className="p-4 gap-4 w-full max-w-7xl">
        {/* Identificação da Empresa Ativa */}
        <Row className="justify-between items-center bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
          <Row className="items-center gap-2 text-xs text-neutral-600">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-blue-200 bg-blue-50 text-blue-700">
              <BuildingOffice2Icon className="w-4 h-4 text-blue-600" />
              <span>
                Empresa: <strong>{companyName || "CRMaster"}</strong>
              </span>
            </div>
          </Row>

          <span className="text-xs text-neutral-500 font-medium">
            {notifications.length} {notifications.length === 1 ? "notificação" : "notificações"}
          </span>
        </Row>

        {/* Feedback de erro */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Feedback de sucesso */}
        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
            {feedback}
          </div>
        )}

        {/* Tabela de Notificações */}
        <Col className="bg-white rounded-xl shadow-xs border border-neutral-200 overflow-hidden min-h-[460px]">
          {isLoading ? (
            <div className="p-12 text-center text-neutral-500 text-sm flex flex-col items-center justify-center gap-2">
              <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600" />
              <span>Carregando notificações da empresa...</span>
            </div>
          ) : (
            <Table
              columns={columns}
              data={notifications}
              keyExtractor={(item) => String(item.id)}
              emptyState={
                <div className="p-12 text-center text-neutral-500 text-sm flex flex-col items-center justify-center gap-2">
                  <BellIcon className="w-8 h-8 text-neutral-300" />
                  <span>Nenhuma notificação encontrada para esta empresa.</span>
                </div>
              }
            />
          )}
        </Col>
      </Col>
    </Col>
  );
};

export default NotificationList;
