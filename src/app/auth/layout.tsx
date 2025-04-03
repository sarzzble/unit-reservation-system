export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-10/12 flex items-center justify-center">{children}</div>
  );
}
