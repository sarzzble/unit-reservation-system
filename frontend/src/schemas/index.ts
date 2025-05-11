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
