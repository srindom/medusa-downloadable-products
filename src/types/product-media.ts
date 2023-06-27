import { ProductMediaVariantType } from "../models/product-media-variant";

export type ProductMediaVariantDTO = {
  id: string;
  variant_id: string;
  product_media_id: string;
  type: string;
  created_at: Date;
  updated_at: Date;
};

export type ProductMediaDTO = {
  id: string;
  name?: string;
  file?: string;
  mime_type?: string;
  created_at?: Date;
  updated_at?: Date;
};

export type FilterableProductMediaFields = {
  name?: string;
  file?: string;
  mime_type?: string;
  variant_id?: string | string[];
  attachment_type?: ProductMediaVariantType | ProductMediaVariantType[];
  q?: string;
};

export type CreateProductMediaInput = {
  name: string;
  file: string;
  mime_type: string;
};

export type UpdateProductMediaInput = {
  name?: string;
  file?: string;
  mime_type?: string;
};

export interface AdminPostProductMediaReq {
  name?: string;
  file?: string;
  mime_type?: string;
}

export interface AdminPostProductMediaMediaReq {
  name?: string;
  file?: string;
  mime_type?: string;
}

export interface AdminPostProductMediaMediaVariantReq {
  variant_id: string;
  type: ProductMediaVariantType;
}

export type ResponseProductMedia = ProductMediaDTO & {
  variants?: ProductMediaVariantDTO[];
};

export type ListProductMediaRes = {
  product_medias: ResponseProductMedia[];
};

export type ProductMediaRes = {
  product_media: ResponseProductMedia;
};
