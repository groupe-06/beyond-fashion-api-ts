interface User {
    id: number;
    name: string;
    email: string;
  }

  interface CustomRequest extends Request {
    userId?: User;
  }
  