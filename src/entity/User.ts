import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";

@Entity("users")
@Index("idx_user_email", ["email"], { unique: true })
export class User extends CustomBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  firebaseUid: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true, select: false })
  pinHash?: string;

  @Column({ nullable: true })
  emailNotification?: boolean;

  @Column({ nullable: true })
  billNotification?: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ default: false })
  isOnboardingCompleted: boolean;

  @Column({ nullable: true })
  onboardingCompletedAt?: Date;
}