"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { AxiosError } from "axios";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/schemas";
import {
  FaUserGraduate,
  FaLock,
  FaTooth,
  FaEnvelope,
  FaUser,
  FaIdCard,
} from "react-icons/fa";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RegisterFormData = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      student_number: "",
      email: "",
      first_name: "",
      last_name: "",
      student_class: "",
      password: "",
      password2: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      await register(data);
      setIsSuccess(true);
      // 3 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        router.push("/student/login");
      }, 3000);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data;
        if (errorData.details && Array.isArray(errorData.details)) {
          // Her hata mesajının başına nokta ekle ve alt alta göster
          const formattedErrors = errorData.details
            .map((error: string) => `• ${error}`)
            .join("\n");
          setError(formattedErrors);
        } else if (errorData.error) {
          setError(`• ${errorData.error}`);
        } else {
          setError("• Kayıt işlemi sırasında bir hata oluştu");
        }
      } else {
        setError("• Beklenmeyen bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern with Teeth */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 grid grid-cols-12 gap-4 p-4">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                <FaTooth className="w-6 h-6 text-gray-600" />
              </div>
            ))}
          </div>
        </div>

        <Card className="w-[400px] shadow-xl border-0 bg-white/90 backdrop-blur-sm relative z-10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Kayıt Başarılı!
              </h2>
              <p className="text-gray-600">
                Hesabınız başarıyla oluşturuldu. Giriş sayfasına
                yönlendiriliyorsunuz...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-green-600 h-2 rounded-full animate-[loading_3s_ease-in-out]"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern with Teeth */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 grid grid-cols-12 gap-4 p-4">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <FaTooth className="w-6 h-6 text-gray-600" />
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
              Diş Üniti Rezervasyon Sistemi Kayıt
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
                      <FaUserGraduate className="w-4 h-4" />
                      Öğrenci Numarası
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Öğrenci numaranızı giriniz"
                        {...field}
                        className="focus:ring-2 focus:ring-green-500 max-md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <FaEnvelope className="w-4 h-4" />
                      E-posta
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="E-posta adresinizi giriniz"
                        {...field}
                        className="focus:ring-2 focus:ring-green-500 max-md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700">
                        <FaUser className="w-4 h-4" />
                        Ad
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Adınız"
                          {...field}
                          className="focus:ring-2 focus:ring-green-500 max-md:text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700">
                        <FaUser className="w-4 h-4" />
                        Soyad
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Soyadınız"
                          {...field}
                          className="focus:ring-2 focus:ring-green-500 max-md:text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="student_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <FaIdCard className="w-4 h-4" />
                      Sınıf
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full focus:ring-2 focus:ring-green-500">
                          <SelectValue placeholder="Sınıf seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="4">4. Sınıf</SelectItem>
                        <SelectItem value="5">5. Sınıf</SelectItem>
                      </SelectContent>
                    </Select>
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
                        type="password"
                        placeholder="Şifrenizi giriniz"
                        {...field}
                        className="focus:ring-2 focus:ring-green-500 max-md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <FaLock className="w-4 h-4" />
                      Şifre Tekrar
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Şifrenizi tekrar giriniz"
                        {...field}
                        className="focus:ring-2 focus:ring-green-500 max-md:text-sm"
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
                className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-6">
          <div className="text-sm text-center text-gray-600">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/student/login"
              className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
            >
              Giriş yapın
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
