import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index
} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { User } from "./User";
import { Milestone } from "./Milestone";

@Entity("milestone_categories")
@Index("idx_milestone_category_user", ["userId"])
@Index("idx_milestone_category_public", ["isPublic"])
export class MilestoneCategory extends CustomBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  icon?: string;

  @Column({ type: "varchar", length: 7, nullable: true })
  color?: string; // Hex color code

  @Column({ type: "boolean", default: true })
  isPublic!: boolean; // true for public categories, false for personal categories

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "int", default: 0 })
  sortOrder!: number;

  @Column({ type: "varchar", length: 36, nullable: true })
  userId?: string; // null for public categories, user ID for personal categories


  @Column({ type: "json", nullable: true })
  metadata?: any;

  // Relationships
  @ManyToOne(() => User, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user?: User;


  @OneToMany(() => Milestone, (milestone) => milestone.milestoneCategory)
  milestones?: Milestone[];
}
