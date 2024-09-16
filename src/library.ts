import { ILibraryEntity } from './models';
import { IPaginator } from './services';

export class Library<TItem extends ILibraryEntity, TId>
  implements IPaginator<ILibraryEntity>
{
  private items: Array<TItem>;
  constructor() {
    this.items = [];
  }

  add(item: TItem): void {
    this.items.push(item);
  }

  removeById(id: TId): void {
    const itemToDelete = this.items.filter((x) => x.id === id)[0];
    if (!itemToDelete) {
      throw new Error('Item was not found');
    }
    this.items = this.items.filter((x) => x.id !== id);
  }

  find(id: TId): TItem | undefined {
    return this.items.filter((x) => x.id === id)[0];
  }

  getAll(): Array<TItem> {
    return this.items;
  }

  getPaginated(pageNumber: number, pageSize: number): ILibraryEntity[] {
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    return this.items.slice(start, end);
  }

  getCount(): number {
    return this.items.length;
  }
}
