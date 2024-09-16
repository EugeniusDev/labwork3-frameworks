import { Validation } from './validation';
import { Storage } from './storage';
import { Library } from './library';
import { Book, IUser, IShelfPlaceable, User, ILibraryEntity } from './models';

export interface IPaginator<TEntity extends ILibraryEntity> {
  getPaginated(pageNumber: number, pageSize: number): TEntity[];
  getCount(): number;
}

export class Pagination {
  private readonly paginationId: string;
  private readonly listId: string;
  private readonly itemsPerPage: number;
  private items: IPaginator<ILibraryEntity>;
  private currentPage: number;

  constructor(
    paginationId: string,
    listId: string,
    items: IPaginator<ILibraryEntity>,
    itemsPerPage: number = 3
  ) {
    this.currentPage = 1;
    this.paginationId = paginationId;
    this.listId = listId;
    this.items = items;
    this.itemsPerPage = itemsPerPage;
    this.attachListeners();
    this.renderPageNumbers();
  }

  getTotalPages(): number {
    return Math.ceil(this.items.getCount() / this.itemsPerPage);
  }

  goToPage(page: number): void {
    const totalPages = this.getTotalPages();
    console.log(totalPages);
    console.log(page);
    if (totalPages == 0) {
      this.clearPagination();
    }
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.updatePaginationUI();
    this.renderPageNumbers();
    this.renderItems();
  }

  renderPageNumbers(): void {
    const totalPages = this.getTotalPages();
    console.log(totalPages);
    const paginationContainer = document.getElementById(this.paginationId);

    if (!paginationContainer) return;
    Array.from(
      document.querySelectorAll(`.${this.paginationId}-page-number`)
    ).forEach((el) => el.remove());

    for (let i = 1; i <= totalPages; i++) {
      const pageItem = document.createElement('li');
      pageItem.classList.add('page-item', `${this.paginationId}-page-number`);
      if (i === this.currentPage) {
        pageItem.classList.add('active');
      }

      const pageLink = document.createElement('a');
      pageLink.classList.add('page-link');
      pageLink.href = '#';
      pageLink.textContent = i.toString();
      pageLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToPage(i);
      });

      pageItem.appendChild(pageLink);
      console.log(pageItem);
      paginationContainer.insertBefore(
        pageItem,
        document.getElementById(`${this.paginationId}-next-page`)
      );
    }

    this.updatePaginationUI();
  }

  attachListeners(): void {
    document
      .getElementById(`${this.paginationId}-prev-page`)
      ?.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToPage(this.currentPage - 1);
      });
    document
      .getElementById(`${this.paginationId}-next-page`)
      ?.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToPage(this.currentPage + 1);
      });
  }

  updatePaginationUI(): void {
    const totalPages = this.getTotalPages();
    document
      .getElementById(`${this.paginationId}-prev-page`)
      ?.parentElement?.classList.toggle('disabled', this.currentPage === 1);
    document
      .getElementById(`${this.paginationId}-next-page`)
      ?.parentElement?.classList.toggle(
        'disabled',
        this.currentPage === totalPages
      );
  }

  private renderItems() {
    const list = document.getElementById(this.listId);
    if (!list) return;
    list.innerHTML = '';
    const items = this.items.getPaginated(this.currentPage, this.itemsPerPage);
    for (let item of items) {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between';
      const text = document.createTextNode(item.represent());
      const p = document.createElement('p');
      p.className = 'mt-auto mb-auto';
      p.appendChild(text);
      li.appendChild(p);
      list.appendChild(li);
    }
  }

  private clearPagination() {
    const paginationContainer = document.getElementById(this.paginationId);

    if (!paginationContainer) return;
    Array.from(
      document.querySelectorAll(`.${this.paginationId}-page-number`)
    ).forEach((el) => el.remove());

    const list = document.getElementById(this.listId);
    if (!list) return;
    list.innerHTML = '';
  }
}

export class Services implements IPaginator<ILibraryEntity> {
  private readonly userService: UserService;
  private readonly validation: Validation;
  private readonly storageService: Storage;
  private readonly library: Library<IShelfPlaceable, number>;
  private readonly booksKey: string = 'libraryBooks';
  private readonly allBooks: IShelfPlaceable[];
  private queriedBooks: IShelfPlaceable[];
  constructor(userService: UserService) {
    this.userService = userService;
    this.validation = Validation.getInstance();
    this.library = new Library<IShelfPlaceable, number>();
    this.storageService = Storage.getInstance();
    this.loadFromStorage();
    this.allBooks = this.library.getAll();
    this.queriedBooks = this.allBooks;
  }

