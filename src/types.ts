import { BaziChart } from './paipan';

export interface BaziDisplay {
  year: string;
  month: string;
  day: string;
  time: string;
  chart: BaziChart;
}

export interface PartnerInfo {
  name?: string;
  gender?: string;
  chart?: BaziChart;
}
