import { registerProvider } from "@tsed/di";
import { DataSource } from "typeorm";
import { Logger } from "@tsed/logger";
import { envs } from "./config/envs";

export const MYSQL_DATA_SOURCE = Symbol.for("MysqlDatasource");
export type MysqlDataSource = DataSource;
export const mysqlDataSource = new DataSource({
  legacySpatialSupport: false,
  type: "mysql",
  entities: [__dirname + "/entity/*.ts", __dirname + "/entity/*.js"],
  migrations: [__dirname + "/migrations/*.ts", __dirname + "/migrations/*.js"],
  host: envs.DATABASE_HOST,
  port: parseInt(envs.DATABASE_PORT || "3306"),
  username: envs.DATABASE_USER_NAME,
  password: envs.DATABASE_PASSWORD,
  database: envs.DATABASE_NAME,
  timezone: "Z",
  logging: true
});

registerProvider<DataSource>({
  provide: MYSQL_DATA_SOURCE,
  type: "typeorm:datasource",
  deps: [Logger],
  async useAsyncFactory(logger: Logger) {
    await mysqlDataSource.initialize();

    logger.info("Connected with typeorm to database: Mysql");

    return mysqlDataSource;
  },
  hooks: {
    $onDestroy(dataSource) {
      return dataSource.isInitialized && dataSource.close();
    }
  }
});
