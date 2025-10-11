import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { BadgeCheck, Camera, Clock3, Store, Upload } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchUserById } from "@/features/users/api";

import { updateStoreImages, uploadImage } from "./api";
import { useSellerStore } from "./hooks";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export default function StoreHeader() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  const storeId = userProfileQuery.data?.data.store?.id;
  const { data: storeData } = useSellerStore(storeId);
  const store = storeData?.data;

  useEffect(() => {
    if (store) {
      setBannerPreview(store.banner ?? "");
      setLogoPreview(store.logo ?? "");
    }
  }, [store]);

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    type: "banner" | "logo"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!storeId) {
      toast.error("No se encontró la tienda asociada");
      event.target.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato no soportado (JPG, PNG o WebP)");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo no puede superar 5MB");
      event.target.value = "";
      return;
    }

    const previousBanner = bannerPreview;
    const previousLogo = logoPreview;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (type === "banner") setBannerPreview(result);
      if (type === "logo") setLogoPreview(result);
    };
    reader.readAsDataURL(file);

    const folder = type === "banner" ? "banners" : "avatars";

    try {
      setUploading(true);

      const uploadResult = await uploadImage(file, folder);
      if (!uploadResult?.success || !uploadResult.data) {
        throw new Error(uploadResult?.message ?? "No se pudo subir la imagen");
      }

      const payload =
        type === "banner"
          ? { banner: uploadResult.data }
          : { logo: uploadResult.data };

      const updateResult = await updateStoreImages(payload);
      if (!updateResult?.success) {
        throw new Error(
          updateResult?.message ?? "No se pudo actualizar la tienda"
        );
      }

      if (type === "banner") {
        setBannerPreview(uploadResult.data);
      } else {
        setLogoPreview(uploadResult.data);
      }

      toast.success(
        updateResult.message ??
          `Imagen de ${type === "banner" ? "banner" : "logo"} actualizada`
      );

      const invalidatePromises = [
        queryClient.invalidateQueries({ queryKey: ["seller", "store", storeId] }),
      ];

      if (userId) {
        invalidatePromises.push(
          queryClient.invalidateQueries({ queryKey: ["user", userId] })
        );
      }

      await Promise.all(invalidatePromises);
    } catch (error) {
      if (type === "banner") {
        setBannerPreview(previousBanner);
      } else {
        setLogoPreview(previousLogo);
      }

      const message =
        error instanceof Error ? error.message : "Error al subir la imagen";
      toast.error(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("blob:") || path.startsWith("data:")) return path;
    if (ABSOLUTE_URL_REGEX.test(path)) return path;

    const base = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  };

  return (
    <div className="relative h-48 overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow">
      {/* Banner */}
      {bannerPreview && (
        <img
          src={getImageUrl(bannerPreview)}
          alt="Store banner"
          className="h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/60" />

      {/* Banner Upload */}
      <div className="absolute right-2 top-2 z-10">
        <label htmlFor="banner-upload" className="cursor-pointer">
          <Button variant="outline" size="icon" disabled={uploading} asChild>
            <Upload className="h-7 w-7 p-1" />
          </Button>
        </label>
        <Input
          id="banner-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageUpload(e, "banner")}
        />
      </div>

      {/* Logo + Upload */}
      <div className="absolute bottom-4 left-4 flex items-end gap-4">
        <div className="relative">
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white">
            {logoPreview ? (
              <img
                src={getImageUrl(logoPreview)}
                alt="Store logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Profile Upload */}
          <div className="absolute bottom-0 right-0">
            <label htmlFor="profile-upload" className="cursor-pointer">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border"
                asChild
                disabled={uploading}
              >
                <Camera className="h-7 w-7 p-1" />
              </Button>
            </label>
            <Input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "logo")}
            />
          </div>
        </div>

        <div className="relative text-white">
          <h2 className="text-2xl font-bold">{store?.name}</h2>
          {store?.tagline && <p className="text-white/90">{store?.tagline}</p>}
          <Badge
            className={clsx(
              "capitalize",
              store?.status === "pending" &&
                "border-red-500/30 bg-red-500/50 text-red-300",
              store?.status === "active" &&
                "border-blue-500/30 bg-blue-500/50 text-blue-300",
              store?.status === "inactive" &&
                "border-gray-500/30 bg-gray-500/50 text-gray-300",
              store?.status === "banned" &&
                "border-purple-500/30 bg-purple-500/50 text-purple-300",
              store?.status === "deleted" &&
                "border-red-500/30 bg-red-500/50 text-red-300"
            )}
          >
            {store?.status === "pending" ? (
              <>
                <Clock3 className="mr-1" /> Pendiente de aprobacion
              </>
            ) : (
              <>
                Tienda {store?.status}{" "}
                {store?.status === "active" && <BadgeCheck className="ml-1" />}
              </>
            )}
          </Badge>
        </div>
      </div>
    </div>
  );
}


