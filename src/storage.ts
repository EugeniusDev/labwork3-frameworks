export class Storage {
  private static instance: Storage;

  private constructor() {}
  save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  get(key: string): any {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  clear(): void {
    localStorage.clear();
  }

  static getInstance() {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }

    return Storage.instance;
  }
}
