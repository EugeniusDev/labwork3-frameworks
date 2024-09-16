export class Storage {
  private static instance: Storage;

  private constructor() {}
  save<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  get<T>(key: string): T {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  static getInstance() {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }

    return Storage.instance;
  }
}
