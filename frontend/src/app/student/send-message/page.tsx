"use client";
import { useEffect, useState } from "react";
import { getTeachers, sendMessage } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentNavbar } from "@/components/Navbar";
import { Teacher } from "@/interfaces";
import { Textarea } from "@/components/ui/textarea";
import { SendMessageSchema } from "@/schemas";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

export default function StudentSendMessagePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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

  const router = useRouter();

  useEffect(() => {
    getTeachers().then(setTeachers);
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
      <StudentNavbar />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-green-100">
        <div className="max-w-xl mx-auto mb-6 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="text-green-700 border-green-200 hover:bg-green-50 cursor-pointer"
            onClick={() => router.push("/student/messages")}
          >
            Gelen Mesajlar
          </Button>
        </div>
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-green-700">
            Öğretmene Mesaj Gönder
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Select
                name="recipient"
                onValueChange={handleRecipientChange}
                value={watch("recipient") || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Öğretmen seçin" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.first_name} {t.last_name} ({t.student_number})
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
              className="bg-green-600 text-white hover:bg-green-700 cursor-pointer"
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
