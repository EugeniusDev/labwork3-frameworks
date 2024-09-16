export class Validation {
  private static instance: Validation;

  private constructor() {}
  private readonly emailRegExp: RegExp = new RegExp(
    '^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
  );
  private readonly yearRegExp: RegExp = new RegExp('^(0|[1-9][0-9]{0,3})$');
  isNewBookInputValid(
    bookName: string,
    author: string,
    releaseYear: number
  ): boolean {
    if (!bookName || !author || !releaseYear) {
      return false;
    }
    return this.yearRegExp.test(releaseYear.toString());
  }

  isNewUserInputValid(username: string, email: string): boolean {
    if (!username || !email) {
      return false;
    }
    return this.emailRegExp.test(email);
  }

  static getInstance() {
    if (!Validation.instance) {
      Validation.instance = new Validation();
    }
    return Validation.instance;
  }
}
