import { describe } from 'mocha';
import { Library } from '../src/library';
import { IShelfPlaceable, Book } from '../src/models';
import * as assert from 'assert';

describe('adding new book tests', () => {
  it('adding new book', () => {
    const library = new Library<IShelfPlaceable, number>();
    const book = new Book();
    library.add(book);
    const addedBook = library.find(book.id);
    assert.notEqual(addedBook, undefined);
  });

  it('removing new book', () => {
    const library = new Library<IShelfPlaceable, number>();
    const book = new Book();
    library.add(book);
    library.removeById(book.id);
    const addedBook = library.find(book.id);
    assert.equal(addedBook, undefined);
  });

  it('return book', () => {
    const library = new Library<IShelfPlaceable, number>();
    const book = new Book();
    library.add(book);
    const addedBook = library.find(book.id);
    assert.equal(addedBook, book);
  });

  it('return undefined', () => {
    const library = new Library<IShelfPlaceable, number>();
    const addedBook = library.find(new Date().getTime());
    assert.equal(addedBook, undefined);
  });

  it('return all books', () => {
    const library = new Library<IShelfPlaceable, number>();
    const books = [new Book(), new Book(), new Book(), new Book()];
    books.forEach((b) => library.add(b));
    const storedBooks = library.getAll();
    assert.deepEqual(storedBooks, books);
  });

  it('return all books in page', () => {
    const pageNumber = 1;
    const pageSize = 3;
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    const library = new Library<IShelfPlaceable, number>();
    const books = [new Book(), new Book(), new Book(), new Book()];
    books.forEach((b) => library.add(b));
    const paginatedBooks = library.getPaginated(pageNumber, pageSize);
    const localPaginated = books.slice(start, end);
    assert.deepEqual(paginatedBooks, localPaginated);
  });

  it('return books quantity', () => {
    const library = new Library<IShelfPlaceable, number>();
    const books = [new Book(), new Book(), new Book(), new Book()];
    books.forEach((b) => library.add(b));
    const totalCount = library.getCount();
    assert.equal(totalCount, books.length);
  });

  it('return 0', () => {
    const library = new Library<IShelfPlaceable, number>();
    const totalCount = library.getCount();
    assert.equal(totalCount, 0);
  });
});
