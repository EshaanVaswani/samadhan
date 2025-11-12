import { UseFormReturn } from "react-hook-form";

import {
   useVapiAssistants,
   useVapiPhoneNumbers,
} from "@/modules/plugins/hooks/use-vapi-data";
import {
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@workspace/ui/components/form";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@workspace/ui/components/select";
import type { FormSchema } from "@/modules/customization/ui/components/customization-form";

interface VapiFormFieldsProps {
   form: UseFormReturn<FormSchema>;
}

export const VapiFormFields = ({ form }: VapiFormFieldsProps) => {
   const { data: assistants, isLoading: assistantsLoading } =
      useVapiAssistants();
   const { data: phoneNumbers, isLoading: phoneNumbersLoading } =
      useVapiPhoneNumbers();

   const disabled = form.formState.isSubmitting;

   return (
      <>
         <FormField
            control={form.control}
            name="vapiSettings.assistantId"
            render={({ field }) => (
               <FormItem>
                  <FormLabel>Voice Assistant</FormLabel>
                  <Select
                     disabled={disabled || assistantsLoading}
                     value={field.value}
                     onValueChange={field.onChange}
                  >
                     <FormControl>
                        <SelectTrigger>
                           <SelectValue
                              placeholder={
                                 assistantsLoading
                                    ? "Loading assistants..."
                                    : "Select an assistant"
                              }
                           />
                        </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {assistants.map((a) => (
                           <SelectItem key={a.id} value={a.id}>
                              {a.name || "Unnamed Assistant"} -{" "}
                              {a.model?.model || "Unknown Model"}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
                  <FormDescription>
                     The vapi assistant to use for voice calls
                  </FormDescription>
                  <FormMessage />
               </FormItem>
            )}
         />
         <FormField
            control={form.control}
            name="vapiSettings.phoneNumber"
            render={({ field }) => (
               <FormItem>
                  <FormLabel>Display Phone Number</FormLabel>
                  <Select
                     disabled={disabled || phoneNumbersLoading}
                     value={field.value}
                     onValueChange={field.onChange}
                  >
                     <FormControl>
                        <SelectTrigger>
                           <SelectValue
                              placeholder={
                                 phoneNumbersLoading
                                    ? "Loading phone numbers..."
                                    : "Select a phone number"
                              }
                           />
                        </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {phoneNumbers.map((p) => (
                           <SelectItem key={p.id} value={p.number || p.id}>
                              {p.number || "Unknown"} - {p.name || "Unnamed"}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
                  <FormDescription>
                     Phone number to display in the widget
                  </FormDescription>
                  <FormMessage />
               </FormItem>
            )}
         />
      </>
   );
};
