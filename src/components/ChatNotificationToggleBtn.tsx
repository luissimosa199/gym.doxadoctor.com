import React, { FunctionComponent, useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { useQuery } from "@tanstack/react-query";
import useServiceWorker from "@/hooks/useServiceWorker";

interface ChatNotificationToggleBtnProps {
  channelName: string;
}

const fetchSubscriptionStatus = async (
  user_agent_id: string,
  conversationId: string
) => {
  const response = await fetch(
    `/api/chatSubscription?user_agent_id=${user_agent_id}&conversationId=${conversationId}`,
    { method: "GET" }
  );
  return response.json();
};

const ChatNotificationToggleBtn: FunctionComponent<
  ChatNotificationToggleBtnProps
> = ({ channelName }) => {
  const user_agent_id = getCookie("user_agent_id");

  const { requestNotificationPermission, unsubscribeFromNotifications } =
    useServiceWorker("/service-worker.js", channelName);

  const { data, isLoading } = useQuery(
    ["subscriptionStatus", user_agent_id, channelName],
    () => fetchSubscriptionStatus(user_agent_id as string, channelName)
  );

  if (isLoading || !data) {
    return (
      <button
        className="rounded-lg bg-blue-200 px-1 text-sm"
        disabled
      >
        Verificando...
      </button>
    );
  }

  const handleClick = data.isSubscribed
    ? unsubscribeFromNotifications
    : requestNotificationPermission;

  return (
    <div>
      <button
        className="rounded-lg bg-blue-200 px-1 text-sm"
        onClick={handleClick}
      >
        {data.isSubscribed
          ? "Desactivar Notificaciones"
          : "Activar Notificaciones"}
      </button>
    </div>
  );
};

export default ChatNotificationToggleBtn;
