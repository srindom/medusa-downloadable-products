import { isDefined, MedusaError } from "medusa-core-utils";
import { buildQuery, FindConfig } from "@medusajs/medusa";
import { SharedContext } from "@medusajs/types";
import { ProductMedia } from "../models/product-media";
import {
  ProductMediaVariant,
  ProductMediaVariantType,
} from "../models/product-media-variant";
import { EntityManager, In } from "typeorm";
import {
  CreateProductMediaInput,
  FilterableProductMediaFields,
  ProductMediaDTO,
  ProductMediaVariantDTO,
  UpdateProductMediaInput,
} from "../types/product-media";

type InjectedDependencies = {
  manager: EntityManager;
};

class ProductMediaService {
  private manager: EntityManager;

  constructor(container: InjectedDependencies) {
    this.manager = container.manager;
  }

  private getManager(context: SharedContext = {}): EntityManager {
    return context.transactionManager || this.manager;
  }

  async retrieve(
    id: string,
    options: FindConfig<ProductMediaDTO> = {},
    context?: SharedContext
  ): Promise<ProductMediaDTO> {
    if (!isDefined(id)) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `"id" must be defined`
      );
    }

    const mediaRepo = this.getManager(context).getRepository(ProductMedia);

    const query = buildQuery({ id }, options);
    const productMedia = await mediaRepo.findOne(query);

    if (!productMedia) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Product media with id: ${id} was not found`
      );
    }

    return productMedia;
  }

  async list(
    selector: FilterableProductMediaFields,
    config: FindConfig<ProductMediaDTO>,
    context?: SharedContext
  ): Promise<ProductMediaDTO[]> {
    const manager = this.getManager(context);
    const mediaRepo = manager.getRepository(ProductMedia);
    const query = await this.prepareQuery(selector, config, manager);
    return await mediaRepo.find(query);
  }

  async listAndCount(
    selector: FilterableProductMediaFields,
    config: FindConfig<ProductMediaDTO>,
    context?: SharedContext
  ): Promise<[ProductMediaDTO[], number]> {
    const manager = this.getManager(context);
    const mediaRepo = manager.getRepository(ProductMedia);
    const query = await this.prepareQuery(selector, config, manager);
    return await mediaRepo.findAndCount(query);
  }

  async listVariants(
    mediaIds: string[],
    context?: SharedContext
  ): Promise<ProductMediaVariantDTO[]> {
    const manager = this.getManager(context);
    const variantRepo = manager.getRepository(ProductMediaVariant);

    const variants = await variantRepo.find({
      where: {
        product_media_id: In(mediaIds),
      },
    });

    return variants;
  }

  async create(
    data: CreateProductMediaInput,
    context?: SharedContext
  ): Promise<ProductMediaDTO> {
    const mediaRepo = this.getManager(context).getRepository(ProductMedia);
    const media = mediaRepo.create(data);
    return await mediaRepo.save(media);
  }

  async update(
    id: string,
    data: UpdateProductMediaInput,
    context?: SharedContext
  ): Promise<ProductMediaDTO> {
    const mediaRepo = this.getManager(context).getRepository(ProductMedia);
    const media = await this.retrieve(id);

    for (const [key, value] of Object.entries(data)) {
      media[key] = value;
    }

    return await mediaRepo.save(media);
  }

  async delete(id: string, context?: SharedContext): Promise<void> {
    const manager = this.getManager(context);

    const work = async (transactionManager: EntityManager) => {
      const mediaRepo = transactionManager.getRepository(ProductMedia);
      const media = await mediaRepo.findOne({
        where: { id },
      });

      if (media) {
        await mediaRepo.remove(media);
      }

      // delete variant media attachments
      const variantRepo = transactionManager.getRepository(ProductMediaVariant);

      await variantRepo.delete({
        product_media_id: id,
      });
    };

    if (manager.queryRunner?.isTransactionActive) {
      await work(manager);
    } else {
      await manager.transaction(work);
    }
  }

  async attachToVariant(
    mediaId: string,
    variantId: string,
    type: ProductMediaVariantType,
    context?: SharedContext
  ): Promise<ProductMediaVariantDTO> {
    const variantRepo =
      this.getManager(context).getRepository(ProductMediaVariant);

    // Will thorw if not found
    await this.retrieve(mediaId, {}, context);

    const existing = await variantRepo.findOne({
      where: { product_media_id: mediaId, variant_id: variantId, type },
    });

    if (existing) {
      return existing;
    }

    const mediaVariant = variantRepo.create({
      product_media_id: mediaId,
      variant_id: variantId,
      type,
    });

    await variantRepo.save(mediaVariant);

    return mediaVariant;
  }

  async detachFromVariant(
    mediaId: string,
    variantId: string,
    type: ProductMediaVariantType,
    context?: SharedContext
  ): Promise<void> {
    const variantRepo =
      this.getManager(context).getRepository(ProductMediaVariant);

    const existing = await variantRepo.findOne({
      where: { product_media_id: mediaId, variant_id: variantId, type },
    });

    if (!existing) {
      return;
    }

    await variantRepo.remove(existing);
  }

  private async prepareQuery(
    selector: FilterableProductMediaFields,
    config: FindConfig<ProductMediaDTO>,
    manager: EntityManager
  ) {
    const { variant_id, attachment_type, ...rest } = selector;
    let query = buildQuery(rest, config);

    if (variant_id) {
      const variantIds = Array.isArray(variant_id) ? variant_id : [variant_id];
      let attachmentTypes = [];
      if (attachment_type) {
        attachmentTypes = Array.isArray(attachment_type)
          ? attachment_type
          : [attachment_type];
      }
      query = await this.extendQueryByVariantId(
        query,
        variantIds,
        attachmentTypes,
        manager
      );
    }
    return query;
  }

  private async extendQueryByVariantId(
    query: ReturnType<typeof buildQuery>,
    variantIds: string[],
    attachmentTypes: ProductMediaVariantType[],
    manager: EntityManager
  ): Promise<ReturnType<typeof buildQuery>> {
    const variantRepo = manager.getRepository(ProductMediaVariant);

    const where = {
      variant_id: In(variantIds),
    };

    if (attachmentTypes.length > 0) {
      where["type"] = Array.isArray(attachmentTypes)
        ? In(attachmentTypes)
        : attachmentTypes;
    }
    const variants = await variantRepo.find({ where });

    const mediaIds = variants.map((v) => v.product_media_id);
    query.where = {
      ...query.where,
      id: In(mediaIds),
    };

    return query;
  }
}

export default ProductMediaService;
