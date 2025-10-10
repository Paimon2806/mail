import { mysqlDataSource } from "../MysqlDatasource";
import { Logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

/**
 * Consolidated seed data script for Prepr Vault
 * Seeds all necessary data including onboarding questions, folder templates, and milestone categories
 */

interface SeedData {
  questions: any[];
  questionOptions: any[];
  folderTemplates: any[];
  milestoneCategories: any[];
}

const seedData: SeedData = {
  questions: [
    {
      id: "q1-priorities",
      questionText: "What are your top priorities right now?",
      questionType: "multiple_choice",
      sortOrder: 1,
      isRequired: false,
      description: "Select all that apply",
      icon: "⭐"
    },
    {
      id: "q2-family",
      questionText: "Who else is part of your immediate family?",
      questionType: "multiple_choice",
      sortOrder: 2,
      isRequired: false,
      description: "Select all that apply",
      icon: "👨‍👩‍👧‍👦"
    },
    {
      id: "q3-employment",
      questionText: "Nature of your employment?",
      questionType: "single_choice",
      sortOrder: 3,
      isRequired: false,
      description: "Select one option",
      icon: "💼"
    },
    {
      id: "q4-investments",
      questionText: "Do you invest?",
      questionType: "multiple_choice",
      sortOrder: 4,
      isRequired: false,
      description: "Select all that apply",
      icon: "📈"
    }
  ],

  questionOptions: [
    // Q1 - Priorities options
    { id: "q1-opt1", questionId: "q1-priorities", optionText: "Building emergency fund", optionValue: "emergency_fund", sortOrder: 1 },
    { id: "q1-opt2", questionId: "q1-priorities", optionText: "Saving for retirement", optionValue: "retirement", sortOrder: 2 },
    { id: "q1-opt3", questionId: "q1-priorities", optionText: "Paying off debt", optionValue: "debt_payoff", sortOrder: 3 },
    { id: "q1-opt4", questionId: "q1-priorities", optionText: "Saving for home", optionValue: "home_savings", sortOrder: 4 },
    { id: "q1-opt5", questionId: "q1-priorities", optionText: "Education funding", optionValue: "education", sortOrder: 5 },
    { id: "q1-opt6", questionId: "q1-priorities", optionText: "Travel & experiences", optionValue: "travel", sortOrder: 6 },

    // Q2 - Family options
    { id: "q2-opt1", questionId: "q2-family", optionText: "Spouse/Partner", optionValue: "spouse", sortOrder: 1 },
    { id: "q2-opt2", questionId: "q2-family", optionText: "Children", optionValue: "children", sortOrder: 2 },
    { id: "q2-opt3", questionId: "q2-family", optionText: "Parents", optionValue: "parents", sortOrder: 3 },
    { id: "q2-opt4", questionId: "q2-family", optionText: "Siblings", optionValue: "siblings", sortOrder: 4 },
    { id: "q2-opt5", questionId: "q2-family", optionText: "Just me", optionValue: "just_me", sortOrder: 5 },

    // Q3 - Employment options
    { id: "q3-opt1", questionId: "q3-employment", optionText: "Full-time employee", optionValue: "full_time", sortOrder: 1 },
    { id: "q3-opt2", questionId: "q3-employment", optionText: "Part-time employee", optionValue: "part_time", sortOrder: 2 },
    { id: "q3-opt3", questionId: "q3-employment", optionText: "Self-employed/Freelancer", optionValue: "freelancer", sortOrder: 3 },
    { id: "q3-opt4", questionId: "q3-employment", optionText: "Business owner", optionValue: "business_owner", sortOrder: 4 },
    { id: "q3-opt5", questionId: "q3-employment", optionText: "Student", optionValue: "student", sortOrder: 5 },
    { id: "q3-opt6", questionId: "q3-employment", optionText: "Retired", optionValue: "retired", sortOrder: 6 },
    { id: "q3-opt7", questionId: "q3-employment", optionText: "Unemployed", optionValue: "unemployed", sortOrder: 7 },

    // Q4 - Investment options
    { id: "q4-opt1", questionId: "q4-investments", optionText: "Stocks", optionValue: "stocks", sortOrder: 1 },
    { id: "q4-opt2", questionId: "q4-investments", optionText: "Bonds", optionValue: "bonds", sortOrder: 2 },
    { id: "q4-opt3", questionId: "q4-investments", optionText: "Mutual funds", optionValue: "mutual_funds", sortOrder: 3 },
    { id: "q4-opt4", questionId: "q4-investments", optionText: "Real estate", optionValue: "real_estate", sortOrder: 4 },
    { id: "q4-opt5", questionId: "q4-investments", optionText: "Cryptocurrency", optionValue: "crypto", sortOrder: 5 },
    { id: "q4-opt6", questionId: "q4-investments", optionText: "Savings accounts", optionValue: "savings", sortOrder: 6 },
    { id: "q4-opt7", questionId: "q4-investments", optionText: "None yet", optionValue: "none", sortOrder: 7 }
  ],

  folderTemplates: [
    // Emergency Fund templates
    {
      id: uuidv4(),
      folderName: "Emergency Fund",
      description: "Essential documents for emergency situations",
      folderIcon: "🚨",
      questionOptionId: "q1-opt1",
      sortOrder: 1
    },
    {
      id: uuidv4(),
      folderName: "Insurance Documents",
      description: "All insurance policies and claims",
      folderIcon: "🛡️",
      questionOptionId: "q1-opt1",
      sortOrder: 2
    },
    {
      id: uuidv4(),
      folderName: "Emergency Contacts",
      description: "Important contact information",
      folderIcon: "📞",
      questionOptionId: "q1-opt1",
      sortOrder: 3
    },

    // Retirement templates
    {
      id: uuidv4(),
      folderName: "Retirement Planning",
      description: "Retirement account documents and planning",
      folderIcon: "🏖️",
      questionOptionId: "q1-opt2",
      sortOrder: 1
    },
    {
      id: uuidv4(),
      folderName: "Pension Documents",
      description: "Pension and superannuation documents",
      folderIcon: "💰",
      questionOptionId: "q1-opt2",
      sortOrder: 2
    },
    {
      id: uuidv4(),
      folderName: "Social Security",
      description: "Social security and government benefits",
      folderIcon: "🏛️",
      questionOptionId: "q1-opt2",
      sortOrder: 3
    },

    // Family templates
    {
      id: uuidv4(),
      folderName: "Family Documents",
      description: "Family-related documents and records",
      folderIcon: "👨‍👩‍👧‍👦",
      questionOptionId: "q2-opt1",
      sortOrder: 1
    },
    {
      id: uuidv4(),
      folderName: "Children's Documents",
      description: "Children's birth certificates, school records",
      folderIcon: "👶",
      questionOptionId: "q2-opt2",
      sortOrder: 1
    },
    {
      id: uuidv4(),
      folderName: "Parents' Documents",
      description: "Parents' medical and care documents",
      folderIcon: "👴👵",
      questionOptionId: "q2-opt3",
      sortOrder: 1
    },

    // Employment templates
    {
      id: uuidv4(),
      folderName: "Employment Records",
      description: "Work contracts, payslips, and HR documents",
      folderIcon: "💼",
      questionOptionId: "q3-opt1",
      sortOrder: 1
    },
    {
      id: uuidv4(),
      folderName: "Business Documents",
      description: "Business registration, tax documents",
      folderIcon: "🏢",
      questionOptionId: "q3-opt4",
      sortOrder: 1
    },
    {
      id: uuidv4(),
      folderName: "Freelance Work",
      description: "Freelance contracts and invoices",
      folderIcon: "💻",
      questionOptionId: "q3-opt3",
      sortOrder: 1
    },

    // Investment templates
    {
      id: uuidv4(),
      folderName: "Investment Portfolio",
      description: "Stocks, bonds, and investment records",
      folderIcon: "📈",
      questionOptionId: "q4-opt1",
      sortOrder: 1
    },
    {
      id: uuidv4(),
      folderName: "Real Estate",
      description: "Property documents and mortgage records",
      folderIcon: "🏠",
      questionOptionId: "q4-opt4",
      sortOrder: 1
    },
    {
      id: uuidv4(),
      folderName: "Cryptocurrency",
      description: "Crypto wallet information and transactions",
      folderIcon: "₿",
      questionOptionId: "q4-opt5",
      sortOrder: 1
    }
  ],

  milestoneCategories: [
    { id: uuidv4(), name: "Got married", icon: "💒", color: "#FF6B6B", description: "Wedding and marriage milestones" },
    { id: uuidv4(), name: "Had children", icon: "👶", color: "#4ECDC4", description: "Birth and parenting milestones" },
    { id: uuidv4(), name: "Career achievements", icon: "💼", color: "#45B7D1", description: "Professional accomplishments" },
    { id: uuidv4(), name: "Educational milestones", icon: "🎓", color: "#96CEB4", description: "Graduations and learning achievements" },
    { id: uuidv4(), name: "Travel adventures", icon: "✈️", color: "#FFEAA7", description: "Travel and exploration experiences" },
    { id: uuidv4(), name: "Health & fitness", icon: "💪", color: "#DDA0DD", description: "Health and wellness achievements" },
    { id: uuidv4(), name: "Financial milestones", icon: "💰", color: "#98D8C8", description: "Financial goals and achievements" },
    { id: uuidv4(), name: "Personal growth", icon: "🌱", color: "#F7DC6F", description: "Personal development and growth" },
    { id: uuidv4(), name: "Hobbies & interests", icon: "🎨", color: "#BB8FCE", description: "Creative and hobby achievements" },
    { id: uuidv4(), name: "Other", icon: "⭐", color: "#85C1E9", description: "Other life events and milestones" }
  ]
};

async function seedDatabase(): Promise<void> {
  try {
    Logger.info("Starting database seeding...");

    await mysqlDataSource.initialize();
    Logger.info("Database connected successfully");

    // Disable foreign key checks
    await mysqlDataSource.query("SET FOREIGN_KEY_CHECKS = 0");

    // Clear existing data
    Logger.info("Clearing existing data...");
    await mysqlDataSource.query("DELETE FROM user_onboarding_responses");
    await mysqlDataSource.query("DELETE FROM folder_templates");
    await mysqlDataSource.query("DELETE FROM onboarding_question_options");
    await mysqlDataSource.query("DELETE FROM onboarding_questions");
    await mysqlDataSource.query("DELETE FROM milestone_categories");

    // Re-enable foreign key checks
    await mysqlDataSource.query("SET FOREIGN_KEY_CHECKS = 1");

    // Seed onboarding questions
    Logger.info("Seeding onboarding questions...");
    for (const question of seedData.questions) {
      await mysqlDataSource.query(
        `
        INSERT INTO onboarding_questions (id, questionText, questionType, sortOrder, isActive, description, isRequired, icon, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
        [
          question.id,
          question.questionText,
          question.questionType,
          question.sortOrder,
          1,
          question.description,
          question.isRequired,
          question.icon
        ]
      );
    }

    // Seed question options
    Logger.info("Seeding question options...");
    for (const option of seedData.questionOptions) {
      await mysqlDataSource.query(
        `
        INSERT INTO onboarding_question_options (id, questionId, optionText, optionValue, sortOrder, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
        [option.id, option.questionId, option.optionText, option.optionValue, option.sortOrder]
      );
    }

    // Seed folder templates
    Logger.info("Seeding folder templates...");
    for (const template of seedData.folderTemplates) {
      await mysqlDataSource.query(
        `
        INSERT INTO folder_templates (id, folderName, description, folderIcon, questionOptionId, sortOrder, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
        [template.id, template.folderName, template.description, template.folderIcon, template.questionOptionId, template.sortOrder, 1]
      );
    }

    // Seed milestone categories
    Logger.info("Seeding milestone categories...");
    for (const category of seedData.milestoneCategories) {
      await mysqlDataSource.query(
        `
        INSERT INTO milestone_categories (id, name, icon, color, description, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
        [category.id, category.name, category.icon, category.color, category.description]
      );
    }

    Logger.info("Database seeding completed successfully!");
  } catch (error) {
    Logger.error("Error during database seeding:", error);
    throw error;
  } finally {
    await mysqlDataSource.destroy();
    Logger.info("Database connection closed");
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      Logger.info("Seeding process completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      Logger.error("Seeding process failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };
