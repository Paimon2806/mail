import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { OnboardingQuestion } from "./OnboardingQuestion";
import { FolderTemplate } from "./FolderTemplate";

@Entity("onboarding_question_options")
export class OnboardingQuestionOption {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  optionText: string;

  @Column()
  optionValue: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description?: string;

  @Column()
  questionId: string;

  @ManyToOne(() => OnboardingQuestion, (question) => question.options)
  @JoinColumn({ name: "questionId" })
  question: OnboardingQuestion;

  @OneToMany(() => FolderTemplate, (template) => template.questionOption)
  folderTemplates: FolderTemplate[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
