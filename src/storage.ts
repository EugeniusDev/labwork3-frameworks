import { ILibraryEntity } from './models';

export class Storage {
  private static instance: Storage;

  private constructor() {}
  save(key: string, data: Array<ILibraryEntity>) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  get(key: string): Array<ILibraryEntity> {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  static getInstance() {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }

    return Storage.instance;
  }
}
