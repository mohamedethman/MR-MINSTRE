// src/pages/admin/Messages.tsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTrash,
  faEnvelope,
  faEnvelopeOpen,
  faReply,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { getMessages, deleteMessage, updateMessage } from "../../services/api";

import { Message } from "../../types/types";
import AdminLayout from "./AdminLayout";
import { useT } from "../../i18n";
import { useConfirm } from "../../components/ConfirmDialog";

const MessagesAdmin: React.FC = () => {
  const { t, formatDate } = useT();
  const confirm = useConfirm();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await getMessages();
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(t("حدث خطأ أثناء جلب الرسائل", "Erreur lors du chargement des messages"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);

    // Mark as read if not already read
    if (!message.lu) {
      try {
        await updateMessage(message.id!, { ...message, lu: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, lu: true } : m))
        );
      } catch (error) {
        console.error("Error updating message:", error);
      }
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (await confirm(t("هل أنت متأكد من حذف هذه الرسالة؟", "Voulez-vous vraiment supprimer ce message ?"))) {
      try {
        await deleteMessage(id);
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        toast.success(t("تم حذف الرسالة بنجاح", "Message supprimé avec succès"));
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error(t("حدث خطأ أثناء حذف الرسالة", "Erreur lors de la suppression du message"));
      }
    }
  };

  const handleReply = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const filteredMessages = messages.filter(
    (message) =>
      message.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.objet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-mauritania-green"
            role="status"
            aria-label={t("جاري التحميل...", "Chargement…")}
          ></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark">
          {t("إدارة الرسائل", "Gestion des messages")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            {/* Search */}
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder={t("بحث في الرسائل...", "Rechercher dans les messages…")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full ps-3 pe-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute end-3 top-3 text-gray-400"
              />
            </div>

            {/* Messages */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <p className="text-center text-gray-500 py-4">{t("لا توجد رسائل", "Aucun message")}</p>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id
                        ? "border-mauritania-green bg-mauritania-green-light"
                        : message.lu
                        ? "border-gray-200 bg-gray-50"
                        : "border-mauritania-green bg-white"
                    }`}
                    onClick={() => handleViewMessage(message)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={message.lu ? faEnvelopeOpen : faEnvelope}
                          title={message.lu ? t("مقروءة", "Lu") : t("غير مقروءة", "Non lu")}
                          className={
                            message.lu
                              ? "text-gray-400"
                              : "text-mauritania-green"
                          }
                        />
                        <span className="ms-2 font-medium truncate">
                          {message.nom}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {message.datecreation
                          ? formatDate(message.datecreation, {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {message.objet}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedMessage.objet}
                  </h2>
                  <p className="text-gray-600">
                    {t("من:", "De :")} {selectedMessage.nom} ({selectedMessage.email})
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedMessage.datecreation
                      ? formatDate(selectedMessage.datecreation, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReply(selectedMessage.email)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    title={t("رد", "Répondre")}
                    aria-label={t("رد", "Répondre")}
                  >
                    <FontAwesomeIcon icon={faReply} />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id!)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    title={t("حذف", "Supprimer")}
                    aria-label={t("حذف", "Supprimer")}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-700 mb-2">{t("محتوى الرسالة:", "Contenu du message :")}</h3>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-4xl text-gray-300 mb-4"
              />
              <p className="text-gray-500">{t("اختر رسالة لعرض محتواها", "Sélectionnez un message pour afficher son contenu")}</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default MessagesAdmin;
