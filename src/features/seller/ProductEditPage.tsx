import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type Quill from "quill";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import Editor from "@/components/text-rich";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/utils";
import { updateProduct, uploadImage, createRelatedProducts } from "./api";

import type {
  DiscountItem,
  PromotionItem,
  TaxItem,
  UpdateProductPayload,
} from "./types";
import { useEditProduct } from "@/hooks/use-edit-product";
import RelatedProductsSection from "@/components/related-products-section";
import { CategoryMultiSelect } from "./components/CategoryMultiSelect";
import { useImageUrlResolver } from "@/hooks/use-image-url";
import UploadImages from "./upload-images";
import PriceInventory from "./price-inventory";

const MAX_PRODUCT_IMAGES = 5;
const PRODUCT_STATUS_OPTIONS = [
  "active",
  "inactive",
  "draft",
  "out_of_stock",
] as const;

const currencyFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

export type ProductFormState = {
  name: string;
  sku: string;
  price: string;
  stock: string;
  status: string;
  categories: string[];
  taxes: string[];
  promotionIds: string[];
  discountId: string | null;
  metaTitle: string;
  metaDescription: string;
};

export type PricePreviewStep = {
  id: string;
  label: string;
  change: number;
  total: number;
  kind: "base" | "promotion" | "discount" | "tax" | "total";
  detail?: string;
};

const formatPercentageValue = (value: number) => {
  if (!Number.isFinite(value)) return "-";
  return `${value.toLocaleString("es-DO", { maximumFractionDigits: 2 })}%`;
};

const getPromotionDetail = (promotion: PromotionItem) => {
  const segments: string[] = [];
  segments.push(promotion.type === "coupon" ? "Cupón" : "Promoción automática");
  if (promotion.code && promotion.type === "coupon") {
    segments.push(`Código ${promotion.code}`);
  }
  if (typeof promotion.value === "number") {
    segments.push(`Valor ${formatPercentageValue(promotion.value)}`);
  }
  return segments.join(" - ") || "Promoción sin detalles configurados";
};

const getDiscountDetail = (discount: DiscountItem) => {
  if (discount.type === "percentage") {
    return `Descuento de ${formatPercentageValue(
      discount.value
    )} sobre el subtotal`;
  }
  return `Descuento fijo de ${formatCurrency(
    discount.value
  )} aplicado al subtotal`;
};

const getTaxDetail = (tax: TaxItem) => {
  if (tax.type === "percentage") {
    return `Incrementa ${formatPercentageValue(tax.rate)} sobre el subtotal`;
  }
  return `Incremento fijo de ${formatCurrency(tax.rate)}`;
};

