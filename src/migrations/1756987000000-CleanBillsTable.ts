import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanBillsTable1756987000000 implements MigrationInterface {
  name = "CleanBillsTable1756987000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create a clean bills table with the final structure
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`bills_clean\` (
                \`id\` varchar(36) NOT NULL,
                \`billerName\` varchar(255) NOT NULL,
                \`amount\` decimal(10,2) NOT NULL,
                \`paymentCycle\` enum('weekly', 'monthly', 'quarterly', 'yearly', 'one-time') NOT NULL DEFAULT 'monthly',
                \`paymentDate\` date NOT NULL,
                \`userId\` varchar(36) NOT NULL,
                \`folderId\` varchar(36) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` datetime(6) NULL,
                PRIMARY KEY (\`id\`),
                INDEX \`idx_bill_user\` (\`userId\`),
                INDEX \`idx_bill_folder\` (\`folderId\`),
                INDEX \`idx_bill_payment_date\` (\`paymentDate\`),
                CONSTRAINT \`FK_bills_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_bills_folder\` FOREIGN KEY (\`folderId\`) REFERENCES \`user_folders\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

    // Copy data from old bills table if it exists
    await queryRunner.query(`
            INSERT INTO \`bills_clean\` 
            SELECT 
                \`id\`,
                \`billerName\`,
                \`amount\`,
                \`paymentCycle\`,
                \`paymentDate\`,
                \`userId\`,
                \`folderId\`,
                \`createdAt\`,
                \`updatedAt\`,
                NULL as \`deletedAt\`
            FROM \`bills\` 
            WHERE EXISTS (SELECT 1 FROM \`bills\`)
        `);

    // Drop old bills table
    await queryRunner.query(`DROP TABLE IF EXISTS \`bills\``);

    // Rename clean table to bills
    await queryRunner.query(`RENAME TABLE \`bills_clean\` TO \`bills\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the original bills table structure
    await queryRunner.query(`
            CREATE TABLE \`bills\` (
                \`id\` varchar(36) NOT NULL,
                \`billerName\` varchar(255) NOT NULL,
                \`amount\` decimal(10,2) NOT NULL,
                \`paymentCycle\` enum('weekly', 'monthly', 'quarterly', 'yearly', 'one-time') NOT NULL DEFAULT 'monthly',
                \`paymentDate\` date NOT NULL,
                \`userId\` varchar(36) NOT NULL,
                \`folderId\` varchar(36) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`idx_bill_user\` (\`userId\`),
                INDEX \`idx_bill_folder\` (\`folderId\`),
                INDEX \`idx_bill_payment_date\` (\`paymentDate\`),
                CONSTRAINT \`FK_bills_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_bills_folder\` FOREIGN KEY (\`folderId\`) REFERENCES \`user_folders\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
  }
}
