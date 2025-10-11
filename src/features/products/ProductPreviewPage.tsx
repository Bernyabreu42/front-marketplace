import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  Shield,
  Star,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImageUrlResolver } from "@/hooks/use-image-url";
import {
  fetchProduct,
  fetchStoreDetails,
  fetchRelatedProducts,
} from "@/features/seller/api";
import type { ProductListItem, StoreDetail } from "@/features/seller/types";

const currencyFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);
const PLACEHOLDER_IMAGE = "/placeholder.svg";

export function ProductPreviewPage() {
  const { productId } = useParams<{ productId: string }>();
  const getImageUrl = useImageUrlResolver();
  const location = useLocation();
  const isAdminPreview = location.pathname.includes("/dashboard/admin");
  const backToListPath = isAdminPreview
    ? "/dashboard/admin/products"
    : "/dashboard/seller/products";

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const productQuery = useQuery({
    queryKey: ["product", productId, "preview"],
    queryFn: () => fetchProduct(productId!),
    enabled: Boolean(productId),
  });

  const product: ProductListItem | undefined = productQuery.data?.data;

  const storeQuery = useQuery({
    queryKey: ["product", product?.storeId, "store"],
    queryFn: () => fetchStoreDetails(product!.storeId),
    enabled: Boolean(product?.storeId),
  });

  const store: StoreDetail | undefined = storeQuery.data?.data;

  const relatedQuery = useQuery({
    queryKey: ["product", productId, "related"],
    queryFn: () => fetchRelatedProducts(productId!),
    enabled: Boolean(productId),
  });

  const relatedProducts: ProductListItem[] = relatedQuery.data?.data ?? [];

  const images = product?.images ?? [];

  const productImages = useMemo(
    () => images.map((image) => getImageUrl(image)).filter(Boolean),
    [images, getImageUrl]
  );

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [productImages.length]);

  const hasImages = productImages.length > 0;
  const currentImage = hasImages
    ? productImages[currentImageIndex]
    : PLACEHOLDER_IMAGE;

  const goToPreviousImage = () => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  if (productQuery.isLoading) {
    return <p>Cargando producto...</p>;
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Producto no encontrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Verifica que el producto exista o vuelve al listado para
              seleccionar otro.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link to={backToListPath}>Volver al listado</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoriesLabel = product.categories
    .map((category) => category.name)
    .join(" • ");
  const locationLabel = [store?.address, categoriesLabel]
    .filter(Boolean)
    .join(" • ");
  const productPrice = formatCurrency(product.priceFinal ?? product.price ?? 0);

  const storeLogo = store?.logo ? getImageUrl(store.logo) : undefined;
  const storeInitials = (store?.name ?? "TI").slice(0, 2).toUpperCase();
  const storeReviewCount = store?._count?.reviews ?? 0;
  const storeProductCount = store?._count?.products ?? 0;
  const membershipDate = store?.createdAt
    ? new Date(store.createdAt).toLocaleDateString("es-DO", {
        month: "short",
        year: "numeric",
      })
    : null;

  const sanitizedDescription = product.description ?? "";
  const relatedPreviewBase = backToListPath;

  const statusVariant = product.status === "active" ? "secondary" : "outline";
  const statusLabel = product.status.replace(/_/g, " ").toUpperCase();

  return (
    <div className=" mx-auto space-y-8">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="inline-flex w-fit items-center gap-2"
      >
        <Link to={backToListPath}>
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={currentImage}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {hasImages && productImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 "
                  onClick={goToPreviousImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 "
                  onClick={goToNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {productImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setCurrentImageIndex(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                  index === currentImageIndex
                    ? "border-primary"
                    : "border-transparent"
                }`}
              >
                <img
                  src={image}
                  alt={`Vista ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
            {!hasImages && (
              <div className="col-span-4 text-sm text-muted-foreground">
                Este producto aún no tiene imágenes cargadas.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-4xl font-bold text-primary">
                {productPrice}
              </span>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{locationLabel || "Ubicación pendiente"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button className="flex-1" disabled>
              <MessageCircle className="h-4 w-4 mr-2" />
              Contactar al vendedor
            </Button>
            <Button variant="outline" disabled>
              <Heart className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            <Button variant="outline" size="icon" disabled>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {storeLogo ? (
                    <AvatarImage
                      src={storeLogo}
                      alt={store?.name ?? "Tienda"}
                    />
                  ) : (
                    <AvatarFallback>{storeInitials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {store?.name ?? "Tienda sin nombre"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>
                        {storeReviewCount > 0
                          ? `${storeReviewCount} reseñas`
                          : "Sin reseñas"}
                      </span>
                    </div>
                    <span>•</span>
                    <span>
                      {membershipDate
                        ? `Miembro desde ${membershipDate}`
                        : "Fecha de registro no disponible"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {store?.email ?? "Email no registrado"}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {storeProductCount > 0
                    ? `${storeProductCount} productos publicados`
                    : "Sin productos publicados"}
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                {store?.description ??
                  "El vendedor aún no ha completado la descripción de su tienda."}
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full" disabled>
                  Ver más artículos del vendedor →
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6 flex items-start gap-3 text-sm text-amber-800">
              <Shield className="h-5 w-5 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-900">
                  Consejos de seguridad
                </h4>
                <ul className="space-y-1">
                  <li>• Reúnete en un lugar público y seguro.</li>
                  <li>• Inspecciona el artículo antes de pagar.</li>
                  <li>• No envíes dinero por adelantado.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Descripción del producto
          </h2>
          {sanitizedDescription ? (
            <div
              className="prose max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Este producto aún no tiene una descripción detallada.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">
          Productos similares
        </h2>
        {relatedProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no has asociado productos relacionados.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((item) => {
              const image = item.images?.[0]
                ? getImageUrl(item.images[0])
                : PLACEHOLDER_IMAGE;
              const price = formatCurrency(item.priceFinal ?? item.price ?? 0);

              return (
                <Card
                  key={item.id}
                  className="group hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-0">
                    <Link to={`${relatedPreviewBase}/${item.id}/preview`}>
                      <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
                        <img
                          loading="lazy"
                          src={image}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-foreground">
                          {item.name}
                        </h3>
                        <p className="text-xl font-bold text-primary">
                          {price}
                        </p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
