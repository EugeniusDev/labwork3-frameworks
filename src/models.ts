export interface ILibraryEntity {
    readonly id: number;

    getId(): number;
    represent(): string;
}

export interface IShelfPlaceable extends ILibraryEntity {
    bookName: string;
    author: string;
    releaseYear: number;
    borrowed: boolean;
    borrowedBy?: string;

    getBookName(): string;
    getAuthor(): string;
    getReleaseYear(): number;
    getFullName(): string;
}
export class Book implements IShelfPlaceable {
    id: number;
    author: string;
    bookName: string;
    releaseYear: number;
    borrowed: boolean;
    borrowedBy?: string;

    constructor(author?: string, bookName?: string, releaseYear?: number) {
        this.author = author || '';
        this.bookName = bookName || '';
        this.releaseYear = releaseYear || 0;
        this.borrowed = false;
        this.id = new Date().getTime();
        this.borrowedBy = undefined;
    }

    getAuthor(): string {
        return this.author;
    }

    getBookName(): string {
        return this.bookName;
    }

    getReleaseYear(): number {
        return this.releaseYear;
    }

    getId(): number {
        return this.id;
    }

    represent(): string {
        const str = `ID: ${this.id} - ${this.bookName} by ${this.author} (${this.releaseYear}). ${this.borrowedBy ? ` Borrowed By: ${this.borrowedBy}` : ''}`;
        console.log(str);
        return str;
    }

    getFullName(): string {
        return `ID: ${this.id} - ${this.bookName} by ${this.author} (${this.releaseYear}).`;
    }
}

export interface IUser extends ILibraryEntity {
    borrowedBooks: IShelfPlaceable[];
    username: string;
    email: string;

    getUsername(): string;
    getEmail(): string;
    borrowBook(book: IShelfPlaceable): void;
    takeBookBack(bookId: number): void;
}

export class User implements IUser {
    email: string;
    id: number;
    username: string;
    borrowedBooks: IShelfPlaceable[];

    constructor(email?: string, username?: string) {
        this.email = email || '';
        this.username = username || '';
        this.id = new Date().getTime();
        this.borrowedBooks = [];
    }

    getEmail(): string {
        return this.email;
    }

    getId(): number {
        return this.id;
    }

    getUsername(): string {
        return this.username;
    }

    represent(): string {
        return `ID: ${this.id} - ${this.username} (${this.email})`;
    }

    borrowBook(book: IShelfPlaceable): void {
        this.borrowedBooks.push(book);
    }

    takeBookBack(bookId: number): void {
        const book = this.borrowedBooks.filter(x => x.id === bookId)[0];
        if (!book) {
            throw new Error("User does not have this book");
        }

        this.borrowedBooks = this.borrowedBooks.filter(x => x.id !== bookId);
    }
}