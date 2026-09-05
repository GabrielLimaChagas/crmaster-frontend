import { type SubmitHandler, useForm } from "react-hook-form";
import Col from "../components/core/Col";
import Form from "../components/core/Form";
import TextInput from "../components/core/TextInput";
import Button from "../components/core/Button";
import Row from "../components/core/Row";
import Header from "../components/base/Header";

type ProductFormFields = {
  name: string;
  price: string;
  description: string;
};

const ProductForm = () => {
  const methods = useForm<ProductFormFields>();

  const onSubmit: SubmitHandler<ProductFormFields> = (data) =>
    console.log(data);
  return (
    <Col className="w-full">
      <Header
        title="Produtos"
      />
      <Col className="w-full p-2">
        <Col className="bg-white p-4 rounded-lg shadow-md">
          <Form
            className="flex flex-col gap-2 max-w-100"
            methods={methods}
            onSubmit={onSubmit}
          >
            <TextInput name="name" label="Nome" />
            <TextInput name="price" label="Preço" />
            <TextInput name="description" label="Descrição" />
            <Row>
              <Button
                type="submit"
                label="Salvar Alterações"
                variant="primary"
              />
            </Row>
          </Form>
        </Col>
      </Col>
    </Col>
  );
};

export default ProductForm;
