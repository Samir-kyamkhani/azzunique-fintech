import LoginForm from "@/components/forms/LoginForm";

export const metadata = {
  title: "Login",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <LoginForm />
    </main>
  );
}
