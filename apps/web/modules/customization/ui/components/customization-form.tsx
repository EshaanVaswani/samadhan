import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@workspace/ui/components/card";
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import { VapiFormFields } from "@/modules/customization/ui/components/vapi-form-fields";

export const widgetSettingsSchema = z.object({
   greetMessage: z.string().min(1, "Greet message is required"),
   defaultSuggestions: z.object({
      suggestion1: z.string().optional(),
      suggestion2: z.string().optional(),
      suggestion3: z.string().optional(),
   }),
   vapiSettings: z.object({
      assistantId: z.string().optional(),
      phoneNumber: z.string().optional(),
   }),
});

type WidgetSettings = Doc<"widgetSettings">;
export type FormSchema = z.infer<typeof widgetSettingsSchema>;

interface CustomizationFormProps {
   initialData?: WidgetSettings | null;
   hasVapiPlugin: boolean;
}

export const CustomizationForm = ({
   initialData,
   hasVapiPlugin,
}: CustomizationFormProps) => {
   const upsertWidgetSettings = useMutation(api.private.widgetSettings.upsert);

   const form = useForm<z.infer<typeof widgetSettingsSchema>>({
      resolver: zodResolver(widgetSettingsSchema),
      defaultValues: {
         greetMessage:
            initialData?.greetMessage || "Hi! How can I help you today?",
         defaultSuggestions: {
            suggestion1: initialData?.defaultSuggestions.suggestion1 || "",
            suggestion2: initialData?.defaultSuggestions.suggestion2 || "",
            suggestion3: initialData?.defaultSuggestions.suggestion3 || "",
         },
         vapiSettings: {
            assistantId: initialData?.vapiSettings.assistantId || "",
            phoneNumber: initialData?.vapiSettings.phoneNumber || "",
         },
      },
   });

   const onSubmit = async (values: z.infer<typeof widgetSettingsSchema>) => {
      try {
         const vapiSettings: WidgetSettings["vapiSettings"] = {
            assistantId:
               values.vapiSettings.assistantId === "none"
                  ? ""
                  : values.vapiSettings.assistantId,
            phoneNumber:
               values.vapiSettings.phoneNumber === "none"
                  ? ""
                  : values.vapiSettings.phoneNumber,
         };

         await upsertWidgetSettings({
            greetMessage: values.greetMessage,
            defaultSuggestions: values.defaultSuggestions,
            vapiSettings,
         });

         toast.success("Widget settings saved");
      } catch (error) {
         console.error(error);
         toast.error("Something went wrong");
      }
   };

   return (
      <Form {...form}>
         <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
               <CardHeader>
                  <CardTitle>General Chat Settings</CardTitle>
                  <CardDescription>
                     Configure basic chat behavior and messages
                  </CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                  <FormField
                     control={form.control}
                     name="greetMessage"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Greet Message</FormLabel>
                           <FormControl>
                              <Textarea
                                 placeholder="Welcome message show when chat opens"
                                 rows={3}
                                 {...field}
                              />
                           </FormControl>
                           <FormDescription>
                              The first message customers see when they open the
                              chat
                           </FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <Separator />

                  <div className="space-y-4">
                     <div>
                        <h3 className="mb-4 text-sm">Default Suggestions</h3>
                        <p className="mb-4 text-muted-foreground text-sm">
                           Quick reply suggestions show to customers to help
                           guide the conversation
                        </p>

                        <div className="space-y-4">
                           <FormField
                              control={form.control}
                              name="defaultSuggestions.suggestion1"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Suggestion 1</FormLabel>
                                    <FormControl>
                                       <Input
                                          placeholder="e.g., How do I get started?"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                           <FormField
                              control={form.control}
                              name="defaultSuggestions.suggestion2"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Suggestion 2</FormLabel>
                                    <FormControl>
                                       <Input
                                          placeholder="e.g., What are your pricing plans?"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                           <FormField
                              control={form.control}
                              name="defaultSuggestions.suggestion3"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Suggestion 3</FormLabel>
                                    <FormControl>
                                       <Input
                                          placeholder="e.g., I need help with my account"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {hasVapiPlugin && (
               <Card>
                  <CardHeader>
                     <CardTitle>Voice Assistant Settings</CardTitle>
                     <CardDescription>
                        Configure voice calling features powered by VAPI
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <VapiFormFields form={form} />
                  </CardContent>
               </Card>
            )}

            <div className="flex justify-end">
               <Button disabled={form.formState.isSubmitting} type="submit">
                  Save Settings
               </Button>
            </div>
         </form>
      </Form>
   );
};
