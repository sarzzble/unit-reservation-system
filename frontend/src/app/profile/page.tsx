"use client";

import { useState, useEffect } from "react";
import { updateUser, getUserInfo, changePassword } from "@/lib/api";
import { AxiosError } from "axios";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaGraduationCap,
  FaLock,
} from "react-icons/fa";
import { EmailSchema, PasswordSchema } from "@/schemas";
import { User } from "@/interfaces";

type EmailFormData = z.infer<typeof EmailSchema>;
type PasswordFormData = z.infer<typeof PasswordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password2: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserInfo();
        setUser(userData);
        emailForm.reset({
          email: userData.email,
        });
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 401) {
          // Token geçersiz veya süresi dolmuş
          router.push("/login");
        } else {
          setError("Kullanıcı bilgileri yüklenirken bir hata oluştu");
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserData();
  }, [emailForm, router]);

  const onSubmit = async (data: EmailFormData) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await updateUser({ email: data.email });
      setSuccess("E-posta adresiniz başarıyla güncellendi.");

      // Güncel kullanıcı bilgilerini backend'den tekrar çek
      const updatedUserData = await getUserInfo();
      setUser(updatedUserData);
    } catch (err) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.email?.[0] ||
          err.response?.data?.detail ||
          err.response?.data?.error ||
          "E-posta adresi güncellenirken bir hata oluştu";
        setError(errorMessage);
      } else {
        setError("E-posta adresi güncellenirken bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);

    try {
      await changePassword(data);
      setPasswordSuccess("Şifreniz başarıyla değiştirildi.");
      passwordForm.reset();
    } catch (err) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Şifre değiştirilirken bir hata oluştu";
        setPasswordError(errorMessage);
      } else {
        setPasswordError("Şifre değiştirilirken bir hata oluştu");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center text-gray-600">Yükleniyor...</div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center text-red-600">
              Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapın.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold sm:text-4xl text-green-700">
              Profil Bilgilerim
            </h2>
            <p className="mt-3 text-xl text-gray-600">
              Kişisel bilgilerinizi görüntüleyin ve güncelleyin
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <FaIdCard className="w-5 h-5" />
                <span className="font-medium">Öğrenci Numarası:</span>
                <span>{user.student_number}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <FaUser className="w-5 h-5" />
                <span className="font-medium">Ad:</span>
                <span>{user.name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <FaUser className="w-5 h-5" />
                <span className="font-medium">Soyad:</span>
                <span>{user.surname}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <FaGraduationCap className="w-5 h-5" />
                <span className="font-medium">Sınıf:</span>
                <span>{user.student_class}. Sınıf</span>
              </div>
            </div>

            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FaEnvelope className="w-4 h-4" />
                        E-posta
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                >
                  {loading ? "Güncelleniyor..." : "E-posta Adresini Güncelle"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-green-700">
                Şifre Değiştir
              </h3>
              <p className="mt-2 text-gray-600">
                Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin
              </p>
            </div>

            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={passwordForm.control}
                  name="current_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FaLock className="w-4 h-4" />
                        Mevcut Şifre
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="********"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FaLock className="w-4 h-4" />
                        Yeni Şifre
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="********"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="new_password2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FaLock className="w-4 h-4" />
                        Yeni Şifre (Tekrar)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="********"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {passwordError && (
                  <Alert variant="destructive">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{passwordSuccess}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                >
                  {passwordLoading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
