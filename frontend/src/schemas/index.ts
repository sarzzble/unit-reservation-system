import * as z from "zod";

export const LoginSchema = z.object({
  student_number: z
    .string()
    .min(12, { message: "Öğrenci numarasının uzunluğu 12'den az olamaz" })
    .max(12, { message: "Öğrenci numarasının uzunluğu 12'den fazla olamaz" })
    .regex(/^\d+$/, {
      message: "Öğrenci numarası sadece rakamlardan oluşmalıdır",
    }),
  password: z
    .string()
    .min(6, { message: "Şifre uzunluğu 6'dan az olamaz" })
    .max(50, { message: "Şifre çok uzun" }),
});

export const RegisterSchema = z
  .object({
    student_number: z
      .string()
      .min(12, { message: "Öğrenci numarasının uzunluğu 12'den az olamaz" })
      .max(12, { message: "Öğrenci numarasının uzunluğu 12'den fazla olamaz" })
      .regex(/^\d+$/, {
        message: "Öğrenci numarası sadece rakamlardan oluşmalıdır",
      }),
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    first_name: z
      .string()
      .min(1, "Ad zorunludur")
      .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, {
        message: "Ad sadece harflerden oluşmalıdır",
      }),
    last_name: z
      .string()
      .min(1, "Soyad zorunludur")
      .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, {
        message: "Soyad sadece harflerden oluşmalıdır",
      }),
    student_class: z.string().min(1, "Sınıf zorunludur"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    password2: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  })
  .refine((data) => data.password === data.password2, {
    message: "Şifreler eşleşmiyor",
    path: ["password2"],
  });

export const EmailSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
});

export const PasswordSchema = z
  .object({
    current_password: z.string().min(1, "Mevcut şifre zorunludur"),
    new_password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    new_password2: z.string().min(1, "Şifre tekrarı zorunludur"),
  })
  .refine((data) => data.new_password === data.new_password2, {
    message: "Şifreler eşleşmiyor",
    path: ["new_password2"],
  });

export const SendMessageSchema = z.object({
  recipient: z
    .string({ required_error: "Alıcı zorunludur" })
    .min(1, { message: "Alıcı seçilmelidir" }),
  title: z
    .string({ required_error: "Konu zorunludur" })
    .min(1, { message: "Konu zorunludur" })
    .max(100, { message: "Konu en fazla 100 karakter olabilir" }),
  content: z
    .string({ required_error: "Mesaj zorunludur" })
    .min(1, { message: "Mesaj zorunludur" })
    .max(500, { message: "Mesaj en fazla 500 karakter olabilir" }),
});
