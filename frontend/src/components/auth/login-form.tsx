"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../../schemas";
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
import { login } from "@/lib/api/auth";
import { useState } from "react";

export default function LoginForm() {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      student_number: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setIsPending(true);
    const result = await login(values);

    if ("message" in result) {
      setIsPending(false);
      setErrorMessage(result.message);
      return;
    }

    setIsPending(false);
    setErrorMessage("");
  };

  return (
    <CardWrapper
      headerTitle="Öğrenci Girişi"
      backButtonLabel="Üyeliğiniz yok mu?"
      backButtonHref="/auth/register"
      type="login"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="student_number"
              render={({ field }) => (
                <FormItem>
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="********"
                      type="password"
                      minLength={6}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full cursor-pointer"
            disabled={isPending}
          >
            Giriş Yap
          </Button>
          {errorMessage && <FormError message={errorMessage} />}
        </form>
      </Form>
    </CardWrapper>
  );
}
