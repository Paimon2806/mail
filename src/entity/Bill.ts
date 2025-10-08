import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index
} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { User } from "./User";
import { UserFolder } from "./UserFolder";

@Entity("bills")
@Index("idx_bill_user", ["userId"])
@Index("idx_bill_folder", ["folderId"])
@Index("idx_bill_payment_date", ["paymentDate"])
export class Bill extends CustomBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  billerName: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ 
    type: "enum", 
    enum: ["weekly", "monthly", "quarterly", "yearly", "one-time"],
    default: "monthly"
  })
  paymentCycle: string;

  @Column({ type: "date" })
  paymentDate: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: true })
  folderId?: string;

  @ManyToOne(() => UserFolder, { nullable: true })
  @JoinColumn({ name: "folderId" })
  folder?: UserFolder;

}
