// Cookie yönetimi için yardımcı fonksiyonlar
export const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === "undefined") return; // SSR koruması
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${
    process.env.NODE_ENV === "production" ? ";Secure" : ""
  }`;
};

export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return; // SSR koruması
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict${
    process.env.NODE_ENV === "production" ? ";Secure" : ""
  }`;
};

export const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined; // SSR koruması
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return undefined;
};

export const logout = () => {
  deleteCookie("access_token");
  deleteCookie("refresh_token");
  deleteCookie("user");
  localStorage.removeItem("user");
};
