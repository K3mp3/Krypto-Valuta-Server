export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    switch (statusCode) {
      case 400:
        this.status = "Bad Request, information is missing";
        break;
      case 401:
        this.status = "Unauthorized, you have to be signed in for that";
        break;
      case 403:
        this.status = "Unauthorized, you don't have access ";
        break;
      case 404:
        this.status = "Not Found, could not found the requested resource";
        break;
      case 405:
        this.status = "Method not allowed";
        break;
      case 415:
        this.status = "Media type not supported";
        break;
      case statusCode.toString().startsWith("5"):
        this.status = "Internal Server Error";
        break;
      default:
        this.status = "Something went wrong";
    }

    Error.captureStackTrace(this, this.constructor);
  }
}
