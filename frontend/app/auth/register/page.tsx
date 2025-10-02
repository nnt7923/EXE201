'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Home } from "lucide-react";
import { api, setAuthData } from "@/lib/api"; // Import api client and setAuthData

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
    }

    setIsLoading(true);
    try {
      const response = await api.register({ name, email, password });

      if (response.success && response.data) {
        // Automatically log the user in upon successful registration
        setAuthData(response.data.token, response.data.user);
        // Redirect to home page, now logged in
        window.location.href = "/";
      } else {
        setError(response.message || "Đăng ký thất bại.");
      }
    } catch (error: any) {
      console.error("Register page error:", error);
      setError(error.message || "Email này có thể đã được sử dụng.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url(/delicious-bun-cha-vietnamese-food.png)",
      }}
    >
      <Link href="/" className="absolute top-4 left-4">
        <Button variant="ghost">
          <Home className="mr-2" />
          Quay về trang chủ
        </Button>
      </Link>
      <Card className="w-full max-w-md bg-white/90 dark:bg-black/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Đăng ký</CardTitle>
          <CardDescription>Tạo tài khoản mới để bắt đầu.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Tên của bạn</Label>
                <Input
                  id="name"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu (ít nhất 6 ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-red-500 text-sm pt-2">{error}</p>}
            </div>
            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Đã có tài khoản?&nbsp;
            <Link
              href="/auth/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
