"use client";

import { useEffect, useState } from "react";
import { getStudents, sendMessage } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeacherNavbar } from "@/components/Navbar";
import { Student } from "@/interfaces";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendMessageSchema } from "@/schemas";
import { z } from "zod";
import { useRouter } from "next/navigation";

export default function TeacherSendMessagePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof SendMessageSchema>>({
    resolver: zodResolver(SendMessageSchema),
    defaultValues: { recipient: "", title: "", content: "" },
  });

  useEffect(() => {
    getStudents().then(setStudents);
  }, []);

  const handleRecipientChange = (val: string) => {
    setValue("recipient", val, { shouldValidate: true });
    trigger("recipient");
  };

  const onSubmit = async (data: z.infer<typeof SendMessageSchema>) => {
    setSuccess("");
    setError("");
    try {
      await sendMessage({
        recipient: Number(data.recipient),
        title: data.title,
        content: data.content,
      });
      setSuccess("Mesaj başarıyla gönderildi.");
      reset();
    } catch {
      setError("Mesaj gönderilemedi.");
    }
  };

  return (
    <>
      <TeacherNavbar />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-xl mx-auto mb-6 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer"
            onClick={() => router.push("/teacher/messages")}
          >
            Gelen Mesajlar
          </Button>
        </div>
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">
            Öğrenciye Mesaj Gönder
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Select
                name="recipient"
                onValueChange={handleRecipientChange}
                value={watch("recipient") || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Öğrenci seçin" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.first_name} {s.last_name} ({s.student_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.recipient && (
                <div className="text-red-600 text-xs mt-1 mb-0.5">
                  {errors.recipient.message}
                </div>
              )}
            </div>
            <div>
              <Input {...register("title")} placeholder="Konu" />
              {errors.title && (
                <div className="text-red-600 text-xs mt-1 mb-0.5">
                  {errors.title.message}
                </div>
              )}
            </div>
            <div>
              <Textarea
                {...register("content")}
                placeholder="Mesaj"
                maxLength={500}
                rows={5}
              />
              {errors.content && (
                <div className="text-red-600 text-xs mt-1 mb-0.5">
                  {errors.content.message}
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              Gönder
            </Button>
            {success && (
              <div className="text-green-600 mt-2 text-sm">{success}</div>
            )}
            {error && <div className="text-red-600 mt-2 text-sm">{error}</div>}
          </form>
        </div>
      </div>
    </>
  );
}
