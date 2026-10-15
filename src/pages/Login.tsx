import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Logo from "../assets/crmaster.svg";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/auth";

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    try {
      const user = await authService.login({
        username: cleanIdentifier,
        email: cleanIdentifier,
        password: cleanPassword,
      });

      login(user);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.message || "Usuário ou senha inválidos.";
      if (msg.includes("Usuário ou senha inválidos")) {
        setErrorMessage("Usuário ou senha inválidos.");
      } else {
        setErrorMessage("Não foi possível concluir a ação. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 sm:p-10 transition-all">
        {/* Logo e Cabeçalho */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src={Logo} alt="CRMaster Logo" className="h-10 mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">
            Acesse sua Conta
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Entre com suas credenciais para acessar o painel de gestão
          </p>
        </div>

        {/* Feedback de Erro */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2.5 animate-fadeIn">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Campo Usuário / E-mail */}
          <div className="flex flex-col gap-1.5 text-left">
            <label
              htmlFor="identifier"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-700"
            >
              Nome de Usuário ou E-mail
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400">
                <UserIcon className="w-5 h-5" />
              </span>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ex: usuario@crmaster.com"
                disabled={isLoading}
                required
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="flex flex-col gap-1.5 text-left">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-700"
            >
              Senha
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400">
                <LockClosedIcon className="w-5 h-5" />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
                className="w-full pl-11 pr-11 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 text-neutral-400 hover:text-neutral-600 focus:outline-none cursor-pointer"
                title={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-400">
          CRMaster CRM • Gestão Inteligente de Vendas
        </div>
      </div>
    </div>
  );
};

export default Login;
