import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircleIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import Header from "../components/base/Header";
import Table, { type Column } from "../components/base/Table";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import IconButton from "../components/core/IconButton";
import Row from "../components/core/Row";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";
import { pipelineService, PIPELINE_STEPS, type PipelineItem } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const formatCurrency = (val: number | string = 0) => {
  const num = typeof val === "number" ? val : parseFloat(String(val)) || 0;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const getStepLabel = (stepValue: string) => {
  const stepObj = PIPELINE_STEPS.find((s) => s.value === stepValue);
  return stepObj ? stepObj.label : stepValue;
};

const PreSaleList: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<PipelineItem[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const navigate = useNavigate();

  const loadPipelines = () => {
    pipelineService
      .getAll()
      .then((items) => {
        if (items && Array.isArray(items)) {
          setData(items);
        }
      })
      .catch(() => {
        setFeedbackMessage({
          type: "error",
          text: "Não foi possível carregar os orçamentos. Tente novamente.",
        });
      });
  };

  useEffect(() => {
    loadPipelines();
  }, []);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Deseja realmente excluir este orçamento?")) return;

    try {
      await pipelineService.delete(id);
      setData((prev) => prev.filter((item) => String(item.id) !== String(id)));
      setFeedbackMessage({
        type: "success",
        text: "Orçamento excluído com sucesso.",
      });
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Não foi possível concluir a ação. Tente novamente.",
      });
    }
  };

  // Gatilho de Fechamento de Venda
  const handleCloseSale = async (id: string | number) => {
    if (!window.confirm("Deseja fechar esta venda agora? Uma notificação de confirmação será enviada.")) {
      return;
    }

    try {
      await pipelineService.close(
        id,
        "Fechamento realizado pela interface",
        user?.company_id
      );
      setFeedbackMessage({
        type: "success",
        text: "Venda concluída com sucesso!",
      });
      loadPipelines();
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Não foi possível concluir a ação. Tente novamente.",
      });
    }
  };

  const handleNew = () => {
    navigate(`/${NAVIGATION_ROUTES.NEW_PRE_SALE}`);
  };

  const handleEdit = (item: PipelineItem) => {
    navigate(`/${NAVIGATION_ROUTES.PRE_SALES}/${item.id}`, {
      state: { preSale: item },
    });
  };

  const columns: Column<PipelineItem>[] = [
    {
      header: "ID",
      accessor: "id",
      className: "w-16",
    },
    {
      header: "Cliente",
      accessor: (item) => item.customer_name || item.client || (item.customer_id ? `Cliente #${item.customer_id}` : "-"),
    },
    {
      header: "Responsável",
      accessor: (item) => item.employee_name || (item.employee_id ? `Usuário #${item.employee_id}` : "-"),
    },
    {
      header: "Etapa da Venda",
      accessor: (item) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            item.step === "CLOSING"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {getStepLabel(item.step)}
        </span>
      ),
    },
    {
      header: "Qtd. Itens",
      accessor: (item) => item.productsCount ?? item.products_count ?? 0,
      className: "text-center w-24",
    },
    {
      header: "Total",
      accessor: (item) => formatCurrency(item.total || 0),
      className: "font-medium text-neutral-800",
    },
    {
      header: "",
      className: "text-right",
      accessor: (item) => (
        <Row className="text-neutral-600 justify-end gap-2 pr-2">
          {item.step !== "CLOSING" && (
            <IconButton
              icon={<CheckCircleIcon className="w-5 h-5 text-emerald-600 hover:text-emerald-700 cursor-pointer" />}
              onClick={() => handleCloseSale(item.id)}
              title="Concluir Venda"
            />
          )}
          <IconButton
            icon={<PencilSquareIcon className="w-5 h-5 hover:text-blue-600 cursor-pointer" />}
            onClick={() => handleEdit(item)}
            title="Editar orçamento"
          />
          <IconButton
            icon={<TrashIcon className="w-5 h-5 hover:text-red-600 cursor-pointer" />}
            onClick={() => handleDelete(item.id)}
            title="Excluir orçamento"
          />
        </Row>
      ),
    },
  ];

  return (
    <Col className="w-full min-h-screen bg-neutral-100">
      <Header
        title="Orçamentos / Funil de Vendas"
        rightAttachment={
          <Button
            label="Novo Orçamento"
            variant="primary"
            className="flex items-center"
            onClick={handleNew}
          />
        }
      />

      <Col className="p-4 gap-4">
        {feedbackMessage && (
          <div
            className={`p-3 rounded-xl border text-sm font-medium ${
              feedbackMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {feedbackMessage.text}
          </div>
        )}

        <Col className="bg-white rounded-xl shadow-xs border border-neutral-200 overflow-hidden min-h-[460px]">
          <Table
            columns={columns}
            data={data}
            keyExtractor={(item) => String(item.id)}
            emptyState={
              <div className="p-8 text-center text-neutral-500">
                Nenhum orçamento encontrado na base de dados.
              </div>
            }
          />
        </Col>
      </Col>
    </Col>
  );
};

export default PreSaleList;
