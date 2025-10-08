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

@Entity("user_folders")
@Index("idx_user_folder_user", ["userId"])
@Index("idx_user_folder_path", ["folderPath"])
export class UserFolder {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  folderName: string;

  @Column({ nullable: true })
  folderIcon?: string;

  @Column()
  folderPath: string;

  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => UserFolder, (folder) => folder.children, { nullable: true })
  @JoinColumn({ name: "parentId" })
  parent?: UserFolder;

  @OneToMany(() => UserFolder, (folder) => folder.parent)
  children: UserFolder[];

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: true })
  s3Path?: string; // S3 path for the folder

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any>; // Store additional folder metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
