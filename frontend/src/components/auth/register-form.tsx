"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "../../schemas";
import CardWrapper from "./card-wrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FormError from "../form-error";
import { register } from "@/lib/api/auth";
import FormSuccess from "../form-success";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const router = useRouter();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      student_number: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      password2: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setIsPending(true);
    const result = await register(values);

    if ("message" in result) {
      setIsPending(false);
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage("Kayıt başarılı");
    setIsPending(false);
    setErrorMessage("");

    router.push("/auth/login");
  };

  return (
    <CardWrapper
      headerTitle="Öğrenci Kayıt"
      backButtonLabel="Zaten bir hesabım var."
      backButtonHref="/auth/login"
      type="register"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <div className="space-y-4">
            <div className="flex gap-8">
              <FormField
                control={form.control}
                name="student_number"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Öğrenci Numarası</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Öğrenci numaranızı girin"
                        type="text"
                        maxLength={12}
                        disabled={isPending}
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
                  <FormItem className="w-1/2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Email adresinizi girin"
                        type="email"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-8">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Ad</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Adınızı girin"
                        type="text"
                        disabled={isPending}
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
                  <FormItem className="w-1/2">
                    <FormLabel>Soyad</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Soyadınızı girin"
                        type="text"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-8">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="********"
                        type="password"
                        disabled={isPending}
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
                  <FormItem className="w-1/2">
                    <FormLabel>Şifre Tekrarı</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="********"
                        type="password"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {errorMessage && <FormError message={errorMessage} />}
          {successMessage && <FormSuccess message={successMessage} />}
          <Button
            type="submit"
            color="primary"
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer w-full"
            disabled={isPending}
          >
            Kayıt Ol
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
