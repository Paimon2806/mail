import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { User } from "./User";
import { OnboardingQuestion } from "./OnboardingQuestion";
import { OnboardingQuestionOption } from "./OnboardingQuestionOption";

@Entity("user_onboarding_responses")
@Index("idx_user_onboarding_user", ["userId"])
@Index("idx_user_onboarding_question", ["questionId"])
export class UserOnboardingResponse {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  questionId: string;

  @ManyToOne(() => OnboardingQuestion)
  @JoinColumn({ name: "questionId" })
  question: OnboardingQuestion;

  @Column({ nullable: true })
  selectedOptionId?: string;

  @ManyToOne(() => OnboardingQuestionOption, { nullable: true })
  @JoinColumn({ name: "selectedOptionId" })
  selectedOption?: OnboardingQuestionOption;

  @Column({ type: "json", nullable: true })
  selectedOptionIds?: string[]; // For multiple choice questions

  @Column({ type: "text", nullable: true })
  textResponse?: string; // For text questions

  @Column({ nullable: true })
  booleanResponse?: boolean; // For boolean questions

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
