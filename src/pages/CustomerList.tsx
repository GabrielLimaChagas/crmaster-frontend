import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import Header from "../components/base/Header";
import Table from "../components/base/Table";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import IconButton from "../components/core/IconButton";
import Row from "../components/core/Row";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";

const MOCK_DATA = [
  { id: "1", name: "Maria", pipelinesCount: 2 },
  { id: "2", name: "Antônio", pipelinesCount: 27 },
];

const CustomerList = () => {
  return (
    <Col className="w-full">
      <Header
        title="Produtos"
        rightAttachment={
          <Button
            label="Novo Cliente"
            variant="primary"
            onClick={() =>
              window.navigation.navigate(NAVIGATION_ROUTES.NEW_CUSTOMER)
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
                    icon={
                      <PencilSquareIcon
                        className="w-5 h-5"
                        onClick={() =>
                          window.navigation.navigate(
                            `${NAVIGATION_ROUTES.CUSTOMERS}/${item.id}`,
                          )
                        }
                      />
                    }
                  />
                  <IconButton
                    icon={<TrashIcon className="w-5 h-5" />}
                    onClick={() =>
                      null // integrar
                    }
                  />
                </Row>
              ),
            },
          ]}
          data={MOCK_DATA}
          keyExtractor={(item: { id: string }) => item.id}
        />
      </Col>
    </Col>
  );
};

export default CustomerList;
