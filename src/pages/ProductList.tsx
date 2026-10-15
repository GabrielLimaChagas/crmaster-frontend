import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import Header from "../components/base/Header";
import Table from "../components/base/Table";
import Col from "../components/core/Col";
import Row from "../components/core/Row";
import IconButton from "../components/core/IconButton";
import Button from "../components/core/Button";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";
import { productService, type ProductItem } from "../services/api";

const formatCentAsReal = (value: number | string = 0) => {
  const num = typeof value === "number" ? value : (parseFloat(String(value)) * 100) || 0;
  return (num / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const ProductList = () => {
  const [data, setData] = useState<ProductItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    productService
      .getAll()
      .then((products) => {
        if (isMounted) setData(products);
      })
      .catch((error) => {
        console.error("Erro ao carregar produtos:", error);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Deseja realmente excluir este produto?")) return;
    try {
      await productService.delete(id);
      setData((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
    }
  };

  return (
    <Col className="w-full">
      <Header
        title="Produtos"
        rightAttachment={
          <Button
            label="Novo Produto"
            variant="primary"
            onClick={() => navigate(`/${NAVIGATION_ROUTES.NEW_PRODUCT}`)}
          />
        }
      />
      <Col className="p-2">
        <Table
          className="shadow"
          columns={[
            { header: "ID", accessor: "id" },
            { header: "Nome", accessor: "name" },
            {
              header: "Preço",
              accessor: (item) => formatCentAsReal(item.price),
            },
            {
              header: "",
              accessor: (item) => (
                <Row className="text-neutral-600 justify-end gap-1">
                  <IconButton
                    icon={<PencilSquareIcon className="w-5 h-5 cursor-pointer" />}
                    onClick={() =>
                      navigate(
                        `/${NAVIGATION_ROUTES.PRODUCTS}/${item.id}`,
                        { state: { product: item } }
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

export default ProductList;
