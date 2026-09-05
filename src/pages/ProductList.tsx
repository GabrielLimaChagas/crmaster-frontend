import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import Header from "../components/base/Header";
import Table from "../components/base/Table";
import Col from "../components/core/Col";
import Row from "../components/core/Row";
import IconButton from "../components/core/IconButton";
import Button from "../components/core/Button";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";

const MOCK_DATA = [
  { id: "1", name: "Roçadeira Stihl", price: 25999 },
  { id: "2", name: "Óleo 2T", price: 3299 },
];

const formatCentAsReal = (value = 0) =>
  (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const ProductList = () => {
  return (
    <Col className="w-full">
      <Header
        title="Produtos"
        rightAttachment={
          <Button
            label="Novo Produto"
            variant="primary"
            onClick={() => window.navigation.navigate(NAVIGATION_ROUTES.NEW_PRODUCT)}
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
                  <IconButton icon={<PencilSquareIcon className="w-5 h-5" />} />
                  <IconButton icon={<TrashIcon className="w-5 h-5" />} />
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

export default ProductList;