export function SellerProductEditPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editorRef = useRef<Quill | null>(null);

  const {
    isFetching,
    product,
    related,
    setRelated,
    availableCategories,
    availablePromotions,
    availableDiscounts,
    availableTaxes,
  } = useEditProduct(productId);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setUploading] = useState(false);
  const [form, setForm] = useState<ProductFormState>({
    name: "",
    sku: "",
    price: "",
    stock: "",
    status: "active",
    categories: [],
    taxes: [],
    promotionIds: [],
    discountId: null,
    metaTitle: "",
    metaDescription: "",
  });

  const getImageUrl = useImageUrlResolver();

  useEffect(() => {
    if (!product) return;

    setForm({
      name: product.name,
      sku: product.sku ?? "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      status: product.status ?? "active",
      categories: product.categories.map((category) => category.id),
      taxes:
        product.taxes
          ?.filter((tax) => tax.status === "active")
          .map((tax) => tax.id) ?? [],
      promotionIds:
        product.promotions
          ?.filter((promotion) => promotion.status === "active")
          .map((promotion) => promotion.id) ?? [],
      discountId: product.discountId ?? null,
      metaTitle: product.metaTitle ?? "",
      metaDescription: product.metaDescription ?? "",
    });

    setImageUrls(product.images ?? []);

    if (editorRef.current) {
      editorRef.current.clipboard.dangerouslyPasteHTML(product.description);
    }
  }, [product]);

  const categoryLookup = useMemo(() => {
    const map = new Map<string, string>();
    product?.categories.forEach((category) => {
      map.set(category.id, category.name);
    });
    availableCategories.forEach((category) => {
      if (!map.has(category.id)) {
        map.set(category.id, category.name);
      }
    });
    return map;
  }, [availableCategories, product?.categories]);

  const promotionLookup = useMemo(() => {
    const map = new Map<string, PromotionItem>();
    availablePromotions.forEach((promotion) => {
      map.set(promotion.id, promotion);
    });
    return map;
  }, [availablePromotions]);

  const selectedPromotions = useMemo(
    () =>
      form.promotionIds
        .map((promotionId) => promotionLookup.get(promotionId))
        .filter((promotion): promotion is PromotionItem => Boolean(promotion)),
    [form.promotionIds, promotionLookup]
  );

  const taxLookup = useMemo(() => {
    const map = new Map<string, TaxItem>();
    availableTaxes.forEach((tax) => {
      map.set(tax.id, tax);
    });
    return map;
  }, [availableTaxes]);

  const selectedTaxes = useMemo(
    () =>
      form.taxes
        .map((taxId) => taxLookup.get(taxId))
        .filter((tax): tax is TaxItem => Boolean(tax)),
    [form.taxes, taxLookup]
  );

  const selectedCategoryOptions = useMemo(
    () =>
      form.categories.map((categoryId) => ({
        id: categoryId,
        name: categoryLookup.get(categoryId) ?? "Categoría",
      })),
    [categoryLookup, form.categories]
  );

  const validationError = useMemo(() => {
    if (!form.name.trim()) return "El nombre del producto es obligatorio.";
    if (!form.price || Number(form.price) < 0)
      return "Ingresa un precio base válido.";
    if (!form.stock || Number(form.stock) < 0)
      return "El inventario no puede ser negativo.";
    if (form.categories.length === 0)
      return "Selecciona al menos una categoría.";
    if (imageUrls.length === 0) return "Sube al menos una imagen.";

    const description = editorRef.current?.root.innerHTML ?? "";
    if (!description.trim() || description === "<p><br></p>") {
      return "La descripción es obligatoria.";
    }

    return null;
  }, [form, imageUrls]);

  const mutation = useMutation({
    mutationFn: async (payload: UpdateProductPayload) => {
      const response = await updateProduct(productId!, payload);

      if (!response.success) {
        throw new Error(
          response.message ?? "No se pudo actualizar el producto"
        );
      }

      if (related.length > 0) {
        const relatedResponse = await createRelatedProducts(
          productId!,
          related.map((p) => p.id)
        );

        if (!relatedResponse.success) {
          throw new Error(
            relatedResponse.message ??
              "No se pudieron actualizar los productos relacionados"
          );
        }
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Producto actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["seller", "products"] });
      if (product?.storeId) {
        queryClient.invalidateQueries({ queryKey: ["seller", "store", product.storeId] });
      }
      navigate("/dashboard/seller/products", { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleCategoryAdd = useCallback((categoryId: string) => {
    setForm((prev) => {
      if (prev.categories.includes(categoryId)) return prev;
      return { ...prev, categories: [...prev.categories, categoryId] };
    });
  }, []);

  const handleCategoryRemove = useCallback((categoryId: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((id) => id !== categoryId),
    }));
  }, []);

  const handleTaxToggle = useCallback((taxId: string) => {
    setForm((prev) => {
      const exists = prev.taxes.includes(taxId);
      const taxes = exists
        ? prev.taxes.filter((id) => id !== taxId)
        : [...prev.taxes, taxId];
      return { ...prev, taxes };
    });
  }, []);

  const handleDiscountChange = useCallback((value: string) => {
    setForm((prev) => ({
      ...prev,
      discountId: value ? value : null,
    }));
  }, []);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imageUrls.length >= MAX_PRODUCT_IMAGES) {
      toast.error(
        `Solo puedes subir ${MAX_PRODUCT_IMAGES} imágenes por producto`
      );
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const response = await uploadImage(file, "products");
      if (!response?.success || !response.data) {
        throw new Error(response?.message ?? "No se pudo subir la imagen");
      }
      setImageUrls((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      toast.error("Ocurrió un error al subir la imagen");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = useCallback((url: string) => {
    setImageUrls((prev) => prev.filter((image) => image !== url));
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const description = editorRef.current?.root.innerHTML ?? "";

    const payload: UpdateProductPayload = {
      name: form.name.trim(),
      description,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      categories: form.categories,
      taxes: form.taxes,
      promotionIds: form.promotionIds,
      discountId: form.discountId ?? null,
      priceFinal: computedFinalPrice,
      images: imageUrls,
      sku: form.sku.trim() || undefined,
      status: form.status,
      metaTitle: form.metaTitle.trim() || undefined,
      metaDescription: form.metaDescription.trim() || undefined,
      related: related.map((p) => p.id),
    };

    mutation.mutate(payload);
  };

  const selectedDiscount = useMemo(() => {
    if (!form.discountId) return undefined;
    return availableDiscounts.find(
      (discount) => discount.id === form.discountId
    );
  }, [availableDiscounts, form.discountId]);

  const pricePreview = useMemo(() => {
    const steps: PricePreviewStep[] = [];
    const hasInputPrice = form.price.trim().length > 0;
    const inputPrice = Number(form.price);
    const baseCandidate =
      hasInputPrice && !Number.isNaN(inputPrice)
        ? inputPrice
        : product?.price ?? product?.priceFinal ?? 0;
    const sanitizedBase = Number.isFinite(baseCandidate)
      ? Math.max(baseCandidate, 0)
      : 0;

    let subtotal = sanitizedBase;

    steps.push({
      id: "base",
      label: "Precio base",
      change: 0,
      total: subtotal,
      kind: "base",
      detail: hasInputPrice
        ? "Precio ingresado en el formulario"
        : "Precio registrado actualmente",
    });

    // Aplicar promociones
    selectedPromotions.forEach((promotion) => {
      const before = subtotal;
      const percentage =
        typeof promotion.value === "number" ? promotion.value : 0;
      const changeAmount = percentage > 0 ? -((before * percentage) / 100) : 0;
      subtotal = Math.max(before + changeAmount, 0);
      steps.push({
        id: `promotion-${promotion.id}`,
        label: `Promoción: ${promotion.name}`,
        change: changeAmount,
        total: subtotal,
        kind: "promotion",
        detail: getPromotionDetail(promotion),
      });
    });

    // Aplicar descuentos
    if (selectedDiscount) {
      const before = subtotal;
      const changeAmount =
        selectedDiscount.type === "percentage"
          ? -((before * selectedDiscount.value) / 100)
          : -selectedDiscount.value;
      subtotal = Math.max(before + changeAmount, 0);
      steps.push({
        id: `discount-${selectedDiscount.id}`,
        label: `Descuento: ${selectedDiscount.name}`,
        change: changeAmount,
        total: subtotal,
        kind: "discount",
        detail: getDiscountDetail(selectedDiscount),
      });
    }

    // Aplicar impuestos sobre el subtotal acumulado
    let runningTotal = subtotal;

    selectedTaxes.forEach((tax) => {
      const before = runningTotal;
      const changeAmount =
        tax.type === "percentage"
          ? (before * tax.rate) / 100 // Se aplica sobre el subtotal actual
          : tax.rate;

      runningTotal += changeAmount;

      steps.push({
        id: `tax-${tax.id}`,
        label: `Impuesto: ${tax.name}`,
        change: changeAmount,
        total: runningTotal,
        kind: "tax",
        detail: getTaxDetail(tax),
      });
    });

    steps.push({
      id: "total",
      label: "Total estimado",
      change: 0,
      total: runningTotal,
      kind: "total",
    });

    return {
      steps,
      total: runningTotal,
    };
  }, [
    form.price,
    product?.price,
    product?.priceFinal,
    selectedPromotions,
    selectedDiscount,
    selectedTaxes,
  ]);

  const priceSteps = pricePreview.steps;
  const computedFinalPrice = Number.isFinite(pricePreview.total)
    ? pricePreview.total
    : 0;

  if (isFetching) {
    return <p>Cargando producto...</p>;
  }

  if (!product) {
    return (
      <div>
        <p>Producto no encontrado.</p>
        <Button type="button" variant="outline" asChild>
          <Link to="/dashboard/seller/products">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar producto
          </h1>
          <p className="text-sm text-muted-foreground">
            Actualiza la información esencial de tu catálogo.
          </p>
        </div>
        <Button type="button" variant="outline" asChild>
          <Link to="/dashboard/seller/products">Volver al listado</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Información básica
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Detalles esenciales que se muestran a tus clientes.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Nombre del producto *</Label>
                  <Input
                    id="product-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-sku">SKU (opcional)</Label>
                  <Input
                    id="product-sku"
                    value={form.sku}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, sku: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción *</Label>
                <div className="rounded-md border">
                  <Editor
                    ref={editorRef}
                    defaultValue={product?.description ?? ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <PriceInventory
            form={form}
            setForm={setForm}
            currencyFormatter={currencyFormatter}
            formatCurrency={formatCurrency}
            priceSteps={priceSteps}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Información SEO
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Optimiza cómo aparece tu producto en los buscadores.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-meta-title">Meta título</Label>
                <Input
                  id="product-meta-title"
                  value={form.metaTitle}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      metaTitle: event.target.value,
                    }))
                  }
                  placeholder="Escribe un título atractivo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-meta-description">
                  Meta descripción
                </Label>
                <Textarea
                  id="product-meta-description"
                  rows={3}
                  value={form.metaDescription}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      metaDescription: event.target.value,
                    }))
                  }
                  placeholder="Describe brevemente tu producto"
                />
              </div>
            </CardContent>
          </Card>

          <RelatedProductsSection
            related={related}
            setRelated={setRelated}
            excludeProductId={product.id}
          />

          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Organización
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Clasifica el producto para que sea fácil de encontrar.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Categorías *</Label>
                <CategoryMultiSelect
                  available={availableCategories}
                  selected={selectedCategoryOptions}
                  onAdd={handleCategoryAdd}
                  onRemove={handleCategoryRemove}
                  disabled={isFetching}
                  loading={isFetching}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-status">Estado</Label>
                <select
                  id="product-status"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                >
                  {PRODUCT_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-discount">Descuento</Label>
                <select
                  id="product-discount"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.discountId ?? ""}
                  onChange={(event) => handleDiscountChange(event.target.value)}
                  disabled={availableDiscounts.length === 0}
                >
                  <option value="">Sin descuento</option>
                  {availableDiscounts.map((discount) => (
                    <option key={discount.id} value={discount.id}>
                      {discount.name} -{" "}
                      {discount.type === "percentage"
                        ? formatPercentageValue(discount.value)
                        : formatCurrency(discount.value)}
                    </option>
                  ))}
                </select>
                {form.discountId && selectedDiscount && (
                  <p className="text-xs text-muted-foreground">
                    {getDiscountDetail(selectedDiscount)}.
                  </p>
                )}
                {form.discountId && !selectedDiscount && (
                  <p className="text-xs text-destructive">
                    El descuento seleccionado ya no está disponible.
                  </p>
                )}
                {!form.discountId && availableDiscounts.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aún no registras descuentos para tu tienda.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Impuestos aplicados</Label>
                {availableTaxes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Aún no registras impuestos en tu tienda.
                  </p>
                ) : (
                  <div className="space-y-2 rounded-md border border-dashed border-border/60 bg-muted/30 p-3">
                    {availableTaxes.map((tax) => (
                      <label
                        key={tax.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {tax.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {tax.type === "percentage"
                              ? `${tax.rate}%`
                              : `RD$ ${tax.rate}`}
                          </span>
                        </span>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={form.taxes.includes(tax.id)}
                          onChange={() => handleTaxToggle(tax.id)}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <UploadImages
            imageUrls={imageUrls}
            handleImageUpload={handleImageUpload}
            handleRemoveImage={handleRemoveImage}
            isUploading={isUploading}
            getImageUrl={getImageUrl}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          asChild
          className="w-full sm:w-auto"
        >
          <Link to="/dashboard/seller/products">Cancelar</Link>
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending || isFetching}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
