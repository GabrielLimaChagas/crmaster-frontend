import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import Header from "../components/base/Header";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import Form from "../components/core/Form";
import Input from "../components/core/Input";
import Row from "../components/core/Row";

interface NewCompanyFormFields {
  companyName: string;
  cnpj: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  plugins: string[];
}

const AVAILABLE_PLUGINS = [
  { id: "whatsapp_integration", label: "Integração com WhatsApp" },
  { id: "financial_reports", label: "Relatórios Financeiros Avançados" },
  { id: "electronic_invoicing", label: "Emissão de Nota Fiscal (NF-e)" },
  { id: "ai_sales_copilot", label: "Copiloto de Vendas com IA" },
  { id: "inventory_sync", label: "Sincronização de Estoque" },
  { id: "payment_gateway", label: "Gateway de Pagamento Integrado" },
];

const NewCompany: React.FC = () => {
  const navigate = useNavigate();

  const methods = useForm<NewCompanyFormFields>({
    defaultValues: {
      companyName: "",
      cnpj: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      plugins: ["whatsapp_integration"],
    },
  });

  const onSubmit: SubmitHandler<NewCompanyFormFields> = async (data) => {
    try {
      console.log("[NewCompany] Dados da nova empresa cadastrada:", data);
      alert("Empresa e usuário administrador cadastrados com sucesso!");
      navigate(-1);
    } catch (error) {
      console.error("Erro ao cadastrar empresa:", error);
      alert(`Erro ao cadastrar empresa: ${(error as Error).message}`);
    }
  };

  return (
    <Col className="w-full min-h-screen bg-neutral-100">
      <Header title="Cadastrar Nova Empresa" />
      <Col className="items-center w-full p-4">
        <Col className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 max-w-2xl">
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
                name="companyName"
                label="Nome da Empresa"
                placeholder="Ex: Minha Empresa LTDA"
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
                name="adminName"
                label="Nome do Usuário Admin"
                placeholder="Ex: João da Silva"
                options={{ required: "O nome do administrador é obrigatório" }}
              />
              <Input
                name="adminEmail"
                label="E-mail do Usuário Admin"
                type="email"
                placeholder="admin@empresa.com"
                options={{ required: "O e-mail do administrador é obrigatório" }}
              />
              <Input
                name="adminPassword"
                label="Senha do Usuário Admin"
                type="password"
                placeholder="••••••••"
                options={{ required: "A senha do administrador é obrigatória" }}
              />
            </Col>

            <hr className="border-neutral-200 my-1" />

            {/* Plugins Habilitados */}
            <Col className="gap-2">
              <span className="text-sm font-semibold text-neutral-800 uppercase tracking-wide">
                Plugins da Empresa
              </span>
              <p className="text-xs text-neutral-500 mb-1">
                Selecione os plugins e módulos ativos para esta empresa:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_PLUGINS.map((plugin) => (
                  <label
                    key={plugin.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer text-sm text-neutral-700 select-none"
                  >
                    <input
                      type="checkbox"
                      value={plugin.id}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      {...methods.register("plugins")}
                    />
                    <span>{plugin.label}</span>
                  </label>
                ))}
              </div>
            </Col>

            {/* Botões de Ação */}
            <Row className="gap-3 mt-4">
              <Button
                type="submit"
                label="Cadastrar Empresa"
                variant="primary"
              />
              <Button
                type="button"
                label="Cancelar"
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
