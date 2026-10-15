import { useEffect, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import Header from "../components/base/Header";
import Button from "../components/core/Button";
import Col from "../components/core/Col";
import IconButton from "../components/core/IconButton";
import Row from "../components/core/Row";
import { notificationService, type NotificationItem } from "../services/api";

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "Revisão",
    content: "Fulano da Silva precisa fazer a revisão da Roçadeira Stihl",
    createdAt: "27/08",
  },
  {
    id: 2,
    title: "Aniversário",
    content: "Fulano da Silva está fazendo aniversário hoje",
    createdAt: "25/08",
  },
];

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    let isMounted = true;
    notificationService
      .getAll()
      .then((items) => {
        if (isMounted && items && Array.isArray(items) && items.length > 0) {
          setNotifications(items);
        }
      })
      .catch((error) => {
        console.warn(
          "Integração com backend (/notifications) em andamento. Utilizando dados base:",
          error,
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Deseja realmente excluir esta notificação?")) return;

    try {
      await notificationService.delete(id);
    } catch (error) {
      console.warn(
        "Base de integração: tentativa de exclusão no backend:",
        error,
      );
    }

    setNotifications((prev) =>
      prev.filter((item) => String(item.id) !== String(id)),
    );
  };

  const handleClearAll = async () => {
    if (!window.confirm("Deseja realmente limpar todas as notificações?")) return;

    try {
      await notificationService.clearAll();
    } catch (error) {
      console.warn("Base de integração: tentativa de limpar notificações:", error);
    }

    setNotifications([]);
  };

  return (
    <Col className="w-full min-h-screen bg-neutral-100">
      <Header
        title="Notificações"
        rightAttachment={
          <Button
            label="Limpar"
            variant="secondary"
            className="bg-neutral-300 hover:bg-neutral-400 text-neutral-700 font-medium px-4 py-1.5 rounded-lg transition"
            onClick={handleClearAll}
          />
        }
      />

      <Col className="p-4 gap-3 w-full">
        {notifications.length === 0 ? (
          <Col className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 items-center justify-center text-neutral-500">
            Nenhuma notificação no momento.
          </Col>
        ) : (
          notifications.map((item) => (
            <Row
              key={item.id}
              className="bg-white px-5 py-3.5 rounded-2xl shadow-xs border border-neutral-200 justify-between items-center w-full"
            >
              <Row className="items-center gap-4 text-sm text-neutral-800">
                <span className="text-neutral-400 font-normal shrink-0">
                  {item.createdAt}
                </span>
                <span className="font-medium text-neutral-800">
                  {item.content}
                </span>
              </Row>

              <IconButton
                icon={
                  <TrashIcon className="w-5 h-5 text-neutral-600 hover:text-red-600 cursor-pointer transition shrink-0" />
                }
                onClick={() => handleDelete(item.id)}
                title="Excluir notificação"
              />
            </Row>
          ))
        )}
      </Col>
    </Col>
  );
};

export default NotificationList;
