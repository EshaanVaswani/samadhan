"use client";

import { useAtomValue } from "jotai";

import { screenAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen";
import { WidgetErrorScreen } from "@/modules/widget/ui/screens/widget-error-screen";
import { WidgetLoadingScreen } from "@/modules/widget/ui/screens/widget-loading-screen";
import { WidgetSelectionScreen } from "@/modules/widget/ui/screens/widget-selection-screen";
import { WidgetChatScreen } from "@/modules/widget/ui/screens/widget-chat-screen";
import { WidgetInboxScreen } from "@/modules/widget/ui/screens/widget-inbox-screen";

interface Props {
   organizationId: string;
}

export const WidgetView = ({ organizationId }: Props) => {
   const screen = useAtomValue(screenAtom);

   const screenComponents = {
      loading: <WidgetLoadingScreen organizationId={organizationId} />,
      error: <WidgetErrorScreen />,
      auth: <WidgetAuthScreen />,
      selection: <WidgetSelectionScreen />,
      voice: <p>TODO: Voice</p>,
      inbox: <WidgetInboxScreen />,
      chat: <WidgetChatScreen />,
      contact: <p>TODO: Contact</p>,
   };

   return (
      <main className="min-h-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
         {screenComponents[screen]}
      </main>
   );
};
