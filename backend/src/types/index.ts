declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        is_verified: boolean;
      }
    }
  }
}

export interface RegisterBody {
    username: string;
    email: string;
    last_name: string;
    first_name: string;
    password: string;
}

export interface UserRow {
    id: number,
    username: string,
    email: string
}

export interface VerifyEmailParams {
  token: string;
}

export interface LoginBody {
    username: string;
    password: string;
}

export interface TokenPayload {
    id: number,
    username: string,
    is_verified: boolean,
}