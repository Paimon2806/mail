import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { OnboardingQuestionOption } from "./OnboardingQuestionOption";

export enum QuestionType {
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
  TEXT = "text",
  BOOLEAN = "boolean"
}

@Entity("onboarding_questions")
export class OnboardingQuestion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  questionText: string;

  @Column({
    type: "enum",
    enum: QuestionType,
    default: QuestionType.SINGLE_CHOICE
  })
  questionType: QuestionType;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ nullable: true })
  icon?: string;

  @OneToMany(() => OnboardingQuestionOption, (option) => option.question)
  options: OnboardingQuestionOption[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
