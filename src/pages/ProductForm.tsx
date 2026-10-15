import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useParams, useNavigate, useLocation } from "react-router";
import Col from "../components/core/Col";
import Form from "../components/core/Form";
import Input from "../components/core/Input";
import Button from "../components/core/Button";
import Row from "../components/core/Row";
import Header from "../components/base/Header";
import { productService, type ProductFormData, type ProductItem } from "../services/api";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";

type ProductFormFields = {
  name: string;
  price: string;
  description: string;
};

const getPriceString = (p?: ProductItem | null): string => {
  if (!p) return "";
  if (p.raw_price) return String(p.raw_price);
  if (typeof p.price === "number") {
    return (p.price / 100).toFixed(2);
  }
  return String(p.price || "");
};

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateProduct = (location.state as { product?: ProductItem } | null)?.product;

  const methods = useForm<ProductFormFields>({
    defaultValues: {
      name: stateProduct?.name || "",
      price: getPriceString(stateProduct),
      description: stateProduct?.description || "",
    },
  });

  const { reset } = methods;

  useEffect(() => {
    if (!id) {
      reset({
        name: "",
        price: "",
        description: "",
      });
      return;
    }

    if (stateProduct && String(stateProduct.id) === String(id)) {
      reset({
        name: stateProduct.name || "",
        price: getPriceString(stateProduct),
        description: stateProduct.description || "",
      });
      return;
    }

    let isSubscribed = true;
    productService
      .getById(id)
      .then((product) => {
        if (isSubscribed) {
          reset({
            name: product.name || "",
            price: getPriceString(product),
            description: product.description || "",
          });
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar produto:", error);
      });

    return () => {
      isSubscribed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // DEPENDÊNCIA EXCLUSIVA: ID DA ROTA. Não reexecuta durante digitação!

  const onSubmit: SubmitHandler<ProductFormFields> = async (data: ProductFormData) => {
    try {
      console.log("[ProductForm] Enviando alteração para ID:", id, data);
      if (id) {
        await productService.update(id, data);
      } else {
        await productService.create(data);
      }
      navigate(`/${NAVIGATION_ROUTES.PRODUCTS}`);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert(`Erro ao salvar produto: ${(error as Error).message}`);
    }
  };

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
            <Input name="name" label="Nome" />
            <Input name="price" label="Preço" />
            <Input name="description" label="Descrição" />
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
