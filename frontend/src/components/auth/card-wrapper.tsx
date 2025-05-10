"use client";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import BackButton from "./back-button";
import Header from "./header";

interface CardWrapperProps {
  children: React.ReactNode;
  headerTitle: string;
  backButtonLabel: string;
  backButtonHref: string;
  type: string;
}

export default function CardWrapper({
  children,
  headerTitle,
  backButtonLabel,
  backButtonHref,
  type,
}: CardWrapperProps) {
  return (
    <Card
      className={`${type === "login" ? "w-[400px]" : "w-[600px]"} shadow-md`}
    >
      <CardHeader>
        <Header title={headerTitle} />
      </CardHeader>
      <CardContent>{children}</CardContent>

      <CardFooter>
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  );
}
