export interface AuthResponse {
  access_token: string;
  user: {
    username: string;
    role: string;
    email: string;
  };
}