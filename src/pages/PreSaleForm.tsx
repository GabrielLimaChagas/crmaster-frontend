import { useEffect, useRef, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useParams, useNavigate, useLocation } from "react-router";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import Header from "../components/base/Header";
import Table, { type Column } from "../components/base/Table";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import Form from "../components/core/Form";
import IconButton from "../components/core/IconButton";
import Input from "../components/core/Input";
import Row from "../components/core/Row";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";
import {
  preSaleService,
  type PreSaleFormData,
  type PreSaleItem,
  type PreSaleProductItem,
} from "../services/api";

type PreSaleFormFields = {
  client: string;
  date: string;
  status: string;
};

const DEFAULT_PRODUCTS: PreSaleProductItem[] = [
  {
    id: 1,
    name: "Roçadeira",
    quantidade: 1,
    price: 259.99,
  },
];

const formatCurrency = (val: number | string = 0) => {
  const num = typeof val === "number" ? val : parseFloat(String(val)) || 0;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const PreSaleForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const statePreSale = (location.state as { preSale?: PreSaleItem } | null)
    ?.preSale;
  const isInitializedRef = useRef<string | null>(null);

  const [products, setProducts] = useState<PreSaleProductItem[]>(() => {
    if (statePreSale?.items && statePreSale.items.length > 0) {
      return statePreSale.items;
    }
    return DEFAULT_PRODUCTS;
  });

  const methods = useForm<PreSaleFormFields>({
    defaultValues: {
      client: statePreSale?.client || "",
      date: statePreSale?.date || "",
      status: statePreSale?.step || "",
    },
  });

  const { reset } = methods;

  useEffect(() => {
    // 1. Modo de criação (sem ID)
    if (!id) {
      if (isInitializedRef.current !== "new") {
        reset({
          client: "",
          date: "",
          status: "",
        });
        isInitializedRef.current = "new";
      }
      return;
    }

    // 2. Já inicializado para este ID
    if (isInitializedRef.current === String(id)) {
      return;
    }

    // 3. Dados recebidos via location.state
    if (statePreSale && String(statePreSale.id) === String(id)) {
      reset({
        client: statePreSale.client || "",
        date: statePreSale.date || "",
        status: statePreSale.step || "",
      });
      isInitializedRef.current = String(id);
      return;
    }

    // 4. Base de integração: busca da API no carregamento / F5
    let isSubscribed = true;
    preSaleService
      .getById(id)
      .then((item) => {
        if (isSubscribed && isInitializedRef.current !== String(id)) {
          reset({
            client: item.client || "",
            date: item.date || "",
            status: item.step || "",
          });
          if (item.items && item.items.length > 0) {
            setProducts(item.items);
          }
          isInitializedRef.current = String(id);
        }
      })
      .catch((error) => {
        console.warn(
          "Integração com backend (/orcamentos/:id) em andamento. Utilizando valores base:",
          error,
        );
      });

    return () => {
      isSubscribed = false;
    };
  }, [id, statePreSale, reset]);

  const handleQuantityChange = (index: number, newQty: number) => {
    const qty = Math.max(1, newQty);
    setProducts((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, quantidade: qty } : item)),
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

  const onSubmit: SubmitHandler<PreSaleFormFields> = async (formData) => {
    const payload: PreSaleFormData = {
      client: formData.client,
      step: formData.status,
      date: formData.date,
      products: products.map((p) => ({
        product_id: p.product_id || p.id,
        quantidade: p.quantidade,
      })),
    };

    try {
      console.log("[PreSaleForm] Enviando alteração para ID:", id, payload);
      if (id) {
        await preSaleService.update(id, payload);
      } else {
        await preSaleService.create(payload);
      }
      navigate(`/${NAVIGATION_ROUTES.PRE_SALES}`);
    } catch (error) {
      console.warn(
        "Base de integração com backend em andamento. Redirecionando para a listagem:",
        error,
      );
      // Redireciona para a listagem mantendo o fluxo funcional
      navigate(`/${NAVIGATION_ROUTES.PRE_SALES}`);
    }
  };

  const productColumns: Column<PreSaleProductItem>[] = [
    {
      header: "ID",
      accessor: (item) => item.id || item.product_id || "-",
      className: "w-16",
    },
    {
      header: "Nome",
      accessor: (item) => item.name || "Produto",
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
              icon={<PencilSquareIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />}
              title="Editar item"
            />
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
      <Header title="Orçamentos" />
      <Col className="w-full p-4">
        <Col className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <Form
            className="w-full"
            methods={methods}
            onSubmit={onSubmit}
          >
            <Row className="w-full gap-8 items-start">
              {/* Lado esquerdo: Campos do formulário */}
              <Col className="w-5/12 gap-4">
                <Input name="client" label="Cliente" />
                <Input name="date" label="Data" type="date" />
                <Input name="status" label="Status" />
                <Row className="mt-2">
                  <Button
                    type="submit"
                    label="Salvar alterações"
                    variant="primary"
                  />
                </Row>
              </Col>

              {/* Lado direito: Tabela de produtos e total */}
              <Col className="w-7/12 gap-4">
                <Col className="border border-neutral-200 rounded-xl overflow-hidden">
                  <Table
                    columns={productColumns}
                    data={products}
                    keyExtractor={(item) =>
                      String(item.id ?? item.product_id ?? item.name)
                    }
                    emptyState={
                      <div className="p-4 text-center text-neutral-500">
                        Nenhum produto adicionado.
                      </div>
                    }
                  />
                </Col>

                {/* Total do Orçamento */}
                <Col className="items-end pr-2">
                  <span className="text-xs text-neutral-500">
                    Total do Orçamento
                  </span>
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
