import { LoginModel } from "../types/login-model";
import { RegisterModel } from "../types/register-model";
import { User } from "../types/user";

export async function register(
  registerModel: RegisterModel
): Promise<User | { message: string }> {
  const response = await fetch("http://127.0.0.1:8000/api/register/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerModel),
  });
  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.non_field_errors?.[0] || "Kayıt başarısız oldu";
    return { message: errorMessage };
  }

  return data;
}

export async function login(
  loginModel: LoginModel
): Promise<User | { message: string }> {
  const response = await fetch("http://127.0.0.1:8000/api/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginModel),
  });
  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.non_field_errors?.[0] || "Giriş başarısız oldu";
    return { message: errorMessage };
  }

  return data;
}
