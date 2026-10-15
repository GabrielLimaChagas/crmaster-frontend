import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import Header from "../components/base/Header";
import Table from "../components/base/Table";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import IconButton from "../components/core/IconButton";
import Row from "../components/core/Row";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";
import { customerService, type CustomerItem } from "../services/api";

const CustomerList = () => {
  const [data, setData] = useState<CustomerItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    customerService
      .getAll()
      .then((customers) => {
        if (isMounted) setData(customers);
      })
      .catch((error) => {
        console.error("Erro ao carregar clientes:", error);
      });
    return () => {
      isMounted = false;
    };
  }, []);

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
          <Button
            label="Novo Cliente"
            variant="primary"
            onClick={() =>
              navigate(`/${NAVIGATION_ROUTES.NEW_CUSTOMER}`)
            }
          />
        }
      />
      <Col className="p-2">
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
