import { MigrationInterface, QueryRunner, Table, Index, ForeignKey, TableIndex, TableForeignKey } from "typeorm";

export class CreateFcmTokenTable1756989000000 implements MigrationInterface {
    name = 'CreateFcmTokenTable1756989000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "fcm_tokens",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid()"
                    },
                    {
                        name: "token",
                        type: "text",
                        isNullable: false,
                        comment: "Firebase Cloud Messaging token"
                    },
                    {
                        name: "userId",
                        type: "varchar",
                        length: "36",
                        isNullable: false,
                        comment: "Reference to users table"
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                        isNullable: false
                    }
                ]
            }),
            true
        );

        // Create indexes
        await queryRunner.createIndex(
            "fcm_tokens",
            new TableIndex({
                name: "idx_fcm_token_user",
                columnNames: ["userId"]
            })
        );
        await queryRunner.createIndex(
            "fcm_tokens",
            new TableIndex({
                name: "idx_fcm_token_value",
                columnNames: ["token"],
                isUnique: true
            })
        );

        // Create foreign key
        await queryRunner.createForeignKey(
            "fcm_tokens",
            new TableForeignKey({
                name: "fk_fcm_tokens_user",
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("fcm_tokens");
    }
}
