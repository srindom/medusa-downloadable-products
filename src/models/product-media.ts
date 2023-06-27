import { generateEntityId, SoftDeletableEntity } from "@medusajs/medusa";
import { BeforeInsert, Column, Entity } from "typeorm";

@Entity()
export class ProductMedia extends SoftDeletableEntity {
  @Column()
  name: string;

  @Column()
  file: string;

  @Column()
  mime_type: string;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "prodmed");
  }
}
