import { Injectable, Inject } from "@tsed/di";
import { DataSource, Repository } from "typeorm";
import { OnboardingQuestion } from "../entity/OnboardingQuestion";
import { OnboardingQuestionOption } from "../entity/OnboardingQuestionOption";
import { FolderTemplate } from "../entity/FolderTemplate";
import { UserOnboardingResponse } from "../entity/UserOnboardingResponse";
import {
  ICreateOnboardingQuestion,
  IUpdateOnboardingQuestion,
  ICreateUserOnboardingResponse,
  IUpdateUserOnboardingResponse
} from "../interface/IOnboarding";
import { MYSQL_DATA_SOURCE } from "../MysqlDatasource";

@Injectable()
export class OnboardingRepository {
  private questionRepository: Repository<OnboardingQuestion>;
  private questionOptionRepository: Repository<OnboardingQuestionOption>;
  private folderTemplateRepository: Repository<FolderTemplate>;
  private userResponseRepository: Repository<UserOnboardingResponse>;

  constructor(@Inject(MYSQL_DATA_SOURCE) private readonly dataSource: DataSource) {
    this.questionRepository = this.dataSource.getRepository(OnboardingQuestion);
    this.questionOptionRepository = this.dataSource.getRepository(OnboardingQuestionOption);
    this.folderTemplateRepository = this.dataSource.getRepository(FolderTemplate);
    this.userResponseRepository = this.dataSource.getRepository(UserOnboardingResponse);
  }

  // Onboarding Question methods
  async createQuestion(data: ICreateOnboardingQuestion): Promise<OnboardingQuestion> {
    const question = this.questionRepository.create(data);
    return await this.questionRepository.save(question);
  }

  async findAllQuestions(): Promise<OnboardingQuestion[]> {
    return await this.questionRepository.find({
      relations: ["options", "options.folderTemplates"],
      order: { sortOrder: "ASC" }
    });
  }

  async findActiveQuestions(): Promise<OnboardingQuestion[]> {
    return await this.questionRepository.find({
      where: { isActive: true },
      relations: ["options", "options.folderTemplates"],
      order: { sortOrder: "ASC" }
    });
  }

  async findQuestionById(id: string): Promise<OnboardingQuestion | null> {
    return await this.questionRepository.findOne({
      where: { id },
      relations: ["options", "options.folderTemplates"]
    });
  }

  async updateQuestion(id: string, data: IUpdateOnboardingQuestion): Promise<OnboardingQuestion | null> {
    await this.questionRepository.update(id, data);
    return await this.findQuestionById(id);
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const result = await this.questionRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // Question Option methods
  async createQuestionOption(data: any): Promise<OnboardingQuestionOption> {
    const option = this.questionOptionRepository.create(data);
    return await this.questionOptionRepository.save(option);
  }

  async findOptionsByQuestionId(questionId: string): Promise<OnboardingQuestionOption[]> {
    return await this.questionOptionRepository.find({
      where: { questionId },
      relations: ["folderTemplates"],
      order: { sortOrder: "ASC" }
    });
  }

  async findOptionById(id: string): Promise<OnboardingQuestionOption | null> {
    return await this.questionOptionRepository.findOne({
      where: { id },
      relations: ["folderTemplates"]
    });
  }

  // Folder Template methods
  async createFolderTemplate(data: any): Promise<FolderTemplate> {
    const template = this.folderTemplateRepository.create(data);
    return await this.folderTemplateRepository.save(template);
  }

  async findTemplatesByOptionId(questionOptionId: string): Promise<FolderTemplate[]> {
    return await this.folderTemplateRepository.find({
      where: { questionOptionId },
      relations: ["children"],
      order: { sortOrder: "ASC" }
    });
  }

  async findTemplateById(id: string): Promise<FolderTemplate | null> {
    return await this.folderTemplateRepository.findOne({
      where: { id },
      relations: ["children", "parent"]
    });
  }

  // User Response methods
  async createUserResponse(data: ICreateUserOnboardingResponse): Promise<UserOnboardingResponse> {
    const response = this.userResponseRepository.create(data);
    return await this.userResponseRepository.save(response);
  }

  async findUserResponses(userId: string): Promise<UserOnboardingResponse[]> {
    return await this.userResponseRepository.find({
      where: { userId },
      relations: ["question", "selectedOption", "selectedOption.folderTemplates"]
    });
  }

  async findUserResponseByQuestion(userId: string, questionId: string): Promise<UserOnboardingResponse | null> {
    return await this.userResponseRepository.findOne({
      where: { userId, questionId },
      relations: ["question", "selectedOption", "selectedOption.folderTemplates"]
    });
  }

  async updateUserResponse(id: string, data: IUpdateUserOnboardingResponse): Promise<UserOnboardingResponse | null> {
    await this.userResponseRepository.update(id, data);
    return await this.userResponseRepository.findOne({
      where: { id },
      relations: ["question", "selectedOption", "selectedOption.folderTemplates"]
    });
  }

  async deleteUserResponse(id: string): Promise<boolean> {
    const result = await this.userResponseRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async deleteUserResponses(userId: string): Promise<boolean> {
    const result = await this.userResponseRepository.delete({ userId });
    return result.affected ? result.affected > 0 : false;
  }

  // Bulk operations
  async saveUserResponses(responses: UserOnboardingResponse[]): Promise<UserOnboardingResponse[]> {
    return await this.userResponseRepository.save(responses);
  }

  async findFolderTemplatesByResponses(responses: UserOnboardingResponse[]): Promise<FolderTemplate[]> {
    const templates: FolderTemplate[] = [];

    for (const response of responses) {
      if (response.selectedOption && response.selectedOption.folderTemplates) {
        templates.push(...response.selectedOption.folderTemplates);
      }

      if (response.selectedOptionIds) {
        for (const optionId of response.selectedOptionIds) {
          const option = await this.findOptionById(optionId);
          if (option && option.folderTemplates) {
            templates.push(...option.folderTemplates);
          }
        }
      }
    }

    return templates;
  }
}
