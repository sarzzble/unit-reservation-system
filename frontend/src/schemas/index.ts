import * as z from "zod";

export const LoginSchema = z.object({
  student_number: z
    .string()
    .min(12, { message: "Öğrenci numarasının uzunluğu 12'den az olamaz" }),
  password: z.string().min(6, { message: "Şifre uzunluğu 6'dan az olamaz" }),
});

export const RegisterSchema = z.object({
  student_number: z
    .string()
    .min(12, { message: "Öğrenci numarasının uzunluğu 12 olmak zorunda" }),
  email: z.string().email({ message: "Email adresi zorunlu" }),
  first_name: z.string().min(1, { message: "Ad zorunlu" }),
  last_name: z.string().min(1, { message: "Soyad zorunlu" }),
  password: z.string().min(6, { message: "Şifre minimum 6 karakter olmalı" }),
  password2: z.string().min(6, { message: "Şifre minimum 6 karakter olmalı" }),
});
