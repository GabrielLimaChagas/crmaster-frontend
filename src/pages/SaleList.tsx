import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import Header from "../components/base/Header";
import Table, { type Column } from "../components/base/Table";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import IconButton from "../components/core/IconButton";
import Row from "../components/core/Row";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";
import { saleService, type SaleItem } from "../services/api";

const INITIAL_DATA: SaleItem[] = [
  {
    id: 1,
    client: "Fulano da Silva",
    step: "Fechamento",
    productsCount: 5,
  },
];

const SaleList: React.FC = () => {
  const [data, setData] = useState<SaleItem[]>(INITIAL_DATA);
  const navigate = useNavigate();

  // Base da integração com o backend
  useEffect(() => {
    let isMounted = true;
    saleService
      .getAll()
      .then((items) => {
        if (isMounted && items && Array.isArray(items) && items.length > 0) {
          setData(items);
        }
      })
      .catch((error) => {
        // Base de integração conectada; enquanto o endpoint no backend não estiver finalizado,
        // mantém os dados de demonstração base exibidos na tela.
        console.warn(
          "Integração com backend (/sales) em andamento. Utilizando dados base:",
          error,
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Deseja realmente excluir esta venda?")) return;

    try {
      await saleService.delete(id);
    } catch (error) {
      console.warn(
        "Base de integração: tentativa de exclusão no backend:",
        error,
      );
    }

    setData((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const handleNew = () => {
    navigate(`/${NAVIGATION_ROUTES.NEW_SALE}`);
  };

  const handleEdit = (item: SaleItem) => {
    navigate(`/${NAVIGATION_ROUTES.SALES}/${item.id}`, {
      state: { sale: item },
    });
  };

  const columns: Column<SaleItem>[] = [
    {
      header: "ID",
      accessor: "id",
      className: "w-24",
    },
    {
      header: "Nome do Cliente",
      accessor: "client",
    },
    {
      header: "Etapa da Venda",
      accessor: "step",
    },
    {
      header: "Quantidade de Produtos",
      accessor: "productsCount",
    },
    {
      header: "",
      className: "text-right",
      accessor: (item) => (
        <Row className="text-neutral-600 justify-end gap-2 pr-2">
          <IconButton
            icon={<PencilSquareIcon className="w-5 h-5 cursor-pointer hover:text-blue-600 transition" />}
            onClick={() => handleEdit(item)}
            title="Editar venda"
          />
          <IconButton
            icon={<TrashIcon className="w-5 h-5 cursor-pointer hover:text-red-600 transition" />}
            onClick={() => handleDelete(item.id)}
            title="Excluir venda"
          />
        </Row>
      ),
    },
  ];

  return (
    <Col className="w-full min-h-screen bg-neutral-100">
      <Header
        title="Vendas"
        rightAttachment={
          <Button
            label="Nova Venda"
            variant="primary"
            className="flex items-center"
            onClick={handleNew}
          />
        }
      />

      <Col className="p-4 gap-4">
        <Col className="bg-white rounded-xl shadow-xs border border-neutral-200 overflow-hidden min-h-[460px]">
          <Table
            columns={columns}
            data={data}
            keyExtractor={(item) => String(item.id)}
            emptyState={
              <div className="p-8 text-center text-neutral-500">
                Nenhuma venda encontrada.
              </div>
            }
          />
        </Col>
      </Col>
    </Col>
  );
};

export default SaleList;
