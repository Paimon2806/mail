Folder PATH listing
Volume serial number is 1417-F43A
C:.
| .barrelsby.json
| .dockerignore
| .eslintignore
| .eslintrc
| .gitignore
| .npmrc
| .prettierignore
| .prettierrc
| docker-compose.yml
| Dockerfile
| ecosystem.config.js
| env.example
| GEMINI.md
| jest.config.js
| package-lock.json
| package.json
| processes.config.js
| README.md
| structure.md
| tsconfig.build.json
| tsconfig.compile.json
| tsconfig.json
|  
+---.gemini
| \---commands
| speckit.analyze.toml
| speckit.checklist.toml
| speckit.clarify.toml
| speckit.constitution.toml
| speckit.implement.toml
| speckit.plan.toml
| speckit.specify.toml
| speckit.tasks.toml
|  
+---.specify
| +---memory
| | constitution.md
| |  
| +---scripts
| | \---powershell
| | check-prerequisites.ps1
| | common.ps1
| | create-new-feature.ps1
| | setup-plan.ps1
| | update-agent-context.ps1
| |  
| \---templates
| agent-file-template.md
| checklist-template.md
| plan-template.md
| spec-template.md
| tasks-template.md
|  
+---docs
| email-classification-feature.md
|  
+---sample-requests
| add-fcm-token.json
| bill-operations.json
| create-user-minimal.json
| create-user.json
| delete-fcm-token.json
| email-classification.json
| fcm-token-operations.json
| folder-operations.json
| get-fcm-tokens.json
| milestone-category-admin-operations.json
| milestone-category-operations.json
| milestone-operations-updated.json
| milestone-operations.json
| onboarding-sample.json
| set-pin.json
| update-pin.json
| update-user-notifications.json
| update-user-partial.json
| update-user.json
| verify-pin.json
|  
+---specs
| \---001-create-attactment-analyser
| | data-model.md
| | plan.md
| | research.md
| | spec.md
| | tasks.md
| |  
| +---checklists
| | requirements.md
| |  
| \---contracts
| openapi.json
|  
+---src
| | index.ts
| | MysqlDatasource.ts
| | Server.ts
| |  
| +---config
| | | index.ts
| | |  
| | +---envs
| | | index.ts
| | |  
| | \---logger
| | constant.ts
| | index.ts
| |  
| +---controllers
| | +---pages
| | | index.ts
| | | IndexController.ts
| | |  
| | \---rest
| | bill.controller.ts
| | email-classification.controller.ts
| | file.controller.ts
| | folder.controller.ts
| | index.ts
| | milestone-category.controller.ts
| | milestone.controller.ts
| | onboarding.controller.ts
| | user.controller.ts
| |  
| +---decorators
| | CustomAuth.ts
| | index.ts
| |  
| +---entity
| | Bill.ts
| | CustomBaseEntity.ts
| | FcmToken.ts
| | File.ts
| | FolderTemplate.ts
| | index.ts
| | Milestone.ts
| | MilestoneCategory.ts
| | OnboardingQuestion.ts
| | OnboardingQuestionOption.ts
| | User.ts
| | UserFolder.ts
| | UserOnboardingResponse.ts
| |  
| +---exceptions
| | AppException.ts
| | index.ts
| |  
| +---interface
| | IFolderOperations.ts
| | IMilestone.ts
| | IMilestoneCategory.ts
| | index.ts
| | IOnboarding.ts
| | IUser.ts
| |  
| +---middlewares
| | error-handler.middleware.ts
| | firebase-auth.middleware.ts
| | index.ts
| |  
| +---migrations
| | 1756985477632-CreateAllTables.ts
| | 1756987000000-CleanBillsTable.ts
| | 1756989000000-CreateFcmTokenTable.ts
| |  
| +---repositories
| | bill.repository.ts
| | fcm-token.repository.ts
| | file.repository.ts
| | index.ts
| | milestone-category.repository.ts
| | milestone.repository.ts
| | onboarding.repository.ts
| | user-folder.repository.ts
| | user.repository.ts
| |  
| +---schemas
| | ApiResponse.ts
| | BillDto.ts
| | CreateUserDto.ts
| | EmailClassificationDto.ts
| | FileDto.ts
| | index.ts
| | MilestoneCategoryDto.ts
| | MilestoneDto.ts
| | OnboardingDto.ts
| | SearchResponse.ts
| | SetPinDto.ts
| | UpdatePinDto.ts
| | UpdateUserDto.ts
| | VerifyPinDto.ts
| |  
| +---scripts
| | seed-data.ts
| |  
| +---services
| | bill.service.ts
| | email-classification.service.spec.ts
| | email-classification.service.ts
| | FileUploadService.ts
| | FirebaseAuthServices.ts
| | folder.service.ts
| | index.ts
| | milestone-category.service.ts
| | milestone.service.ts
| | onboarding.service.ts
| | pin.service.ts
| | user.service.ts
| |  
| +---transformers
| | index.ts
| |  
| \---utils
| logger.ts
|  
\---views
swagger.ejs
