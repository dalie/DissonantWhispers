import { Player } from './Player';

export interface Session {
  server: string;
  name: string;
  players: Player[];
}
