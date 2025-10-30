import { DefaultNamingStrategy } from 'typeorm';

export class CustomDatabaseNamingStrategy extends DefaultNamingStrategy {
  override tableName(
    targetName: string,
    userSpecifiedName: string | undefined,
  ): string {
    return super.tableName(targetName.replace('Entity', ''), userSpecifiedName);
  }
}
