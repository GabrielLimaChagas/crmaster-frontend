import { useEffect, useRef } from "react";
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
  const isInitializedRef = useRef<string | null>(null);

  const methods = useForm<ProductFormFields>({
    defaultValues: {
      name: stateProduct?.name || "",
      price: getPriceString(stateProduct),
      description: stateProduct?.description || "",
    },
  });

  const { reset } = methods;

  useEffect(() => {
    // 1. Modo de criação (sem ID)
    if (!id) {
      if (isInitializedRef.current !== "new") {
        reset({
          name: "",
          price: "",
          description: "",
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
    if (stateProduct && String(stateProduct.id) === String(id)) {
      reset({
        name: stateProduct.name || "",
        price: getPriceString(stateProduct),
        description: stateProduct.description || "",
      });
      isInitializedRef.current = String(id);
      return;
    }

    // 4. Caso contrário (acesso direto ou F5), busca da API uma única vez
    let isSubscribed = true;
    productService
      .getById(id)
      .then((product) => {
        if (isSubscribed && isInitializedRef.current !== String(id)) {
          reset({
            name: product.name || "",
            price: getPriceString(product),
            description: product.description || "",
          });
          isInitializedRef.current = String(id);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar produto:", error);
      });

    return () => {
      isSubscribed = false;
    };
  }, [id, stateProduct, reset]);

  const onSubmit: SubmitHandler<ProductFormFields> = async (data: ProductFormData) => {
    try {
      const currentValues = methods.getValues();
      const payload: ProductFormData = {
        name: (data?.name ?? currentValues.name ?? "").trim(),
        price: (data?.price ?? currentValues.price ?? "").trim(),
        description: (data?.description ?? currentValues.description ?? "").trim(),
      };

      console.log("[ProductForm] Dados capturados no submit:", payload);
      console.log("[ProductForm] Enviando alteração para ID:", id, payload);

      if (id) {
        await productService.update(id, payload);
      } else {
        await productService.create(payload);
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
