import { Required } from "@tsed/schema";
import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BaseEntity } from "typeorm";

export abstract class CustomBaseEntity extends BaseEntity {
  @CreateDateColumn({
    type: "timestamp"
  })
  @Required(false)
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp"
  })
  @Required(false)
  updatedAt: Date;

  @DeleteDateColumn({
    type: "timestamp"
  })
  @Required(false)
  deletedAt: Date;
}
