import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from "typeorm";
import { User } from "./User";
import { File } from "./File";
import { MilestoneCategory } from "./MilestoneCategory";

@Entity("milestones")
@Index("idx_milestone_user", ["userId"])
@Index("idx_milestone_date", ["milestoneDate"])
@Index("idx_milestone_category", ["milestoneCategoryId"])
export class Milestone {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 36, nullable: true })
  milestoneCategoryId?: string; // Reference to milestone category

  @Column({ type: "date" })
  milestoneDate: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: "json", nullable: true })
  tags?: string[]; // Array of tags like ["First Travel", "Anniversary", "Graduation"]

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any>; // Additional milestone metadata

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPrivate: boolean; // Whether milestone is private to user

  @Column({ nullable: true })
  occasion?: string; // Custom occasion name

  @Column({ nullable: true })
  notes?: string; // Additional notes

  // User relationship
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  // Milestone category relationship
  @ManyToOne(() => MilestoneCategory, { nullable: true })
  @JoinColumn({ name: "milestoneCategoryId" })
  milestoneCategory?: MilestoneCategory;

  // File relationships (milestone can have multiple photos/files)
  @OneToMany(() => File, (file) => file.milestone)
  files: File[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
