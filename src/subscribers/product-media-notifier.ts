import { EntityManager } from "typeorm";
import {
  LineItemService,
  OrderService,
  ProductVariantService,
} from "@medusajs/medusa";
import { IEventBusService } from "@medusajs/types";
import ProductMediaService from "../services/product-media";
import { ProductMediaVariantType } from "../models/product-media-variant";
import DownloadAuthorizationService from "../services/download-authorization";

export default class MySubscriber {
  protected readonly manager_: EntityManager;
  protected readonly productMediaService: ProductMediaService;
  protected readonly lineItemService: LineItemService;
  protected readonly productVariantService: ProductVariantService;
  protected readonly orderService: OrderService;
  protected readonly eventBusService: IEventBusService;
  protected readonly authorizationService: DownloadAuthorizationService;

  constructor({
    manager,
    eventBusService,
    productMediaService,
    lineItemService,
    productVariantService,
    orderService,
    downloadAuthorizationService,
  }: {
    manager: EntityManager;
    eventBusService: IEventBusService;
    productMediaService: ProductMediaService;
    lineItemService: LineItemService;
    productVariantService: ProductVariantService;
    orderService: OrderService;
    downloadAuthorizationService: DownloadAuthorizationService;
  }) {
    this.manager_ = manager;
    this.productMediaService = productMediaService;
    this.lineItemService = lineItemService;
    this.productVariantService = productVariantService;
    this.orderService = orderService;
    this.eventBusService = eventBusService;
    this.authorizationService = downloadAuthorizationService;

    eventBusService.subscribe(
      OrderService.Events.PLACED,
      this.handleOrderPlaced
    );
  }

  handleOrderPlaced = async (data: { id: string }): Promise<any> => {
    const items = await this.lineItemService.list({ order_id: data.id });

    const rawMedia = await Promise.all(
      items.map(async (item) => {
        const media = await this.productMediaService.list(
          {
            variant_id: item.variant_id,
            attachment_type: ProductMediaVariantType.MAIN,
          },
          { take: 1 }
        );

        if (media.length > 0) {
          return {
            lineItemId: item.id,
            media: media[0],
          };
        }

        return null;
      })
    );

    const media = rawMedia.filter((m) => m !== null);

    if (media.length > 0) {
      const order = await this.orderService.retrieve(data.id);

      await Promise.all(
        media.map(async (m) => {
          // create a unique token for the product media download
          const token = this.authorizationService.createToken(
            order.id,
            m.lineItemId,
            m.media.id
          );

          // Uncomment this if you wanna grab the token in the console
          // console.log(token);

          // A subscriber should listen to this event and send the
          // media to the customer
          return this.eventBusService.emit("product-media.send-media", {
            mediaId: m.media.id,
            order_id: order.id,
            display_id: order.display_id,
            email: order.email,
            token,
          });
        })
      );
    }
  };
}
