import { Entity, Column, ManyToOne, JoinColumn, Index, PrimaryGeneratedColumn } from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { User } from "./User";

@Entity("fcm_tokens")
@Index("idx_fcm_token_user", ["userId"])
@Index("idx_fcm_token_value", ["token"], { unique: true })
export class FcmToken extends CustomBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  token: string;

  @Column({ type: "varchar", length: 36 })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;
}
