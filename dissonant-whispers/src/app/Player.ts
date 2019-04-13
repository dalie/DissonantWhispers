interface ChatEntry {
  author: string;
  message: string;
  date: string;
}

export interface Player {
  id: string;
  name: string;
  chatLog: ChatEntry[];
}
