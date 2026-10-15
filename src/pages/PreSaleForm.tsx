import React, { useEffect, useRef, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useParams, useNavigate, useLocation } from "react-router";
import { CheckCircleIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import Header from "../components/base/Header";
import Table, { type Column } from "../components/base/Table";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import Form from "../components/core/Form";
import IconButton from "../components/core/IconButton";
import Input from "../components/core/Input";
import Row from "../components/core/Row";
import Select from "../components/core/Select";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";
import {
  pipelineService,
  customerService,
  productService,
  userService,
  PIPELINE_STEPS,
  type CustomerItem,
  type ProductItem,
  type UserItem,
  type PipelineItem,
  type PipelineProductItem,
  type PipelineFormData,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";

type PreSaleFormFields = {
  customer_id: string | number;
  employee_id: string | number;
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

const PreSaleForm: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const statePreSale = (location.state as { preSale?: PipelineItem } | null)?.preSale;
  const isInitializedRef = useRef<string | null>(null);

  // Estados de dados dinâmicos do backend
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [employees, setEmployees] = useState<UserItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | number>("");
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [products, setProducts] = useState<PipelineProductItem[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const methods = useForm<PreSaleFormFields>({
    defaultValues: {
      customer_id: statePreSale?.customer_id || "",
      employee_id: statePreSale?.employee_id || "",
      date: statePreSale?.date ? statePreSale.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      step: statePreSale?.step || "PROPSECTING",
      note: statePreSale?.note || "",
    },
  });

  const { reset, watch, setValue } = methods;
  const currentStep = watch("step");

  // Carrega Clientes, Vendedores, Produtos e Inicializa o Formulário com Await
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // 1. Garante que os selects de clientes e vendedores sejam resolvidos com await
        const [customersData, employeesData, productsData] = await Promise.all([
          customerService.getAll().catch(() => []),
          userService.getAll().catch(() => []),
          productService.getAll().catch(() => []),
        ]);

        if (!isMounted) return;

        const loadedCustomers = customersData || [];
        const loadedEmployees = employeesData || [];
        const loadedProducts = productsData || [];

        setCustomers(loadedCustomers);
        setEmployees(loadedEmployees);
        setAvailableProducts(loadedProducts);
        if (loadedProducts.length > 0) {
          setSelectedProductId(String(loadedProducts[0].id));
        }

        // 2. Popula os valores do formulário para edição ou criação
        if (id) {
          let item: PipelineItem | null = null;
          if (statePreSale && String(statePreSale.id) === String(id)) {
            item = statePreSale;
          } else {
            item = await pipelineService.getById(id);
          }

          if (!isMounted || !item) return;

          // Acesso seguro com fallbacks para customer.id e employee.id e cast explícito para string
          const customerId = String(
            item.customer_id ??
            item.customer?.id ??
            ""
          );
          const employeeId = String(
            item.employee_id ??
            item.employee?.id ??
            ""
          );
          const stepVal = String(item.step || "PROPSECTING");
          const dateVal = item.date ? item.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
          const noteVal = String(item.note || "");

          reset({
            customer_id: customerId,
            employee_id: employeeId,
            date: dateVal,
            step: stepVal,
            note: noteVal,
          });

          if (item.items && item.items.length > 0) {
            setProducts(item.items);
          } else if (item.sale_products && item.sale_products.length > 0) {
            setProducts(item.sale_products);
          }

          // Atribuição direta com cast explícito nos elementos DOM dos selects
          setTimeout(() => {
            const customerEl = document.getElementById("pipeline-customer") as HTMLSelectElement | null;
            if (customerEl && customerId) {
              customerEl.value = String(customerId);
            }
            const employeeEl = document.getElementById("pipeline-employee") as HTMLSelectElement | null;
            if (employeeEl && employeeId) {
              employeeEl.value = String(employeeId);
            }
          }, 50);

          isInitializedRef.current = String(id);
        } else {
          reset({
            customer_id: "",
            employee_id: "",
            date: new Date().toISOString().slice(0, 10),
            step: "PROPSECTING",
            note: "",
          });
          setProducts([]);
          isInitializedRef.current = "new";
        }
      } catch (error) {
        setFeedbackMessage({
          type: "error",
          text: `Erro ao carregar dados do formulário: ${(error as Error).message}`,
        });
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, statePreSale, reset]);

  // Adicionar produto selecionado do select dinâmico
  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const prod = availableProducts.find((p) => String(p.id) === String(selectedProductId));
    if (!prod) return;

    const existingIndex = products.findIndex(
      (p) => String(p.product_id || p.id) === String(prod.id)
    );

    const priceNum =
      typeof prod.numeric_price === "number"
        ? prod.numeric_price
        : typeof prod.price === "number"
        ? prod.price > 1000
          ? prod.price / 100
          : prod.price
        : parseFloat(String(prod.price)) || 0;

    if (existingIndex >= 0) {
      setProducts((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantidade: item.quantidade + productQuantity }
            : item
        )
      );
    } else {
      setProducts((prev) => [
        ...prev,
        {
          id: prod.id,
          product_id: prod.id,
          name: prod.name,
          price: priceNum,
          quantidade: productQuantity,
          subtotal: priceNum * productQuantity,
        },
      ]);
    }

    setProductQuantity(1);
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    const qty = Math.max(1, newQty);
    setProducts((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, quantidade: qty } : item))
    );
  };

  const handleProductDelete = (index: number) => {
    if (!window.confirm("Deseja realmente remover este produto do orçamento?")) return;
    setProducts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalOrcamento = products.reduce((acc, item) => {
    const price =
      typeof item.price === "number"
        ? item.price
        : parseFloat(String(item.price)) || 0;
    return acc + price * (item.quantidade || 1);
  }, 0);

  // Fechamento de Venda
  const handleDirectCloseSale = async () => {
    if (!id) {
      alert("Salve o orçamento primeiro antes de executar o fechamento da venda.");
      return;
    }

    if (!window.confirm("Deseja realmente fechar esta venda? Uma notificação de confirmação será enviada.")) {
      return;
    }

    setIsClosing(true);
    setFeedbackMessage(null);

    try {
      await pipelineService.close(
        id,
        "Fechamento realizado pela interface",
        user?.company_id
      );
      setValue("step", "CLOSING");
      setFeedbackMessage({
        type: "success",
        text: "Venda concluída com sucesso!",
      });
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Não foi possível concluir a ação. Tente novamente.",
      });
    } finally {
      setIsClosing(false);
    }
  };

  const onSubmit: SubmitHandler<PreSaleFormFields> = async (formData) => {
    setFeedbackMessage(null);

    const payload: PipelineFormData = {
      customer_id: formData.customer_id ? Number(formData.customer_id) : null,
      employee_id: formData.employee_id ? Number(formData.employee_id) : null,
      company_id: user?.company_id ? Number(user.company_id) : null,
      step: formData.step,
      date: formData.date,
      note: formData.note,
      products: products.map((p) => ({
        product_id: p.product_id || p.id,
        quantidade: p.quantidade,
      })),
    };

    try {
      let savedPipelineId = id;

      if (id) {
        await pipelineService.update(id, payload);
      } else {
        const res = await pipelineService.create(payload);
        savedPipelineId = String(res.pipeline?.id || "");
      }

      // Se a etapa for CLOSING, garante a conclusão da venda com o company_id ativo
      if (formData.step === "CLOSING" && savedPipelineId) {
        await pipelineService.close(
          savedPipelineId,
          "Fechamento realizado pela interface",
          user?.company_id
        );
      }

      setFeedbackMessage({
        type: "success",
        text: "Orçamento salvo com sucesso!",
      });

      setTimeout(() => {
        navigate(`/${NAVIGATION_ROUTES.PRE_SALES}`);
      }, 1000);
    } catch {
      setFeedbackMessage({
        type: "error",
        text: "Não foi possível concluir a ação. Tente novamente.",
      });
    }
  };

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
      accessor: (item) => {
        const itemIndex = products.findIndex((p) => p === item);
        return (
          <input
            type="number"
            min={1}
            value={item.quantidade}
            onChange={(e) =>
              handleQuantityChange(itemIndex, parseInt(e.target.value, 10) || 1)
            }
            className="w-16 border border-neutral-300 rounded px-1 text-center bg-white"
          />
        );
      },
    },
    {
      header: "Preço Total",
      accessor: (item) => {
        const price =
          typeof item.price === "number"
            ? item.price
            : parseFloat(String(item.price)) || 0;
        return formatCurrency(price * (item.quantidade || 1));
      },
    },
    {
      header: "",
      className: "text-right",
      accessor: (item) => {
        const itemIndex = products.findIndex((p) => p === item);
        return (
          <Row className="text-neutral-600 justify-end gap-1">
            <IconButton
              icon={<TrashIcon className="w-5 h-5 cursor-pointer hover:text-red-600" />}
              onClick={() => handleProductDelete(itemIndex)}
              title="Excluir item"
            />
          </Row>
        );
      },
    },
  ];

  return (
    <Col className="w-full min-h-screen bg-neutral-100">
      <Header
        title={id ? `Editar Orçamento #${id}` : "Novo Orçamento / Oportunidade"}
        rightAttachment={
          id && currentStep !== "CLOSING" ? (
            <Button
              type="button"
              label={isClosing ? "Fechando Venda..." : "Fechar Venda (Ganho)"}
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
              disabled={isClosing}
              onClick={handleDirectCloseSale}
              leftAttachment={<CheckCircleIcon className="w-5 h-5 mr-1 inline" />}
            />
          ) : undefined
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

        <Col className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <Form className="w-full" methods={methods} onSubmit={onSubmit}>
            <Row className="w-full gap-8 items-start">
              {/* Lado esquerdo: Campos com selects dinâmicos do backend */}
              <Col className="w-5/12 gap-4">
                <Select
                  name="customer_id"
                  id="pipeline-customer"
                  label="Cliente"
                  placeholderOption="Selecione um cliente..."
                  optionsList={customers.map((c) => ({
                    value: String(c.id),
                    label: `${c.name} (${c.email || c.phone || "Sem contato"})`,
                  }))}
                  options={{ required: "Selecione o cliente" }}
                />

                <Select
                  name="step"
                  id="pipeline-step"
                  label="Etapa do Funil (Pipeline Step)"
                  optionsList={PIPELINE_STEPS}
                  options={{ required: "Selecione a etapa da venda" }}
                />

                <Select
                  name="employee_id"
                  id="pipeline-employee"
                  label="Vendedor / Responsável"
                  placeholderOption="Selecione um colaborador..."
                  optionsList={employees.map((u) => ({
                    value: String(u.id),
                    label: `${u.name} - ${u.role}`,
                  }))}
                />

                <Input name="date" label="Data" type="date" />

                <Input name="note" label="Anotação / Observações" placeholder="Observações sobre o negócio..." />

                <Row className="mt-4 gap-3">
                  <Button type="submit" label="Salvar alterações" variant="primary" />
                  <Button
                    type="button"
                    label="Cancelar"
                    variant="secondary"
                    className="border border-neutral-300 hover:bg-neutral-100"
                    onClick={() => navigate(`/${NAVIGATION_ROUTES.PRE_SALES}`)}
                  />
                </Row>
              </Col>

              {/* Lado direito: Seleção de produtos e tabela */}
              <Col className="w-7/12 gap-4">
                <Col className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 gap-3">
                  <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    Adicionar Produto ao Orçamento
                  </span>
                  <Row className="gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-neutral-600 text-xs font-medium mb-1 block" htmlFor="pipeline-product">
                        Produto
                      </label>
                      <select
                        id="pipeline-product"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full border border-neutral-300 rounded bg-white px-2 py-1.5 text-sm"
                      >
                        {availableProducts.map((p) => {
                          const pPrice =
                            typeof p.numeric_price === "number"
                              ? p.numeric_price
                              : typeof p.price === "number"
                              ? p.price > 1000
                                ? p.price / 100
                                : p.price
                              : parseFloat(String(p.price)) || 0;
                          return (
                            <option key={p.id} value={p.id}>
                              {p.name} - {formatCurrency(pPrice)}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="text-neutral-600 text-xs font-medium mb-1 block">
                        Qtd
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(parseInt(e.target.value, 10) || 1)}
                        className="w-full border border-neutral-300 rounded bg-white px-2 py-1.5 text-sm text-center"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition flex items-center gap-1 h-[34px]"
                    >
                      <PlusIcon className="w-4 h-4" /> Adicionar
                    </button>
                  </Row>
                </Col>

                <Col className="border border-neutral-200 rounded-xl overflow-hidden">
                  <Table
                    columns={productColumns}
                    data={products}
                    keyExtractor={(item) => String(item.id ?? item.product_id ?? item.name)}
                    emptyState={
                      <div className="p-6 text-center text-neutral-500 text-sm">
                        Nenhum produto adicionado ao orçamento.
                      </div>
                    }
                  />
                </Col>

                {/* Total do Orçamento */}
                <Col className="items-end pr-2">
                  <span className="text-xs text-neutral-500">Total do Orçamento</span>
                  <span className="text-xl font-bold text-neutral-800">
                    {formatCurrency(totalOrcamento)}
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

export default PreSaleForm;