  addBook(bookName: string, author: string, releaseYear: number): void {
    if (!this.validation.isNewBookInputValid(bookName, author, releaseYear)) {
      throw new Error('Invalid data for book');
    }

    const book: Book = new Book(author, bookName, releaseYear);
    this.library.add(book);
    const books = this.library.getAll();
    this.storageService.save(this.booksKey, books);
  }

  removeBook(bookId: number): void {
    this.library.removeById(bookId);
    const books = this.library.getAll();
    this.storageService.save(this.booksKey, books);
  }

  getById(bookId: number): IShelfPlaceable | undefined {
    return this.library.find(bookId);
  }

  getPaginated(pageNumber: number, pageSize: number): ILibraryEntity[] {
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    const books = this.queriedBooks.slice(start, end);
    console.log('Queried books:');
    console.log(books);
    return books;
  }

  getCount(): number {
    return this.queriedBooks.length;
  }

  borrowBook(userId: number, bookId: number) {
    const user = this.userService.getById(userId);
    console.log('user found');
    if (!user) {
      throw new Error('User not found');
    }

    console.log('Borrowed count:');
    console.log(user.borrowedBooks.length);
    if (user.borrowedBooks.length >= 3) {
      throw new Error('User already has 3 books');
    }

    let book = this.library.find(bookId);
    console.log('book found');
    if (!book || book.borrowed) {
      throw new Error('Book not found or it was already taken by someone');
    }

    book.borrowed = true;
    book.borrowedBy = user.email;
    user.borrowBook(book);
    this.storageService.save(this.booksKey, this.library.getAll());
  }

  returnBook(userId: number, bookId: number) {
    const user = this.userService.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let book = this.library.find(bookId);
    if (!book) {
      throw new Error('Book not found or it was already taken by someone');
    }

    user.takeBookBack(bookId);
    book.borrowedBy = undefined;
    book.borrowed = false;
    this.storageService.save(this.booksKey, this.library.getAll());
  }

  searchBook(searchQuery: string, searchOption: string): void {
    if (searchQuery === '') {
      this.queriedBooks = this.allBooks;
      return;
    }
    switch (searchOption) {
      case 'name':
        this.queriedBooks = this.allBooks.filter((x) =>
          x.bookName.includes(searchQuery)
        );
        break;
      case 'author':
        this.queriedBooks = this.allBooks.filter((x) =>
          x.author.includes(searchQuery)
        );
        break;
      default:
        this.queriedBooks = this.allBooks;
        break;
    }
  }

  private loadFromStorage() {
    const books = this.storageService.get(this.booksKey) ?? [];
    for (let book of books) {
      const newBook = new Book();
      newBook.id = book.id;
      newBook.author = book.author;
      newBook.bookName = book.bookName;
      newBook.releaseYear = book.releaseYear;
      newBook.borrowed = book.borrowed;
      newBook.borrowedBy = book.borrowedBy;
      this.library.add(newBook);
    }
    console.log(this.library.getAll());
  }
}

export class UserService implements IPaginator<IUser> {
  private readonly usersKey = 'library-users';
  private readonly storage: Storage;
  private users: Array<IUser>;
  private readonly validation: Validation;
  constructor() {
    this.storage = Storage.getInstance();
    this.validation = Validation.getInstance();
    this.users = [];
    this.loadFromStorage();
  }

  add(username: string, email: string): void {
    if (!this.validation.isNewUserInputValid(username, email)) {
      throw new Error('Invalid data for user');
    }

    const user = new User(email, username);
    this.users.push(user);
    this.storage.save(this.usersKey, this.users);
  }

  removeById(userId: number): void {
    this.users = this.users.filter((x) => x.id !== userId);
    this.storage.save(this.usersKey, this.users);
  }

  getById(userId: number): IUser | undefined {
    return this.users.filter((x) => x.id === userId)[0];
  }

  getPaginated(pageNumber: number, pageSize: number): IUser[] {
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    return this.users.slice(start, end);
  }

  getCount(): number {
    return this.users.length;
  }

  private loadFromStorage() {
    const users = this.storage.get(this.usersKey);

    for (let user of users) {
      const newUser = new User();
      newUser.email = user.email;
      newUser.id = user.id;
      newUser.username = user.username;
      const newBooks: IShelfPlaceable[] = [];
      const books = user.borrowedBooks;
      for (let book of books) {
        const newBook = new Book();
        newBook.id = book.id;
        newBook.author = book.author;
        newBook.bookName = book.bookName;
        newBook.releaseYear = book.releaseYear;
        newBook.borrowed = book.borrowed;
        newBook.borrowedBy = book.borrowedBy;
        newBooks.push(newBook);
      }
      newUser.borrowedBooks = newBooks;
      this.users.push(newUser);
    }
  }
}
