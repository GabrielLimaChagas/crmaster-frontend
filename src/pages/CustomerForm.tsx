import { useEffect, useRef } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useParams, useNavigate, useLocation } from "react-router";
import Header from "../components/base/Header";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import Form from "../components/core/Form";
import Row from "../components/core/Row";
import TextAreaInput from "../components/core/TextAreaInput";
import Input from "../components/core/Input";
import { customerService, type CustomerFormData, type CustomerItem } from "../services/api";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";

type CustomerFormFields = {
  name: string;
  birth: string;
  phone: string;
  email: string;
  notes: string;
};

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateCustomer = (location.state as { customer?: CustomerItem } | null)?.customer;
  const isInitializedRef = useRef<string | null>(null);

  const methods = useForm<CustomerFormFields>({
    defaultValues: {
      name: stateCustomer?.name || "",
      birth: stateCustomer?.birth || "",
      phone: stateCustomer?.phone || stateCustomer?.cel || "",
      email: stateCustomer?.email || "",
      notes: stateCustomer?.notes || "",
    },
  });

  const { reset } = methods;

  useEffect(() => {
    // 1. Modo de criação (sem ID)
    if (!id) {
      if (isInitializedRef.current !== "new") {
        reset({
          name: "",
          birth: "",
          phone: "",
          email: "",
          notes: "",
        });
        isInitializedRef.current = "new";
      }
      return;
    }

    // 2. Se já foi inicializado para este mesmo ID, evita reset indevido
    if (isInitializedRef.current === String(id)) {
      return;
    }

    // 3. Se temos os dados passados pelo estado da rota, preenche uma única vez
    if (stateCustomer && String(stateCustomer.id) === String(id)) {
      reset({
        name: stateCustomer.name || "",
        birth: stateCustomer.birth || "",
        phone: stateCustomer.phone || stateCustomer.cel || "",
        email: stateCustomer.email || "",
        notes: stateCustomer.notes || "",
      });
      isInitializedRef.current = String(id);
      return;
    }

    // 4. Caso contrário (acesso direto ou F5), busca da API uma única vez
    let isSubscribed = true;
    customerService
      .getById(id)
      .then((customer) => {
        if (isSubscribed && isInitializedRef.current !== String(id)) {
          reset({
            name: customer.name || "",
            birth: customer.birth || "",
            phone: customer.phone || customer.cel || "",
            email: customer.email || "",
            notes: customer.notes || "",
          });
          isInitializedRef.current = String(id);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar dados do cliente:", error);
      });

    return () => {
      isSubscribed = false;
    };
  }, [id, stateCustomer, reset]);

  const onSubmit: SubmitHandler<CustomerFormFields> = async (data: CustomerFormData) => {
    try {
      console.log("[CustomerForm] Dados capturados no submit:", data);
      console.log("[CustomerForm] Enviando alteração para ID:", id, data);
      if (id) {
        await customerService.update(id, data);
      } else {
        await customerService.create(data);
      }
      navigate(`/${NAVIGATION_ROUTES.CUSTOMERS}`);
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert(`Erro ao salvar cliente: ${(error as Error).message}`);
    }
  };

  return (
    <Col className="w-full">
      <Header title="Clientes" />
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
