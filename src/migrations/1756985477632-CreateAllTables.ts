import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAllTables1756985477632 implements MigrationInterface {
    name = 'CreateAllTables1756985477632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(36) NOT NULL,
                \`firebaseUid\` varchar(255) NOT NULL,
                \`email\` varchar(255) NULL,
                \`fullName\` varchar(255) NOT NULL,
                \`country\` varchar(255) NULL,
                \`avatar\` varchar(255) NULL,
                \`pinHash\` varchar(255) NULL,
                \`emailNotification\` tinyint NULL,
                \`billNotification\` tinyint NULL,
                \`lastLoginAt\` datetime NULL,
                \`isOnboardingCompleted\` tinyint NOT NULL DEFAULT 0,
                \`onboardingCompletedAt\` datetime NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_user_email\` (\`email\`),
                UNIQUE INDEX \`IDX_firebase_uid\` (\`firebaseUid\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create onboarding_questions table
        await queryRunner.query(`
            CREATE TABLE \`onboarding_questions\` (
                \`id\` varchar(36) NOT NULL,
                \`questionText\` varchar(255) NOT NULL,
                \`questionType\` enum('single_choice', 'multiple_choice', 'text', 'boolean') NOT NULL DEFAULT 'single_choice',
                \`sortOrder\` int NOT NULL DEFAULT 0,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`description\` varchar(255) NULL,
                \`isRequired\` tinyint NOT NULL DEFAULT 0,
                \`icon\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create onboarding_question_options table
        await queryRunner.query(`
            CREATE TABLE \`onboarding_question_options\` (
                \`id\` varchar(36) NOT NULL,
                \`optionText\` varchar(255) NOT NULL,
                \`optionValue\` varchar(255) NOT NULL,
                \`sortOrder\` int NOT NULL DEFAULT 0,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`description\` varchar(255) NULL,
                \`questionId\` varchar(36) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create user_onboarding_responses table
        await queryRunner.query(`
            CREATE TABLE \`user_onboarding_responses\` (
                \`id\` varchar(36) NOT NULL,
                \`userId\` varchar(36) NOT NULL,
                \`questionId\` varchar(36) NOT NULL,
                \`selectedOptionId\` varchar(36) NULL,
                \`selectedOptionIds\` json NULL,
                \`textResponse\` text NULL,
                \`booleanResponse\` tinyint NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`idx_user_onboarding_user\` (\`userId\`),
                INDEX \`idx_user_onboarding_question\` (\`questionId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create folder_templates table
        await queryRunner.query(`
            CREATE TABLE \`folder_templates\` (
                \`id\` varchar(36) NOT NULL,
                \`folderName\` varchar(255) NOT NULL,
                \`folderPath\` varchar(255) NULL,
                \`parentId\` varchar(36) NULL,
                \`sortOrder\` int NOT NULL DEFAULT 0,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`description\` varchar(255) NULL,
                \`questionOptionId\` varchar(36) NOT NULL,
                \`s3Prefix\` varchar(255) NULL,
                \`folderIcon\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create user_folders table
        await queryRunner.query(`
            CREATE TABLE \`user_folders\` (
                \`id\` varchar(36) NOT NULL,
                \`folderName\` varchar(255) NOT NULL,
                \`folderIcon\` varchar(255) NULL,
                \`folderPath\` varchar(255) NOT NULL,
                \`parentId\` varchar(36) NULL,
                \`userId\` varchar(36) NOT NULL,
                \`s3Path\` varchar(255) NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`description\` varchar(255) NULL,
                \`metadata\` json NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`idx_user_folder_user\` (\`userId\`),
                INDEX \`idx_user_folder_path\` (\`folderPath\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create milestone_categories table
        await queryRunner.query(`
            CREATE TABLE \`milestone_categories\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(100) NOT NULL,
                \`description\` varchar(255) NULL,
                \`icon\` varchar(50) NULL,
                \`color\` varchar(7) NULL,
                \`isPublic\` tinyint NOT NULL DEFAULT 1,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`sortOrder\` int NOT NULL DEFAULT 0,
                \`userId\` varchar(36) NULL,
                \`metadata\` json NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`idx_milestone_category_user\` (\`userId\`),
                INDEX \`idx_milestone_category_public\` (\`isPublic\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create milestones table
        await queryRunner.query(`
            CREATE TABLE \`milestones\` (
                \`id\` varchar(36) NOT NULL,
                \`title\` varchar(255) NOT NULL,
                \`description\` varchar(255) NULL,
                \`milestoneCategoryId\` varchar(36) NULL,
                \`milestoneDate\` date NOT NULL,
                \`location\` varchar(255) NULL,
                \`tags\` json NULL,
                \`metadata\` json NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`isPrivate\` tinyint NOT NULL DEFAULT 0,
                \`occasion\` varchar(255) NULL,
                \`notes\` varchar(255) NULL,
                \`userId\` varchar(36) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`idx_milestone_user\` (\`userId\`),
                INDEX \`idx_milestone_date\` (\`milestoneDate\`),
                INDEX \`idx_milestone_category\` (\`milestoneCategoryId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create files table
        await queryRunner.query(`
            CREATE TABLE \`files\` (
                \`id\` varchar(36) NOT NULL,
                \`fileName\` varchar(255) NOT NULL,
                \`originalFileName\` varchar(255) NOT NULL,
                \`s3Key\` varchar(255) NOT NULL,
                \`s3Bucket\` varchar(255) NOT NULL,
                \`contentType\` varchar(255) NULL,
                \`fileSize\` bigint NOT NULL DEFAULT 0,
                \`userId\` varchar(36) NOT NULL,
                \`folderId\` varchar(36) NOT NULL,
                \`milestoneId\` varchar(36) NULL,
                \`description\` varchar(255) NULL,
                \`metadata\` json NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`downloadCount\` int NULL,
                \`lastDownloadedAt\` datetime NULL,
                \`tags\` varchar(255) NULL,
                \`textractJobId\` varchar(255) NULL,
                \`isTextExtracted\` tinyint NOT NULL DEFAULT 0,
                \`extractedText\` longtext NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`idx_file_user\` (\`userId\`),
                INDEX \`idx_file_folder\` (\`folderId\`),
                INDEX \`idx_file_s3key\` (\`s3Key\`),
                INDEX \`idx_file_milestone\` (\`milestoneId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create bills table
        await queryRunner.query(`
            CREATE TABLE \`bills\` (
                \`id\` varchar(36) NOT NULL,
                \`billName\` varchar(255) NOT NULL,
                \`amount\` decimal(10,2) NOT NULL,
                \`currency\` varchar(255) NULL,
                \`paymentCycle\` enum('weekly', 'monthly', 'quarterly', 'yearly', 'one-time') NOT NULL DEFAULT 'monthly',
                \`paymentDate\` date NOT NULL,
                \`description\` varchar(255) NULL,
                \`category\` varchar(255) NULL,
                \`vendor\` varchar(255) NULL,
                \`accountNumber\` varchar(255) NULL,
                \`referenceNumber\` varchar(255) NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`isPaid\` tinyint NOT NULL DEFAULT 0,
                \`paidAt\` datetime NULL,
                \`reminderDate\` datetime NULL,
                \`scannedData\` json NULL,
                \`metadata\` json NULL,
                \`userId\` varchar(36) NOT NULL,
                \`folderId\` varchar(36) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`idx_bill_user\` (\`userId\`),
                INDEX \`idx_bill_folder\` (\`folderId\`),
                INDEX \`idx_bill_payment_date\` (\`paymentDate\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE \`onboarding_question_options\`
            ADD CONSTRAINT \`FK_onboarding_question_options_question\`
            FOREIGN KEY (\`questionId\`) REFERENCES \`onboarding_questions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`user_onboarding_responses\`
            ADD CONSTRAINT \`FK_user_onboarding_responses_user\`
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`user_onboarding_responses\`
            ADD CONSTRAINT \`FK_user_onboarding_responses_question\`
            FOREIGN KEY (\`questionId\`) REFERENCES \`onboarding_questions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`user_onboarding_responses\`
            ADD CONSTRAINT \`FK_user_onboarding_responses_selected_option\`
            FOREIGN KEY (\`selectedOptionId\`) REFERENCES \`onboarding_question_options\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`folder_templates\`
            ADD CONSTRAINT \`FK_folder_templates_parent\`
            FOREIGN KEY (\`parentId\`) REFERENCES \`folder_templates\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`folder_templates\`
            ADD CONSTRAINT \`FK_folder_templates_question_option\`
            FOREIGN KEY (\`questionOptionId\`) REFERENCES \`onboarding_question_options\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`user_folders\`
            ADD CONSTRAINT \`FK_user_folders_parent\`
            FOREIGN KEY (\`parentId\`) REFERENCES \`user_folders\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`user_folders\`
            ADD CONSTRAINT \`FK_user_folders_user\`
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`milestone_categories\`
            ADD CONSTRAINT \`FK_milestone_categories_user\`
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`milestones\`
            ADD CONSTRAINT \`FK_milestones_user\`
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`milestones\`
            ADD CONSTRAINT \`FK_milestones_milestone_category\`
            FOREIGN KEY (\`milestoneCategoryId\`) REFERENCES \`milestone_categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`files\`
            ADD CONSTRAINT \`FK_files_user\`
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`files\`
            ADD CONSTRAINT \`FK_files_folder\`
            FOREIGN KEY (\`folderId\`) REFERENCES \`user_folders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`files\`
            ADD CONSTRAINT \`FK_files_milestone\`
            FOREIGN KEY (\`milestoneId\`) REFERENCES \`milestones\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`bills\`
            ADD CONSTRAINT \`FK_bills_user\`
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`bills\`
            ADD CONSTRAINT \`FK_bills_folder\`
            FOREIGN KEY (\`folderId\`) REFERENCES \`user_folders\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE \`bills\` DROP FOREIGN KEY \`FK_bills_folder\``);
        await queryRunner.query(`ALTER TABLE \`bills\` DROP FOREIGN KEY \`FK_bills_user\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP FOREIGN KEY \`FK_files_milestone\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP FOREIGN KEY \`FK_files_folder\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP FOREIGN KEY \`FK_files_user\``);
        await queryRunner.query(`ALTER TABLE \`milestones\` DROP FOREIGN KEY \`FK_milestones_milestone_category\``);
        await queryRunner.query(`ALTER TABLE \`milestones\` DROP FOREIGN KEY \`FK_milestones_user\``);
        await queryRunner.query(`ALTER TABLE \`milestone_categories\` DROP FOREIGN KEY \`FK_milestone_categories_user\``);
        await queryRunner.query(`ALTER TABLE \`user_folders\` DROP FOREIGN KEY \`FK_user_folders_user\``);
        await queryRunner.query(`ALTER TABLE \`user_folders\` DROP FOREIGN KEY \`FK_user_folders_parent\``);
        await queryRunner.query(`ALTER TABLE \`folder_templates\` DROP FOREIGN KEY \`FK_folder_templates_question_option\``);
        await queryRunner.query(`ALTER TABLE \`folder_templates\` DROP FOREIGN KEY \`FK_folder_templates_parent\``);
        await queryRunner.query(`ALTER TABLE \`user_onboarding_responses\` DROP FOREIGN KEY \`FK_user_onboarding_responses_selected_option\``);
        await queryRunner.query(`ALTER TABLE \`user_onboarding_responses\` DROP FOREIGN KEY \`FK_user_onboarding_responses_question\``);
        await queryRunner.query(`ALTER TABLE \`user_onboarding_responses\` DROP FOREIGN KEY \`FK_user_onboarding_responses_user\``);
        await queryRunner.query(`ALTER TABLE \`onboarding_question_options\` DROP FOREIGN KEY \`FK_onboarding_question_options_question\``);

        // Drop tables
        await queryRunner.query(`DROP TABLE \`bills\``);
        await queryRunner.query(`DROP TABLE \`files\``);
        await queryRunner.query(`DROP TABLE \`milestones\``);
        await queryRunner.query(`DROP TABLE \`milestone_categories\``);
        await queryRunner.query(`DROP TABLE \`user_folders\``);
        await queryRunner.query(`DROP TABLE \`folder_templates\``);
        await queryRunner.query(`DROP TABLE \`user_onboarding_responses\``);
        await queryRunner.query(`DROP TABLE \`onboarding_question_options\``);
        await queryRunner.query(`DROP TABLE \`onboarding_questions\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }
}
