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
  Card,
  CardContent,
  CardDescription,
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
        router.push("/login");
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-[400px] shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Kayıt Ol
          </CardTitle>
          <CardDescription className="text-center">
            Diş üniti rezervasyon sistemi için hesap oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="student_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Öğrenci Numarası</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Öğrenci numaranızı giriniz"
                        {...field}
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
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="E-posta adresinizi giriniz"
                        {...field}
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
                      <FormLabel>Ad</FormLabel>
                      <FormControl>
                        <Input placeholder="Adınız" {...field} />
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
                      <FormLabel>Soyad</FormLabel>
                      <FormControl>
                        <Input placeholder="Soyadınız" {...field} />
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
                    <FormLabel>Sınıf</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
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
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Şifrenizi giriniz"
                        {...field}
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
                    <FormLabel>Şifre Tekrar</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Şifrenizi tekrar giriniz"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="whitespace-pre-line">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={loading}
              >
                {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Giriş yapın
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
