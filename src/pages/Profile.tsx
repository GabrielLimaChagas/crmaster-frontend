import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  BellAlertIcon,
  CheckBadgeIcon,
  CubeTransparentIcon,
  UserCircleIcon,
  BuildingOffice2Icon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/20/solid";
import Header from "../components/base/Header";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import Form from "../components/core/Form";
import Input from "../components/core/Input";
import Row from "../components/core/Row";
import { NAVIGATION_ROUTES } from "../consts/navigationRoutes";
import { useAuth } from "../contexts/AuthContext";
import {
  companyService,
  userService,
  type CompanyItem,
  type UserItem,
  type PluginItem,
} from "../services/api";

type ProfileFormFields = {
  user_name: string;
  user_email: string;
  company_name: string;
  company_cnpj: string;
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [currentCompany, setCurrentCompany] = useState<CompanyItem | null>(null);
  const [activePlugins, setActivePlugins] = useState<PluginItem[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const methods = useForm<ProfileFormFields>({
    defaultValues: {
      user_name: "",
      user_email: "",
      company_name: "",
      company_cnpj: "",
    },
  });

  const { reset } = methods;

  // Carrega dados do Usuário, Empresa e Plugins do Backend
  const loadProfileData = async () => {
    try {
      const [users, companies] = await Promise.all([
        userService.getAll().catch(() => []),
        companyService.getAll().catch(() => []),
      ]);

      // Prioriza o usuário autenticado na sessão
      const currentUserId = authUser?.id || authUser?.user_id;
      const user =
        (currentUserId ? users.find((u) => u.id === currentUserId) : null) ||
        (users && users.length > 0 ? users[0] : null);

      const targetCompanyId =
        user?.company_id ||
        authUser?.company_id ||
        (companies && companies.length > 0 ? companies[0].id : 1);

      let company: CompanyItem | null = null;
      if (targetCompanyId) {
        try {
          company = await companyService.getById(targetCompanyId);
        } catch {
          company = companies?.find((c) => c.id === targetCompanyId) || null;
        }
      }

      setCurrentUser(user);
      setCurrentCompany(company);

      reset({
        user_name: user?.name || authUser?.name || "",
        user_email: user?.email || authUser?.email || "",
        company_name: company?.name || "",
        company_cnpj: company?.cnpj || "",
      });

      // Plugins ativos
      if (company?.plugins && company.plugins.length > 0) {
        setActivePlugins(company.plugins);
      } else if (company?.id) {
        try {
          const plugins = await companyService.getPlugins(company.id);
          setActivePlugins(plugins || []);
        } catch {
          setActivePlugins([]);
        }
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Não foi possível concluir a ação. Tente novamente.",
      });
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [authUser]);

  // Submissão com salvamento de dados cadastrais
  const onSubmit: SubmitHandler<ProfileFormFields> = async (formData) => {
    setFeedback(null);
    setIsSaving(true);

    const updatePromises: Promise<any>[] = [];

    // Edição cadastral do Usuário
    const userIdToUpdate = currentUser?.id || authUser?.id || authUser?.user_id;
    if (userIdToUpdate) {
      updatePromises.push(
        userService.update(userIdToUpdate, {
          name: formData.user_name.trim(),
          email: formData.user_email.trim(),
        })
      );
    }

    // Edição cadastral da Empresa
    if (currentCompany?.id) {
      updatePromises.push(
        companyService.update(currentCompany.id, {
          company_name: formData.company_name.trim(),
          cnpj: formData.company_cnpj.trim(),
        })
      );
    }

    try {
      await Promise.all(updatePromises);
      setFeedback({
        type: "success",
        text: "Informações cadastrais atualizadas com sucesso!",
      });
      loadProfileData();
    } catch {
      setFeedback({
        type: "error",
        text: "Não foi possível concluir a ação. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Col className="w-full min-h-screen bg-neutral-100">
      <Header
        title="Perfil do Usuário & Empresa"
        rightAttachment={
          <Row className="items-center gap-2">
            <Button
              type="button"
              label="Ver Notificações"
              variant="secondary"
              className="flex items-center gap-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-medium"
              onClick={() => navigate(`/${NAVIGATION_ROUTES.NOTIFICATIONS}`)}
              leftAttachment={<BellAlertIcon className="w-4 h-4 mr-1 inline text-blue-600" />}
            />
            <Button
              type="button"
              label="Sair"
              variant="secondary"
              className="flex items-center gap-1.5 border border-red-200 hover:bg-red-50 text-red-600 font-medium cursor-pointer"
              onClick={logout}
              leftAttachment={<ArrowRightOnRectangleIcon className="w-4 h-4 mr-1 inline text-red-600" />}
            />
          </Row>
        }
      />

      <Col className="w-full p-4 gap-6 max-w-6xl">
        {feedback && (
          <div
            className={`p-4 rounded-xl border text-sm font-medium ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Linha Principal: Formulário Cadastral + Plugins Ativos */}
        <Row className="w-full gap-6 items-start flex-col lg:flex-row">
          {/* Formulário de Edição Cadastral */}
          <Col className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex-1 w-full">
            <Form className="w-full flex flex-col gap-5" methods={methods} onSubmit={onSubmit}>
              {/* Usuário Atual */}
              <Col className="gap-3">
                <Row className="items-center gap-2 text-neutral-800">
                  <UserCircleIcon className="w-5 h-5 text-blue-600" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Dados do Usuário (Logado)
                  </h2>
                  {(currentUser?.role || authUser?.role) && (
                    <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {currentUser?.role || authUser?.role}
                    </span>
                  )}
                </Row>
                <Input
                  name="user_name"
                  label="Nome Completo"
                  options={{ required: "O nome de usuário é obrigatório" }}
                />
                <Input
                  name="user_email"
                  label="E-mail de Acesso"
                  type="email"
                  options={{ required: "O e-mail é obrigatório" }}
                />
              </Col>

              <hr className="border-neutral-200 my-1" />

              {/* Empresa Atual */}
              <Col className="gap-3">
                <Row className="items-center gap-2 text-neutral-800">
                  <BuildingOffice2Icon className="w-5 h-5 text-blue-600" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Dados da Empresa
                  </h2>
                  {currentCompany?.id && (
                    <span className="ml-auto text-xs text-neutral-500">
                      ID da Empresa: #{currentCompany.id}
                    </span>
                  )}
                </Row>
                <Input
                  name="company_name"
                  label="Razão Social / Nome Fantasia"
                  options={{ required: "O nome da empresa é obrigatório" }}
                />
                <Input
                  name="company_cnpj"
                  label="CNPJ"
                  options={{ required: "O CNPJ é obrigatório" }}
                />
              </Col>

              <Row className="mt-2">
                <Button
                  type="submit"
                  label={isSaving ? "Salvando alterações..." : "Salvar Alterações"}
                  variant="primary"
                  disabled={isSaving}
                />
              </Row>
            </Form>
          </Col>

          {/* Módulos e Plugins Ativos */}
          <Col className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 w-full lg:w-96 gap-4">
            <Row className="items-center gap-2 text-neutral-800">
              <CubeTransparentIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                Plugins / Módulos Ativos
              </h2>
            </Row>
            <p className="text-xs text-neutral-500">
              Módulos liberados e operantes na assinatura desta empresa:
            </p>

            <Col className="gap-2">
              {activePlugins.length > 0 ? (
                activePlugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className="flex items-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm font-medium"
                  >
                    <CheckBadgeIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>{plugin.name}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                  Nenhum plugin adicional vinculado a esta empresa.
                </div>
              )}
            </Col>
          </Col>
        </Row>
      </Col>
    </Col>
  );
};

export default Profile;
