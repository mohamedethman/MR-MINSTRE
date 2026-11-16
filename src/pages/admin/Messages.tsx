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

const MessagesAdmin: React.FC = () => {
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
      toast.error("حدث خطأ أثناء جلب الرسائل");
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
    if (window.confirm("هل أنت متأكد من حذف هذه الرسالة؟")) {
      try {
        await deleteMessage(id);
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        toast.success("تم حذف الرسالة بنجاح");
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("حدث خطأ أثناء حذف الرسالة");
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mauritania-green"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark">
          إدارة الرسائل
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
                placeholder="بحث في الرسائل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-3 text-gray-400"
              />
            </div>

            {/* Messages */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <p className="text-center text-gray-500 py-4">لا توجد رسائل</p>
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
                          className={
                            message.lu
                              ? "text-gray-400"
                              : "text-mauritania-green"
                          }
                        />
                        <span className="ml-2 font-medium truncate">
                          {message.nom}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {message.datecreation
                          ? new Date(message.datecreation).toLocaleDateString(
                              "ar-EG"
                            )
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
                    من: {selectedMessage.nom} ({selectedMessage.email})
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedMessage.datecreation
                      ? new Date(selectedMessage.datecreation).toLocaleString(
                          "ar-EG"
                        )
                      : ""}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleReply(selectedMessage.email)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    title="رد"
                  >
                    <FontAwesomeIcon icon={faReply} />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id!)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    title="حذف"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-700 mb-2">محتوى الرسالة:</h3>
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
              <p className="text-gray-500">اختر رسالة لعرض محتواها</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default MessagesAdmin;
