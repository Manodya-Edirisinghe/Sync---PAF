import { DemoPage } from "@/components/ui/login-page";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  return <DemoPage onLoginSuccess={onLoginSuccess} />;
}
