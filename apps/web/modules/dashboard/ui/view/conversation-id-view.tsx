"use client";

import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useAction, useMutation, useQuery } from "convex/react";
import { MoreHorizontal, Wand2Icon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";

import { cn } from "@workspace/ui/lib/utils";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
   AIConversation,
   AIConversationContent,
   AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
   AIInput,
   AIInputButton,
   AIInputSubmit,
   AIInputTextarea,
   AIInputToolbar,
   AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
   AIMessage,
   AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";

import { ConversationStatusButton } from "@/modules/dashboard/ui/components/conversation-status-button";

const formSchema = z.object({
   message: z.string().min(1, "Message is required"),
});

export const ConversationIdView = ({
   conversationId,
}: {
   conversationId: Id<"conversations">;
}) => {
   const conversation = useQuery(api.private.conversations.getOne, {
      conversationId,
   });

   const messages = useThreadMessages(
      api.private.messages.getMany,
      conversation?.threadId
         ? {
              threadId: conversation.threadId,
           }
         : "skip",
      { initialNumItems: 10 }
   );

   const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
      useInfiniteScroll({
         status: messages.status,
         loadMore: messages.loadMore,
         loadSize: 10,
      });

   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         message: "",
      },
   });

   const createMessage = useMutation(api.private.messages.create);

   const onSubmit = async (values: z.infer<typeof formSchema>) => {
      try {
         await createMessage({
            conversationId,
            prompt: values.message,
         });

         form.reset();
      } catch (error) {
         console.error(error);
      }
   };

   const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

   const updateConversationStatus = useMutation(
      api.private.conversations.updateStatus
   );

   const handleToggleStatus = async () => {
      if (!conversation) return;

      setIsUpdatingStatus(true);

      let newStatus: "unresolved" | "escalated" | "resolved";

      // unresolved -> escalated -> resolved -> unresolved
      if (conversation.status === "unresolved") {
         newStatus = "escalated";
      } else if (conversation.status === "escalated") {
         newStatus = "resolved";
      } else {
         newStatus = "unresolved";
      }

      try {
         await updateConversationStatus({
            status: newStatus,
            conversationId,
         });
      } catch (error) {
         console.error(error);
      } finally {
         setIsUpdatingStatus(false);
      }
   };

   const [isEnhancing, setIsEnhancing] = useState(false);

   const enhanceResponse = useAction(api.private.messages.enhanceResponse);

   const handleEnhanceResponse = async () => {
      setIsEnhancing(true);

      const currentMessage = form.getValues("message");

      try {
         const response = await enhanceResponse({
            prompt: currentMessage,
         });

         form.setValue("message", response);
      } catch (error) {
         toast.error("Something went wrong");
         console.error(error);
      } finally {
         setIsEnhancing(false);
      }
   };

   if (conversation === undefined || messages.status === "LoadingFirstPage") {
      return <ConversationIdViewLoading />;
   }

   return (
      <div className="flex h-full flex-col bg-muted">
         <header className="flex items-center justify-between border-b bg-background p-2.5">
            <Button size="sm" variant="ghost">
               <MoreHorizontal />
            </Button>
            {!!conversation && (
               <ConversationStatusButton
                  status={conversation?.status}
                  onClick={handleToggleStatus}
                  disabled={isUpdatingStatus}
               />
            )}
         </header>
         <AIConversation className="max-h-[calc(100vh-180px)]">
            <AIConversationContent>
               <InfiniteScrollTrigger
                  ref={topElementRef}
                  isLoadingMore={isLoadingMore}
                  canLoadMore={canLoadMore}
                  onLoadMore={handleLoadMore}
               />
               {toUIMessages(messages.results ?? [])?.map((msg) => (
                  <AIMessage
                     // reverse since we are watching from "assistant" perspective
                     from={msg.role === "user" ? "assistant" : "user"}
                     key={msg.id}
                  >
                     <AIMessageContent>
                        <AIResponse>{msg.content}</AIResponse>
                     </AIMessageContent>
                     {msg.role === "user" && (
                        <DicebearAvatar
                           seed={conversation?.contactSessionId ?? "user"}
                           size={32}
                        />
                     )}
                  </AIMessage>
               ))}
            </AIConversationContent>
            <AIConversationScrollButton />
         </AIConversation>

         <div className="p-2">
            <Form {...form}>
               <AIInput onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                     control={form.control}
                     disabled={conversation?.status === "resolved"}
                     name="message"
                     render={({ field }) => (
                        <AIInputTextarea
                           disabled={
                              conversation?.status === "resolved" ||
                              isEnhancing ||
                              form.formState.isSubmitting
                           }
                           onChange={field.onChange}
                           onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                 e.preventDefault();
                                 form.handleSubmit(onSubmit)();
                              }
                           }}
                           placeholder={
                              conversation?.status === "resolved"
                                 ? "This conversation has been resolved"
                                 : "Type your response as an operator..."
                           }
                           value={field.value}
                        />
                     )}
                  />
                  <AIInputToolbar>
                     <AIInputTools>
                        <AIInputButton
                           onClick={handleEnhanceResponse}
                           disabled={
                              conversation?.status === "resolved" ||
                              isEnhancing ||
                              !form.formState.isValid
                           }
                        >
                           <Wand2Icon />
                           {isEnhancing ? "Enhancing..." : "Enhance"}
                        </AIInputButton>
                     </AIInputTools>
                     <AIInputSubmit
                        disabled={
                           conversation?.status === "resolved" ||
                           !form.formState.isValid ||
                           form.formState.isSubmitting ||
                           isEnhancing
                        }
                        status="ready"
                        type="submit"
                     />
                  </AIInputToolbar>
               </AIInput>
            </Form>
         </div>
      </div>
   );
};

export const ConversationIdViewLoading = () => {
   return (
      <div className="flex h-full flex-col bg-muted">
         <header className="flex items-center justify-between border-b bg-background p-2.5">
            <Button size="sm" variant="ghost">
               <MoreHorizontal />
            </Button>
         </header>
         <AIConversation className="max-h-[calc(100vh-180px)]">
            <AIConversationContent>
               {Array.from({ length: 8 }).map((_, idx) => {
                  const isUser = idx % 2 === 0;
                  const widths = ["w-48", "w-64", "w-72", "w-56"];
                  const width = widths[idx % widths.length];

                  return (
                     <div
                        className={cn(
                           "group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-[80%]",
                           isUser ? "is-user" : "is-assistant flex-row-reverse"
                        )}
                        key={idx}
                     >
                        <Skeleton
                           className={`h-9 ${width} rounded-lg bg-neutral-200`}
                        />
                        <Skeleton className="size-8 rounded-full bg-neutral-200" />
                     </div>
                  );
               })}
            </AIConversationContent>
         </AIConversation>
         <div>
            <AIInput>
               <AIInputTextarea
                  disabled
                  placeholder="Type your response as an operator"
               />
               <AIInputToolbar>
                  <AIInputTools />
                  <AIInputSubmit disabled status="ready" />
               </AIInputToolbar>
            </AIInput>
         </div>
      </div>
   );
};
