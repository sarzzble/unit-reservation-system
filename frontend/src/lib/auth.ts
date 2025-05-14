// Cookie yönetimi için yardımcı fonksiyonlar
export const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${
    process.env.NODE_ENV === "production" ? ";Secure" : ""
  }`;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict${
    process.env.NODE_ENV === "production" ? ";Secure" : ""
  }`;
};

export const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return undefined;
};

export const logout = () => {
  // Token'ları sil
  deleteCookie("access_token");
  deleteCookie("refresh_token");

  // Kullanıcı bilgilerini temizle
  localStorage.removeItem("user");

  // Login sayfasına yönlendir (parametresiz)
  window.location.href = "/login";
};
