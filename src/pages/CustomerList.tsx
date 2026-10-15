import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Header from "../components/base/Header";
import Table from "../components/base/Table";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import IconButton from "../components/core/IconButton";
import Row from "../components/core/Row";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";
import {
  customerService,
  importCustomers,
  exportCustomers,
  userService,
  type CustomerItem,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const CustomerList = () => {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<CustomerItem[]>([]);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const loadCustomers = async () => {
    try {
      const customers = await customerService.getAll();
      setData(customers);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const getActiveCompanyId = async (): Promise<number> => {
    if (authUser?.company_id) {
      return authUser.company_id;
    }
    const stored =
      localStorage.getItem("company_id") || localStorage.getItem("companyId");
    if (stored && !isNaN(Number(stored))) {
      return Number(stored);
    }
    const users = await userService.getAll().catch(() => []);
    const cid = users?.[0]?.company_id || 1;
    localStorage.setItem("company_id", String(cid));
    return cid;
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "json") {
      setFeedback({
        type: "error",
        message:
          "Formato de arquivo inválido! Por favor, selecione um arquivo .csv ou .json.",
      });
      return;
    }

    if (file.size === 0) {
      setFeedback({
        type: "error",
        message: "O arquivo selecionado está vazio.",
      });
      return;
    }

    setIsImporting(true);
    setFeedback(null);

    try {
      const companyId = await getActiveCompanyId();
      const report = await importCustomers(file, companyId);

      const total = report.total_read ?? 0;
      const imported = report.imported_count ?? 0;
      const failed = report.failed_count ?? 0;

      setFeedback({
        type: "success",
        message: `Importação concluída: ${total} lido(s), ${imported} importado(s) com sucesso, ${failed} falha(s).`,
      });

      await loadCustomers();
    } catch (err) {
      setFeedback({
        type: "error",
        message: `Erro na importação: ${(err as Error).message || "Falha ao processar arquivo"}`,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true);
    setFeedback(null);

    try {
      const companyId = await getActiveCompanyId();
      await exportCustomers(format, companyId);
      setFeedback({
        type: "success",
        message: `Exportação de clientes em formato ${format.toUpperCase()} iniciada com sucesso.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: "error",
        message: `Erro ao exportar clientes: ${(err as Error).message || "Falha no download"}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Deseja realmente excluir este cliente?")) return;
    try {
      await customerService.delete(id);
      setData((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    }
  };

  return (
    <Col className="w-full">
      <Header
        title="Clientes"
        rightAttachment={
          <Row className="gap-2 items-center relative">
            {/* Input oculto para upload de arquivo */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.json"
              className="hidden"
            />

            {/* Botão de Importação */}
            <Button
              label={isImporting ? "Importando..." : "Importar Clientes"}
              variant="secondary"
              className="border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-xs"
              disabled={isImporting || isExporting}
              leftAttachment={
                isImporting ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <ArrowUpTrayIcon className="w-4 h-4 text-neutral-500" />
                )
              }
              onClick={handleImportClick}
            />

            {/* Menu Dropdown de Exportação */}
            <div className="relative inline-block text-left">
              <Button
                label={isExporting ? "Exportando..." : "Exportar"}
                variant="secondary"
                className="border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-xs"
                disabled={isImporting || isExporting}
                leftAttachment={
                  isExporting ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <ArrowDownTrayIcon className="w-4 h-4 text-neutral-500" />
                  )
                }
                rightAttachment={
                  <ChevronDownIcon className="w-3.5 h-3.5 text-neutral-400" />
                }
                onClick={() => setExportMenuOpen((prev) => !prev)}
              />

              {exportMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setExportMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 z-50">
                    <button
                      type="button"
                      className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer transition font-medium"
                      onClick={() => {
                        setExportMenuOpen(false);
                        handleExport("csv");
                      }}
                    >
                      <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                        CSV
                      </span>
                      Exportar CSV
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer transition font-medium border-t border-neutral-100"
                      onClick={() => {
                        setExportMenuOpen(false);
                        handleExport("json");
                      }}
                    >
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                        JSON
                      </span>
                      Exportar JSON
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Botão Novo Cliente */}
            <Button
              label="Novo Cliente"
              variant="primary"
              className="text-xs px-3.5 py-1.5 shadow-xs"
              onClick={() => navigate(`/${NAVIGATION_ROUTES.NEW_CUSTOMER}`)}
            />
          </Row>
        }
      />
      <Col className="p-4 gap-3">
        {/* Banner de Feedback (Alerta) */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium border ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <Table
          className="shadow"
          columns={[
            { header: "ID", accessor: "id" },
            { header: "Nome", accessor: "name" },
            { header: "Compras em Andamento", accessor: "pipelinesCount" },
            {
              header: "",
              accessor: (item) => (
                <Row className="text-neutral-600 justify-end gap-1">
                  <IconButton
                    icon={<PencilSquareIcon className="w-5 h-5 cursor-pointer" />}
                    onClick={() =>
                      navigate(
                        `/${NAVIGATION_ROUTES.CUSTOMERS}/${item.id}`,
                        { state: { customer: item } }
                      )
                    }
                  />
                  <IconButton
                    icon={<TrashIcon className="w-5 h-5 cursor-pointer" />}
                    onClick={() => handleDelete(item.id)}
                  />
                </Row>
              ),
            },
          ]}
          data={data}
          keyExtractor={(item) => String(item.id)}
        />
      </Col>
    </Col>
  );
};

export default CustomerList;
