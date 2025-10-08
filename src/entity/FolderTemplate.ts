import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { OnboardingQuestionOption } from "./OnboardingQuestionOption";

@Entity("folder_templates")
export class FolderTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  folderName: string;

  @Column({ nullable: true })
  folderPath?: string;

  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => FolderTemplate, (template) => template.children, { nullable: true })
  @JoinColumn({ name: "parentId" })
  parent?: FolderTemplate;

  @OneToMany(() => FolderTemplate, (template) => template.parent)
  children: FolderTemplate[];

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description?: string;

  @Column()
  questionOptionId: string;

  @ManyToOne(() => OnboardingQuestionOption, (option) => option.folderTemplates)
  @JoinColumn({ name: "questionOptionId" })
  questionOption: OnboardingQuestionOption;

  @Column({ nullable: true })
  s3Prefix?: string; // For S3 folder structure

  @Column({ nullable: true })
  folderIcon?: string; // Emoji or icon identifier

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
