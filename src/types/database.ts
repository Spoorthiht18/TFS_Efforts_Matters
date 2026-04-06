export interface Database {
  public: {
    Tables: {
      effort_records: {
        Row: EffortRecord;
        Insert: Omit<EffortRecord, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<EffortRecord, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

export interface EffortRecord {
  id: string;
  developer_name: string;
  story_number: string;
  description: string;
  state: string;
  tool_used: boolean;
  tool_name: string | null;
  effort_with_tool: number | null;
  effort_without_tool: number | null;
  reason_not_used: string | null;
  created_at: string;
  updated_at: string;
}
