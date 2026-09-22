import path from 'node:path';
import Database from 'better-sqlite3';

export interface EvidenceData {
  record_id: string;
  bazi: { year: string; month: string; day: string; time: string; dayMaster: string; gender: string };
  fiveElements: Record<'wood' | 'fire' | 'earth' | 'metal' | 'water', number>;
  tenGods: Record<string, number>;
  dayun: Array<Record<string, string | number>>;
  liunian: Array<Record<string, string | number>>;
}

export interface EvidenceSource {
  type: 'sql' | 'mcp';
  getData(recordId: string): Promise<EvidenceData>;
}

export interface EvidenceRecordSummary {
  record_id: string;
  birth: string;
  gender: string;
}

export class EvidenceNotFoundError extends Error {
  constructor(recordId: string) {
    super(`Evidence record not found: ${recordId}`);
    this.name = 'EvidenceNotFoundError';
  }
}

export class SqliteEvidenceSource implements EvidenceSource {
  readonly type = 'sql' as const;
  private readonly database: Database.Database;

  constructor(databasePath = path.join(process.cwd(), 'data', 'bezi.db')) {
    this.database = new Database(databasePath, { readonly: true, fileMustExist: true });
  }

  async getData(recordId: string): Promise<EvidenceData> {
    const row = this.database
      .prepare('SELECT data_json FROM bazi_records WHERE record_id = ?')
      .get(recordId) as { data_json?: string } | undefined;
    if (!row?.data_json) throw new EvidenceNotFoundError(recordId);
    try {
      return JSON.parse(row.data_json) as EvidenceData;
    } catch {
      throw new EvidenceNotFoundError(recordId);
    }
  }

  async listRecords(): Promise<EvidenceRecordSummary[]> {
    const rows = this.database.prepare('SELECT data_json FROM bazi_records ORDER BY record_id').all() as Array<{ data_json: string }>;
    return rows.flatMap(({ data_json }) => {
      try {
        const record = JSON.parse(data_json) as EvidenceData;
        return [{ record_id: record.record_id, birth: `${record.bazi.year}-${record.bazi.month}-${record.bazi.day}`, gender: record.bazi.gender }];
      } catch {
        return [];
      }
    });
  }
}
