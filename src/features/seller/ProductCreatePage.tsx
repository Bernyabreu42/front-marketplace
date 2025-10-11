import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, UploadCloud, X } from "lucide-react";
import type Quill from "quill";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import Editor from "@/components/text-rich";
import RelatedProductsSection from "@/components/related-products-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useImageUrlResolver } from "@/hooks/use-image-url";
import { fetchUserById } from "@/features/users/api";
import { getApiErrorMessage } from "@/lib/utils";
import { CategoryMultiSelect } from "./components/CategoryMultiSelect";
import { useCategories, useStoreDiscounts, useStorePromotions, useStoreTaxes } from "./hooks";
import {
  createProduct,
  uploadImage,
  createRelatedProducts,
} from "./api";
import type {
  CreateProductPayload,
  ProductListItem,
} from "./types";

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

type ProductFormState = {
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

export function SellerProductCreatePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editorRef = useRef<Quill | null>(null);
  const getImageUrl = useImageUrlResolver();

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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [related, setRelated] = useState<ProductListItem[]>([]);
  const [isUploading, setUploading] = useState(false);

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  const storeId = userProfileQuery.data?.data.store?.id ?? "";

  const categoriesQuery = useCategories({ limit: 500 });
  const availableCategories = categoriesQuery.data?.data ?? [];

  const promotionsQuery = useStorePromotions(storeId, { limit: 100 });
  const discountsQuery = useStoreDiscounts(storeId, { limit: 100 });
  const taxesQuery = useStoreTaxes(storeId, { limit: 100 });

  const availablePromotions = promotionsQuery.data?.data ?? [];
  const availableDiscounts = discountsQuery.data?.data ?? [];
  const availableTaxes = taxesQuery.data?.data ?? [];

  const categoryLookup = useMemo(() => {
    const map = new Map<string, string>();
    availableCategories.forEach((category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, [availableCategories]);

  const selectedCategoryOptions = useMemo(
    () =>
      form.categories.map((categoryId) => ({
        id: categoryId,
        name: categoryLookup.get(categoryId) ?? "Categoria",
      })),
    [categoryLookup, form.categories]
  );

  const validationError = useMemo(() => {
    if (!storeId) return "Necesitas una tienda activa para crear productos.";
    if (!form.name.trim()) return "El nombre del producto es obligatorio.";
    if (!form.price || Number(form.price) <= 0)
      return "Ingresa un precio base valido.";
    if (!form.stock || Number(form.stock) < 0)
      return "El inventario no puede ser negativo.";
    if (form.categories.length === 0)
      return "Selecciona al menos una categoria.";
    if (imageUrls.length === 0) return "Sube al menos una imagen.";

    const description = editorRef.current?.root.innerHTML ?? "";
    if (!description.trim() || description === "<p><br></p>") {
      return "La descripcion es obligatoria.";
    }

    return null;
  }, [form, imageUrls, storeId]);

  const selectedDiscount = useMemo(() => {
    if (!form.discountId) return undefined;
    return availableDiscounts.find((discount) => discount.id === form.discountId);
  }, [availableDiscounts, form.discountId]);

  const computedFinalPrice = useMemo(() => {
    if (!form.price) return 0;
    const parsed = Number(form.price);
    if (Number.isNaN(parsed)) return 0;

    if (!selectedDiscount) return parsed;

    const discountValue =
      selectedDiscount.type === "percentage"
        ? (parsed * selectedDiscount.value) / 100
        : selectedDiscount.value;

    return Math.max(parsed - discountValue, 0);
  }, [form.discountId, form.price, selectedDiscount]);

  const mutation = useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const response = await createProduct(payload);

      if (!response.success || !response.data) {
        throw new Error(
          response.message ?? "No se pudo crear el producto"
        );
      }

      if (related.length > 0) {
        const relatedResponse = await createRelatedProducts(
          response.data.id,
          related.map((p) => p.id)
        );

        if (!relatedResponse.success) {
          throw new Error(
            relatedResponse.message ??
              "El producto se creo pero fallo la asociacion de relacionados"
          );
        }
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Producto creado correctamente");
      queryClient.invalidateQueries({ queryKey: ["seller", "products"] });
      queryClient.invalidateQueries({ queryKey: ["seller", "store"] });
      navigate("/dashboard/seller/products", { replace: true });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleCategoryAdd = useCallback((categoryId: string) => {
    setForm((prev) => {
      if (prev.categories.includes(categoryId)) return prev;
      return {
        ...prev,
        categories: [...prev.categories, categoryId],
      };
    });
  }, []);

  const handleCategoryRemove = useCallback((categoryId: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((id) => id !== categoryId),
    }));
  }, []);

  const handlePromotionToggle = useCallback((promotionId: string) => {
    setForm((prev) => {
      const exists = prev.promotionIds.includes(promotionId);
      const promotionIds = exists
        ? prev.promotionIds.filter((id) => id !== promotionId)
        : [...prev.promotionIds, promotionId];
      return { ...prev, promotionIds };
    });
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
      toast.error(`Solo puedes subir ${MAX_PRODUCT_IMAGES} imagenes por producto`);
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
      toast.error(getApiErrorMessage(error));
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

    const payload: CreateProductPayload = {
      name: form.name.trim(),
      description,
      price: Number(form.price) || 0,
      priceFinal: Number.isFinite(computedFinalPrice)
        ? computedFinalPrice
        : Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      storeId,
      categories: form.categories,
      taxes: form.taxes,
      promotionIds: form.promotionIds,
      discountId: form.discountId ?? null,
      images: imageUrls,
      sku: form.sku.trim() || undefined,
      status: form.status,
      metaTitle: form.metaTitle.trim() || undefined,
      metaDescription: form.metaDescription.trim() || undefined,
      related: related.map((p) => p.id),
    };

    mutation.mutate(payload);
  };

  const isLoadingStore = userProfileQuery.isLoading;

  if (isLoadingStore) {
    return <p>Cargando informacion de la tienda...</p>;
  }

  if (!storeId) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              No encontramos tu tienda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Necesitas registrar una tienda antes de poder crear productos.
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link to="/dashboard/seller/store">Configurar mi tienda</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Crear producto
          </h1>
          <p className="text-sm text-muted-foreground">
            Completa los detalles para publicar un nuevo producto en tu tienda.
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
                Informacion basica
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Detalles principales que veran tus clientes en la tienda.
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
                      setForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Ej. iPhone 15 Pro Max"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-sku">SKU</Label>
                  <Input
                    id="product-sku"
                    value={form.sku}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        sku: event.target.value,
                      }))
                    }
                    placeholder="Identificador interno"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Descripcion *</Label>
                <div className="rounded-md border">
                  <Editor ref={editorRef} placeholder="Describe tu producto..." />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Inventario y precios
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Define el precio base y la cantidad disponible.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-price">Precio base *</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      price: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-stock">Inventario *</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      stock: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-foreground">
                  Precio final estimado
                </p>
                <p className="text-2xl font-semibold text-primary">
                  {formatCurrency(
                    Number.isFinite(computedFinalPrice)
                      ? computedFinalPrice
                      : 0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  El precio final se calcula automaticamente considerando impuestos, promociones y descuentos activos.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Informacion SEO
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Optimiza como se muestra el producto en buscadores.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-meta-title">Meta titulo</Label>
                <Input
                  id="product-meta-title"
                  value={form.metaTitle}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      metaTitle: event.target.value,
                    }))
                  }
                  placeholder="Escribe un titulo atractivo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-meta-description">
                  Meta descripcion
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

          <RelatedProductsSection related={related} setRelated={setRelated} />

          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Organizacion
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Clasifica el producto para que sea facil de encontrar.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Categorias *</Label>
                <CategoryMultiSelect
                  available={availableCategories}
                  selected={selectedCategoryOptions}
                  onAdd={handleCategoryAdd}
                  onRemove={handleCategoryRemove}
                  disabled={categoriesQuery.isLoading}
                  loading={categoriesQuery.isLoading}
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
                <Label>Promociones</Label>
                {availablePromotions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Aun no registras promociones en tu tienda.
                  </p>
                ) : (
                  <div className="space-y-2 rounded-md border border-dashed border-border/60 bg-muted/30 p-3">
                    {availablePromotions.map((promotion) => (
                      <label
                        key={promotion.id}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <span className="flex-1">
                          <span className="font-medium text-foreground">
                            {promotion.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {promotion.type === "coupon" && promotion.code
                              ? `Codigo ${promotion.code}`
                              : promotion.value !== null && promotion.value !== undefined
                                ? promotion.type === "automatic"
                                  ? `Valor ${promotion.value}%`
                                  : `Valor ${promotion.value}`
                                : "Sin valor definido"}
                          </span>
                        </span>
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4"
                          checked={form.promotionIds.includes(promotion.id)}
                          onChange={() => handlePromotionToggle(promotion.id)}
                        />
                      </label>
                    ))}
                  </div>
                )}
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
                      {discount.name}
                    </option>
                  ))}
                </select>
                {form.discountId && (
                  <p className="text-xs text-muted-foreground">
                    Se aplicara el descuento seleccionado al precio final.
                  </p>
                )}
                {!form.discountId && availableDiscounts.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aun no registras descuentos para tu tienda.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Impuestos aplicados</Label>
                {availableTaxes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Aun no registras impuestos en tu tienda.
                  </p>
                ) : (
                  <div className="space-y-2 rounded-md border border-dashed border-border/60 bg-muted/30 p-3">
                    {availableTaxes.map((tax) => (
                      <label
                        key={tax.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="flex flex-col">
                          <span className="font-medium text-foreground">{tax.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {tax.type === "percentage" ? `${tax.rate}%` : `RD$ ${tax.rate}`}
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Imagenes del producto
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Carga hasta {MAX_PRODUCT_IMAGES} imagenes en formato JPG o PNG.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Vista previa</span>
                <span>
                  {imageUrls.length}/{MAX_PRODUCT_IMAGES} seleccionadas
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {imageUrls.map((url) => (
                  <div
                    key={url}
                    className="relative overflow-hidden rounded-md border"
                  >
                    <img
                      src={getImageUrl(url)}
                      alt="Imagen del producto"
                      className="h-44 w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 rounded-full"
                      onClick={() => handleRemoveImage(url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {imageUrls.length < MAX_PRODUCT_IMAGES && (
                  <label
                    htmlFor="image-upload"
                    className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-center text-sm text-muted-foreground transition hover:border-primary"
                  >
                    <UploadCloud className="h-6 w-6" />
                    <span className="mt-2">Subir imagen</span>
                    <span className="text-[11px] text-muted-foreground">
                      PNG, JPG o WebP
                    </span>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                )}

                {imageUrls.length === 0 && (
                  <div className="flex h-44 flex-col items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                    <span className="mt-2">Aun no has subido imagenes</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
          <Link to="/dashboard/seller/products">Cancelar</Link>
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? "Creando..." : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}












