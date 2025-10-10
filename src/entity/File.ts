import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { User } from "./User";
import { UserFolder } from "./UserFolder";
import { Milestone } from "./Milestone";

@Entity("files")
@Index("idx_file_user", ["userId"])
@Index("idx_file_folder", ["folderId"])
@Index("idx_file_s3key", ["s3Key"])
@Index("idx_file_milestone", ["milestoneId"])
export class File extends CustomBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  fileName: string;

  @Column()
  originalFileName: string;

  @Column()
  s3Key: string; // S3 object key

  @Column()
  s3Bucket: string;

  @Column({ nullable: true })
  contentType?: string;

  @Column({ type: "bigint", default: 0 })
  fileSize: number; // File size in bytes

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  folderId: string;

  @ManyToOne(() => UserFolder)
  @JoinColumn({ name: "folderId" })
  folder: UserFolder;

  @Column({ nullable: true })
  milestoneId?: string;

  @ManyToOne(() => Milestone, (milestone) => milestone.files, { nullable: true })
  @JoinColumn({ name: "milestoneId" })
  milestone?: Milestone;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any>; // Store additional file metadata

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  downloadCount?: number;

  @Column({ nullable: true })
  lastDownloadedAt?: Date;

  @Column({ nullable: true })
  tags?: string; // Comma-separated tags for search

  // Text extraction fields (for AWS Textract)
  @Column({ nullable: true })
  textractJobId?: string;

  @Column({ default: false })
  isTextExtracted: boolean;

  @Column({ type: "longtext", nullable: true })
  extractedText?: string;
}
