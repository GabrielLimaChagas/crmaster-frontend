import { type SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router";
import Header from "../components/base/Header";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import Form from "../components/core/Form";
import Row from "../components/core/Row";
import TextAreaInput from "../components/core/TextAreaInput";
import Input from "../components/core/Input";

type CustomerFormFields = {
  name: string;
  price: string;
  description: string;
};

const CustomerForm = () => {
  const methods = useForm<CustomerFormFields>();

  const { id } = useParams();

  const onSubmit: SubmitHandler<CustomerFormFields> = (data) =>
    console.log(data);
  return (
    <Col className="w-full">
      <Header title="Customers" />
      <Col className="w-full p-2">
        <Col className="bg-white p-4 rounded-lg shadow-md">
          <Form
            className="flex flex-col gap-2"
            methods={methods}
            onSubmit={onSubmit}
          >
            <Row className="gap-16">
              <Col className="w-full">
                <Input name="name" label="Nome" />
                <Input name="birth" label="Nascimento" type="date" />
                <Input name="phone" label="Telefone" type="tel" />
                <Input name="email" label="E-mail" type="email" />
                <TextAreaInput name="notes" label="Observações" rows={7} />
                <Button
                  type="submit"
                  label="Salvar Alterações"
                  variant="primary"
                  className="mt-4"
                />
              </Col>
            </Row>
          </Form>
        </Col>
      </Col>
    </Col>
  );
};

export default CustomerForm;
