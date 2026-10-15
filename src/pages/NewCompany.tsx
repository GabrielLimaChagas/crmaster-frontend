import React, { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import Header from "../components/base/Header";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import Form from "../components/core/Form";
import Input from "../components/core/Input";
import Row from "../components/core/Row";
import { companyService, pluginService, type PluginItem, type OnboardingPayload } from "../services/api";

interface NewCompanyFormFields {
  company_name: string;
  cnpj: string;
  user_name: string;
  user_email: string;
  password: string;
  plugin_ids: number[];
}

const DEFAULT_PLUGINS: PluginItem[] = [
  { id: 1, name: "Módulo Vendas & Pipeline Pro" },
  { id: 2, name: "Integração WhatsApp & Mensageria" },
  { id: 3, name: "Analytics & Dashboard Executivo" },
];

const NewCompany: React.FC = () => {
  const navigate = useNavigate();
  const [pluginsList, setPluginsList] = useState<PluginItem[]>(DEFAULT_PLUGINS);
  const [selectedPluginIds, setSelectedPluginIds] = useState<number[]>([1]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<NewCompanyFormFields>({
    defaultValues: {
      company_name: "",
      cnpj: "",
      user_name: "",
      user_email: "",
      password: "",
      plugin_ids: [1],
    },
  });

  const { reset } = methods;

  // Carrega plugins reais do backend via GET /api/plugins
  useEffect(() => {
    pluginService
      .getAll()
      .then((data) => {
        if (data && data.length > 0) {
          setPluginsList(data);
        }
      })
      .catch((err) => {
        console.warn("Utilizando plugins pré-definidos (fallback):", err);
      });
  }, []);

  const togglePlugin = (id: number) => {
    setSelectedPluginIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Cadastro de Nova Empresa
  const onSubmit: SubmitHandler<NewCompanyFormFields> = async (formData, event) => {
    if (event) {
      event.preventDefault();
    }

    setFeedback(null);
    setIsSubmitting(true);

    const payload: OnboardingPayload = {
      company_name: formData.company_name.trim(),
      cnpj: formData.cnpj.trim(),
      user_name: formData.user_name.trim(),
      user_email: formData.user_email.trim(),
      password: formData.password.trim(),
      plugin_ids: selectedPluginIds.length > 0 ? selectedPluginIds : [1],
    };

    try {
      await companyService.onboard(payload);

      // Em caso de sucesso:
      alert("Empresa cadastrada com sucesso!");
      setFeedback({
        type: "success",
        text: "Empresa cadastrada com sucesso!",
      });

      // Limpa o formulário
      reset({
        company_name: "",
        cnpj: "",
        user_name: "",
        user_email: "",
        password: "",
        plugin_ids: [1],
      });
      setSelectedPluginIds([1]);
    } catch {
      const msg = "Não foi possível concluir a ação. Tente novamente.";
      setFeedback({
        type: "error",
        text: msg,
      });
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Col className="w-full min-h-screen bg-neutral-100">
      <Header title="Cadastrar Nova Empresa" />
      <Col className="items-center w-full p-4">
        <Col className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 max-w-2xl w-full">
          {feedback && (
            <div
              className={`mb-4 p-4 rounded-xl border text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {feedback.text}
            </div>
          )}

          <Form
            className="w-full flex flex-col gap-5"
            methods={methods}
            onSubmit={onSubmit}
          >
            {/* Dados da Empresa */}
            <Col className="gap-3">
              <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">
                Dados da Empresa
              </h2>
              <Input
                name="company_name"
                label="Nome da Empresa / Razão Social"
                placeholder="Ex: Minha Empresa Inovadora LTDA"
                options={{ required: "O nome da empresa é obrigatório" }}
              />
              <Input
                name="cnpj"
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                options={{ required: "O CNPJ é obrigatório" }}
              />
            </Col>

            <hr className="border-neutral-200 my-1" />

            {/* Administrador Responsável */}
            <Col className="gap-3">
              <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">
                Usuário Administrador
              </h2>
              <Input
                name="user_name"
                label="Nome do Administrador"
                placeholder="Ex: Carlos Roberto Mendes"
                options={{ required: "O nome do administrador é obrigatório" }}
              />
              <Input
                name="user_email"
                label="E-mail do Administrador"
                type="email"
                placeholder="admin@empresa.com"
                options={{ required: "O e-mail do administrador é obrigatório" }}
              />
              <Input
                name="password"
                label="Senha de Acesso"
                type="password"
                placeholder="••••••••"
                options={{ required: "A senha do administrador é obrigatória" }}
              />
            </Col>

            <hr className="border-neutral-200 my-1" />

            {/* Plugins e Módulos */}
            <Col className="gap-2">
              <span className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">
                Plugins / Módulos Habilitados
              </span>
              <p className="text-xs text-neutral-500 mb-1">
                Selecione os módulos cadastrados no sistema que serão ativados para esta empresa:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pluginsList.map((plugin) => {
                  const isChecked = selectedPluginIds.includes(plugin.id);
                  return (
                    <label
                      key={plugin.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm select-none transition ${
                        isChecked
                          ? "border-blue-500 bg-blue-50 text-blue-900 font-medium"
                          : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePlugin(plugin.id)}
                        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                      <span>{plugin.name}</span>
                    </label>
                  );
                })}
              </div>
            </Col>

            {/* Botões de Ação */}
            <Row className="gap-3 mt-4">
              <Button
                type="submit"
                label={isSubmitting ? "Cadastrando e enviando..." : "Cadastrar Empresa"}
                variant="primary"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                label="Voltar"
                variant="secondary"
                className="border border-neutral-300 hover:bg-neutral-100 text-neutral-700"
                onClick={() => navigate(-1)}
              />
            </Row>
          </Form>
        </Col>
      </Col>
    </Col>
  );
};

export default NewCompany;
