import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageIcon, UploadCloud, X } from "lucide-react";
import React from "react";

interface UploadImagesProps {
  imageUrls: string[];
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (url: string) => void;
  isUploading: boolean;
  getImageUrl: (url: string) => string;
}

const MAX_PRODUCT_IMAGES = 5;

export default function UploadImages({
  imageUrls,
  handleImageUpload,
  handleRemoveImage,
  isUploading,
  getImageUrl,
}: UploadImagesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Imágenes del producto
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Carga hasta {MAX_PRODUCT_IMAGES} imágenes en formato JPG o PNG.
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
              <span className="mt-2">Aún no has subido imágenes</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
