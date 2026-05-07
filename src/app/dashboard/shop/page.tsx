import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, FileText, CreditCard } from "lucide-react";

export default function ShopPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Shop & Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your products, invoices, and payments.
        </p>
      </div>

      <div className="grid gap-4">
        <FeaturePreview
          icon={ShoppingBag}
          title="Product Catalog"
          description="Set up coaching packages, meal plans, and training programs for sale."
        />
        <FeaturePreview
          icon={FileText}
          title="Invoicing"
          description="Generate and send PDF invoices to clients automatically."
        />
        <FeaturePreview
          icon={CreditCard}
          title="Payments"
          description="Accept payments via Stripe — subscriptions and one-time purchases."
        />
      </div>
    </div>
  );
}

function FeaturePreview({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShoppingBag;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
