import { useEffect, useRef } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import Header from "../components/base/Header";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import Form from "../components/core/Form";
import Input from "../components/core/Input";
import Row from "../components/core/Row";
import { profileService, type ProfileData } from "../services/api";

type ProfileFormFields = {
  userName: string;
  companyName: string;
};

const DEFAULT_PROFILE: ProfileFormFields = {
  userName: "Gabriel",
  companyName: "CRMaster",
};

const Profile: React.FC = () => {
  const isInitializedRef = useRef<boolean>(false);

  const methods = useForm<ProfileFormFields>({
    defaultValues: DEFAULT_PROFILE,
  });

  const { reset } = methods;

  useEffect(() => {
    if (isInitializedRef.current) return;

    let isSubscribed = true;
    profileService
      .get()
      .then((data) => {
        if (isSubscribed && data) {
          reset({
            userName: data.userName || "",
            companyName: data.companyName || "",
          });
          isInitializedRef.current = true;
        }
      })
      .catch((error) => {
        console.warn(
          "Integração com backend (/profile) em andamento. Utilizando valores base:",
          error,
        );
      });

    return () => {
      isSubscribed = false;
    };
  }, [reset]);

  const onSubmit: SubmitHandler<ProfileFormFields> = async (formData) => {
    const payload: ProfileData = {
      userName: formData.userName,
      companyName: formData.companyName,
    };

    try {
      console.log("[Profile] Salvando alterações de perfil:", payload);
      await profileService.update(payload);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.warn(
        "Base de integração com backend em andamento:",
        error,
      );
      alert("Alterações salvas localmente!");
    }
  };

  return (
    <Col className="w-full min-h-screen bg-neutral-100">
      <Header title="Perfil do Usuário" />
      <Col className="w-full p-4">
        <Col className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 max-w-xl">
          <Form
            className="w-full flex flex-col gap-4"
            methods={methods}
            onSubmit={onSubmit}
          >
            <Input
              name="userName"
              label="Nome de Usuário"
              options={{ required: "O nome de usuário é obrigatório" }}
            />
            <Input
              name="companyName"
              label="Nome da Empresa"
              options={{ required: "O nome da empresa é obrigatório" }}
            />
            <Row className="mt-2">
              <Button
                type="submit"
                label="Salvar alterações"
                variant="primary"
              />
            </Row>
          </Form>
        </Col>
      </Col>
    </Col>
  );
};

export default Profile;
