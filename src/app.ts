import {Pagination, Services, UserService} from "./services";

class App {
    private readonly libraryService: Services;
    private readonly userService: UserService;
    private libraryPagination: Pagination;
    private usersPagination: Pagination;
    private readonly messageModalButton: HTMLButtonElement;
    private readonly messageModalBody: HTMLElement;
    private readonly messageModalLabel: HTMLHeadingElement;

    constructor() {
        this.userService = new UserService();
        this.libraryService = new Services(this.userService);
        this.createNewUserForm();
        this.createNewBookForm();
        this.createBorrowBookModal();
        this.createReturnBookModal();
        this.createDeleteBookModal();
        this.createDeleteUserModal();
        this.createSearchForm();
        this.libraryPagination = new Pagination("books-navigation", "books-list", this.libraryService);
        this.usersPagination = new Pagination("users-navigation", "users-list", this.userService);
        this.messageModalButton = document.getElementById('message-modal-button') as HTMLButtonElement;
        this.messageModalBody = <HTMLElement>document.getElementById('message-modal-body');
        this.messageModalLabel = <HTMLHeadingElement>document.getElementById('messageModalLabel');
        this.libraryPagination.goToPage(1);
        this.usersPagination.goToPage(1);
    }

    private createNewUserForm() {
        const userCreationForm = <HTMLFormElement>document.getElementById("create-user-form");
        if (!userCreationForm) return;

        userCreationForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const handleUserCreation = () => {
                const usernameInput = document.getElementById("username") as HTMLInputElement;
                const emailInput = document.getElementById("email") as HTMLInputElement;

                const username = usernameInput.value;
                const email = emailInput.value;

                this.userService.add(username, email);
            };

            try {
                handleUserCreation();
                userCreationForm.reset();
                this.usersPagination.goToPage(1);
            } catch (err) {
                console.log(err);
            }
        })
    }

    private createNewBookForm() {
        const bookCreationForm = <HTMLFormElement>document.getElementById("create-book-form");
        if (!bookCreationForm) return;
        bookCreationForm.addEventListener("submit", event => {
            event.preventDefault();
            const handleBookCreation = () => {
                const bookName = (document.getElementById("bookName") as HTMLInputElement).value;
                const author = (document.getElementById("author") as HTMLInputElement).value;
                const releaseYear = parseInt((document.getElementById("releaseYear") as HTMLInputElement).value);
                this.libraryService.addBook(bookName, author, releaseYear);
            };

            try {
                handleBookCreation();
                bookCreationForm.reset();
                this.libraryPagination.goToPage(1);
            } catch (err) {
                console.log(err);
            }
        });
    }

    private createBorrowBookModal() {
        const borrowBookForm = (document.getElementById('borrow-book-form') as HTMLFormElement);
        borrowBookForm.addEventListener('submit', event => {
            event.preventDefault();

            const borrowBook = () => {
                const userId = parseInt((document.getElementById('borrow-user-id') as HTMLInputElement).value);
                const bookId = parseInt((document.getElementById('borrow-book-id') as HTMLInputElement).value);
                this.libraryService.borrowBook(userId, bookId);

                const book = this.libraryService.getById(bookId);
                if(!book) throw new Error("Помилка");
                const user = this.userService.getById(userId);
                if(!user) throw new Error("Помилка");
                this.showNotification('Книгу успішно позичено',`\'${book.getFullName()}\' було позичено користувачем ${user.represent()}`);
            }

            try {
                borrowBook();
                borrowBookForm.reset();
                this.libraryPagination.goToPage(1);
            } catch (err) {
                alert(err)
            }
        });
    }

    private createReturnBookModal() {
        const returnBookForm = (document.getElementById('return-book-form') as HTMLFormElement);
        returnBookForm.addEventListener('submit', event => {
            event.preventDefault();

            const handleReturnBookProcess = () => {
                const userId = parseInt((document.getElementById('return-user-id') as HTMLInputElement).value);
                const bookId = parseInt((document.getElementById('return-book-id') as HTMLInputElement).value);

                this.libraryService.returnBook(userId, bookId);
                const book = this.libraryService.getById(bookId);
                if(!book) throw new Error("Помилка");
                this.showNotification('Книгу повернено',`\'${book.getFullName()}\' було успішно повернено.`);
            };

            try {
                handleReturnBookProcess();
                returnBookForm.reset();
                this.libraryPagination.goToPage(1);
            } catch (err) {
                alert(err);
            }
        })
    }

    private showNotification(title: string, description: string) {
        this.messageModalLabel.innerText = title;
        this.messageModalBody.innerText = description;
        this.messageModalButton.click();
    }

    private createSearchForm() {
        const searchForm = <HTMLFormElement>document.getElementById('search-form');
        searchForm.addEventListener('reset', event => {
           event.preventDefault();

           searchForm.reset();

           this.libraryService.searchBook('', '');
           this.libraryPagination.goToPage(1);
        });

        searchForm.addEventListener('submit', event => {
            event.preventDefault();

            const searchBook = () => {
                const searchQuery = (document.getElementById('search-book') as HTMLInputElement).value;
                const optionsSelect = document.getElementById('search-book-option') as HTMLSelectElement;
                const searchOption = optionsSelect.value;

                console.log("Search options");
                console.log(searchOption);
                console.log("Search query")
                console.log(searchQuery)
                this.libraryService.searchBook(searchQuery, searchOption);
                this.libraryPagination.goToPage(1);
            };

            try{
                searchBook();
            } catch (err){
                alert(err);
            }
        })
    }
    private createDeleteBookModal() {
        const deleteBookForm = <HTMLFormElement>document.getElementById('delete-book-form');
        deleteBookForm.addEventListener('submit', event => {
            event.preventDefault();
            const deleteBook = () => {
                const bookId = parseInt((<HTMLInputElement>document.getElementById('delete-book-id')).value);

                this.libraryService.removeBook(bookId);
            };
            try{
                deleteBook();
                deleteBookForm.reset();
                this.libraryPagination.goToPage(1);
                this.showNotification("Книгу видалено", "Книгу було успішно видалено");
            } catch (err){
                this.showNotification("Виникла помилка", <string>err);
            }
        })
    }

    private createDeleteUserModal() {
        const deleteUserForm = <HTMLFormElement>document.getElementById('delete-user-form');
        deleteUserForm.addEventListener('submit', event => {
            event.preventDefault();

            const deleteUser = () => {
                const userId = parseInt((<HTMLInputElement>document.getElementById('delete-user-id')).value);

                this.userService.removeById(userId);
            };
            try{
                deleteUser();
                deleteUserForm.reset();
                this.usersPagination.goToPage(1);
                this.showNotification("Користувача видалено", "Користувача було успішно видалено");
            } catch (err){
                this.showNotification("Виникла помилка", <string>err);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
