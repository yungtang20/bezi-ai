import { BaziChart } from './paipan';

export interface BaziDisplay {
  year: string;
  month: string;
  day: string;
  time: string;
  chart: BaziChart;
}

export interface PartnerInfo {
  id?: string;
  name?: string;
  relationship?: string;
  gender?: string;
  birthDate?: string;
  birthTime?: string;
  chart?: BaziChart;
}

export type FiveElement = '木' | '火' | '土' | '金' | '水';

export interface SynastryDetail {
  factor: string;
  desc: string;
  advice?: string;
}
