import { generateEntityId, SoftDeletableEntity } from "@medusajs/medusa";
import { BeforeInsert, Column, Entity } from "typeorm";

export enum ProductMediaVariantType {
  PREVIEW = "preview",
  MAIN = "main",
}

@Entity()
export class ProductMediaVariant extends SoftDeletableEntity {
  @Column()
  product_media_id: string;

  @Column()
  variant_id: string;

  @Column({ type: "enum", enum: ProductMediaVariantType })
  type: ProductMediaVariantType;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "pmvar");
  }
}
