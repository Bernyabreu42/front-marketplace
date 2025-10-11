import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ProductListItem } from "@/features/seller/types";
import SearchProducts from "@/components/SearchProducts";
import { toast } from "sonner";

export default function RelatedProductsSection({
  related,
  setRelated,
  excludeProductId,
}: {
  related: ProductListItem[];
  setRelated: React.Dispatch<React.SetStateAction<ProductListItem[]>>;
  excludeProductId?: string;
}) {
  const excludedIds = [
    ...(excludeProductId ? [excludeProductId] : []),
    ...related.map((item) => item.id),
  ];

  const onSelect = (item: ProductListItem) => {
    if (!item?.id) return;
    if (excludeProductId && item.id === excludeProductId) {
      toast.info("No puedes relacionar el producto consigo mismo");
      return;
    }

    setRelated((prev) => {
      if (prev.some((p) => p.id === item.id)) {
        toast.info("Este producto ya esta agregado");
        return prev;
      }
      return [...prev, item];
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Products</CardTitle>
        <CardDescription>
          Link related products to increase sales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SearchProducts onSelect={onSelect} excludeIds={excludedIds} />
        {related.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {related.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md"
              >
                <span className="text-sm">{item.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setRelated((prev) => prev.filter((x) => x.id !== item.id))
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
