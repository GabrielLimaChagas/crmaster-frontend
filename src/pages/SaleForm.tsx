import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, useLocation } from "react-router";
import { ArrowLeftIcon, CheckBadgeIcon } from "@heroicons/react/20/solid";
import Header from "../components/base/Header";
import Table, { type Column } from "../components/base/Table";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import Form from "../components/core/Form";
import Input from "../components/core/Input";
import Row from "../components/core/Row";
import Select from "../components/core/Select";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";
import {
  pipelineService,
  customerService,
  userService,
  PIPELINE_STEPS,
  type CustomerItem,
  type UserItem,
  type PipelineItem,
  type PipelineProductItem,
} from "../services/api";

type SaleFormFields = {
  customer_id: string;
  employee_id: string;
  date: string;
  step: string;
  note: string;
};

const formatCurrency = (val: number | string = 0) => {
  const num = typeof val === "number" ? val : parseFloat(String(val)) || 0;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const SaleForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateSale = (location.state as { sale?: PipelineItem } | null)?.sale;

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [employees, setEmployees] = useState<UserItem[]>([]);
  const [products, setProducts] = useState<PipelineProductItem[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const methods = useForm<SaleFormFields>({
    defaultValues: {
      customer_id: "",
      employee_id: "",
      date: "",
      step: "CLOSING",
      note: "",
    },
  });

  const { reset } = methods;

  // Carrega Clientes, Colaboradores e os detalhes da Venda com Await
  useEffect(() => {
    let isMounted = true;

    const loadSaleDetails = async () => {
      try {
        const [customersData, employeesData] = await Promise.all([
          customerService.getAll().catch(() => []),
          userService.getAll().catch(() => []),
        ]);

        if (!isMounted) return;

        setCustomers(customersData || []);
        setEmployees(employeesData || []);

        if (id) {
          let item: PipelineItem | null = null;
          if (stateSale && String(stateSale.id) === String(id)) {
            item = stateSale;
          } else {
            item = await pipelineService.getById(id);
          }

          if (!isMounted || !item) return;

          const customerId = String(item.customer_id ?? item.customer?.id ?? "");
          const employeeId = String(item.employee_id ?? item.employee?.id ?? "");
          const stepVal = String(item.step || "CLOSING");
          const dateVal = item.date ? item.date.slice(0, 10) : "";
          const noteVal = String(item.note || "");

          reset({
            customer_id: customerId,
            employee_id: employeeId,
            date: dateVal,
            step: stepVal,
            note: noteVal,
          });

          const prods = item.sale_products || item.items || [];
          setProducts(prods);

          // Garante a sincronização dos valores no DOM com cast explícito
          setTimeout(() => {
            const customerEl = document.getElementById("sale-customer") as HTMLSelectElement | null;
            if (customerEl && customerId) {
              customerEl.value = String(customerId);
            }
            const employeeEl = document.getElementById("sale-employee") as HTMLSelectElement | null;
            if (employeeEl && employeeId) {
              employeeEl.value = String(employeeId);
            }
          }, 50);
        }
      } catch {
        setFeedbackMessage({
          type: "error",
          text: "Não foi possível carregar os detalhes da venda. Tente novamente.",
        });
      }
    };

    loadSaleDetails();

    return () => {
      isMounted = false;
    };
  }, [id, stateSale, reset]);

  const totalVenda = products.reduce((acc, item) => {
    const price =
      typeof item.price === "number"
        ? item.price
        : parseFloat(String(item.price)) || 0;
    return acc + price * (item.quantidade || 1);
  }, 0);

  const productColumns: Column<PipelineProductItem>[] = [
    {
      header: "ID",
      accessor: (item) => item.id || item.product_id || "-",
      className: "w-16",
    },
    {
      header: "Nome do Produto",
      accessor: (item) => item.name || item.product_name || "Produto",
    },
    {
      header: "Quantidade",
      accessor: "quantidade",
      className: "text-center w-24",
    },
    {
      header: "Preço Unitário",
      accessor: (item) => formatCurrency(item.price || 0),
    },
    {
      header: "Subtotal",
      accessor: (item) => {
        const price =
          typeof item.price === "number"
            ? item.price
            : parseFloat(String(item.price)) || 0;
        return formatCurrency(price * (item.quantidade || 1));
      },
      className: "font-medium text-neutral-800",
    },
  ];

  return (
    <Col className="w-full min-h-screen bg-neutral-100">
      <Header
        title={`Visualização da Venda #${id || ""}`}
        rightAttachment={
          <Button
            type="button"
            label="Voltar para Vendas"
            variant="secondary"
            className="flex items-center gap-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700"
            onClick={() => navigate(`/${NAVIGATION_ROUTES.SALES}`)}
            leftAttachment={<ArrowLeftIcon className="w-4 h-4 mr-1 inline" />}
          />
        }
      />

      <Col className="w-full p-4 gap-4">
        {feedbackMessage && (
          <div
            className={`p-4 rounded-xl border text-sm font-medium ${
              feedbackMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {feedbackMessage.text}
          </div>
        )}

        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
          <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            Esta venda já foi concluída e fechada. Os registros são exibidos em modo somente leitura para integridade dos dados fiscais e operacionais.
          </span>
        </div>

        <Col className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <Form className="w-full" methods={methods} onSubmit={() => {}}>
            <Row className="w-full gap-8 items-start">
              {/* Lado esquerdo: Campos em modo somente leitura (disabled) */}
              <Col className="w-5/12 gap-4">
                <Select
                  name="customer_id"
                  id="sale-customer"
                  label="Cliente Vinculado"
                  placeholderOption="Cliente não especificado"
                  optionsList={customers.map((c) => ({
                    value: String(c.id),
                    label: `${c.name} (${c.email || c.phone || "Sem contato"})`,
                  }))}
                  disabled
                />

                <Select
                  name="step"
                  id="sale-step"
                  label="Etapa da Venda"
                  optionsList={PIPELINE_STEPS}
                  disabled
                />

                <Select
                  name="employee_id"
                  id="sale-employee"
                  label="Vendedor / Responsável"
                  placeholderOption="Responsável não especificado"
                  optionsList={employees.map((u) => ({
                    value: String(u.id),
                    label: `${u.name} - ${u.role}`,
                  }))}
                  disabled
                />

                <Input name="date" label="Data da Venda" type="date" disabled />

                <Input name="note" label="Anotações da Venda" disabled />
              </Col>

              {/* Lado direito: Produtos associados e total da venda */}
              <Col className="w-7/12 gap-4">
                <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                  Produtos Associados à Venda
                </span>

                <Col className="border border-neutral-200 rounded-xl overflow-hidden">
                  <Table
                    columns={productColumns}
                    data={products}
                    keyExtractor={(item) => String(item.id ?? item.product_id ?? item.name)}
                    emptyState={
                      <div className="p-6 text-center text-neutral-500 text-sm">
                        Nenhum produto associado a esta venda.
                      </div>
                    }
                  />
                </Col>

                {/* Total Consolidado */}
                <Col className="items-end pr-2">
                  <span className="text-xs text-neutral-500">Total Consolidado da Venda</span>
                  <span className="text-2xl font-bold text-neutral-900">
                    {formatCurrency(totalVenda)}
                  </span>
                </Col>
              </Col>
            </Row>
          </Form>
        </Col>
      </Col>
    </Col>
  );
};

export default SaleForm;
