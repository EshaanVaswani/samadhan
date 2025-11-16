"use client";

import { PricingTable } from "@/modules/billing/ui/components/pricing-table";

export const BillingView = () => {
   return (
      <div className="flex max-h-screen flex-col bg-muted p-8">
         <div className="mx-auto w-full max-w-screen-md">
            <div className="space-y-2">
               <h1 className="text-2xl md:text-4xl">Plans and Billing</h1>
               <p className="text-muted-foreground">
                  Choose the plan that&apos;s right for you
               </p>
            </div>

            <div className="mt-8">
               <PricingTable />
            </div>
         </div>
      </div>
   );
};
