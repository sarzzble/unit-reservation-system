"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FaChalkboardTeacher, FaLock } from "react-icons/fa";
import { AxiosError } from "axios";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { login } from "@/lib/api";
import { setCookie } from "@/lib/auth";
import { LoginSchema } from "@/schemas";

function TeacherLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      student_number: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setLoading(true);

    try {
      const response = await login(values.student_number, values.password, true); // is_staff true olarak gönderiliyor

      // Token'ları cookie'ye kaydet
      setCookie("access_token", response.access, 1);
      setCookie("refresh_token", response.refresh, 7);
      setCookie("user", JSON.stringify(response.user), 1);

      // Eğer yönlendirilecek sayfa varsa oraya, yoksa teacher/units sayfasına git
      const from = searchParams.get("from") || "/teacher/units";
      router.push(from);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.error ||
          "Giriş yapılırken bir hata oluştu";
        setError(errorMessage);
      } else {
        setError("Giriş yapılırken bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 grid grid-cols-12 gap-4 p-4">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <FaChalkboardTeacher className="w-6 h-6 text-blue-600" />
            </div>
          ))}
        </div>
      </div>

      <Card className="w-[400px] shadow-xl border-0 bg-white/90 backdrop-blur-sm relative z-10">
        <CardHeader>
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <Image
                src="/images/unit-reservation-system-logo.png"
                alt="Ünit Rezervasyon Sistemi Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold text-gray-800">
              Diş Üniti Rezervasyon Sistemi Öğretmen Girişi
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="student_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <FaChalkboardTeacher className="w-4 h-4" />
                      Sicil Numarası
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Sicil numaranızı girin"
                        type="text"
                        disabled={loading}
                        autoComplete="off"
                        className="focus:ring-2 focus:ring-blue-500 max-md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <FaLock className="w-4 h-4" />
                      Şifre
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="********"
                        type="password"
                        disabled={loading}
                        autoComplete="current-password"
                        className="focus:ring-2 focus:ring-blue-500 max-md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <Alert
                  variant="destructive"
                  className="bg-red-50 border-red-200"
                >
                  <AlertDescription className="text-red-600 whitespace-pre-line">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-6">
          <div className="text-sm text-center text-gray-600">
            <Link
              href="/"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Ana sayfaya dön
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function TeacherLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Yükleniyor...</div>
        </div>
      }
    >
      <TeacherLoginForm />
    </Suspense>
  );
} 