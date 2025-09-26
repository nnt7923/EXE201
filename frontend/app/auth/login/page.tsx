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
import { api, setAuthData } from "@/lib/api"; // Import the api client and setAuthData

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Login to get the token using the centralized API client
      const loginResponse = await api.login(email, password);
      const token = (loginResponse as any).token;

      if (token) {
        // Step 2: Set token in local storage temporarily so the next API call is authenticated
        localStorage.setItem("token", token);

        // Step 3: Fetch the user data using the new token
        const userResponse = await api.getCurrentUser();
        const user = (userResponse as any).data; // The user object is nested in the 'data' property

        // Step 4: Store both token and user data properly using the utility function
        setAuthData(token, user);
        
        // Step 5: Redirect to home page and reload to update header state and other parts of the app
        window.location.href = "/";
      } else {
        setError("Đăng nhập thất bại: Không nhận được token.");
      }
    } catch (error: any) {
      console.error("Login page error:", error);
      setError(error.message || "Email hoặc mật khẩu không hợp lệ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url(/vietnamese-bun-bo-hue-restaurant.png)",
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
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>Chào mừng trở lại! Hãy truy cập tài khoản của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
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
                  placeholder="Mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-red-500 text-sm pt-2">{error}</p>}
            </div>
            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chưa có tài khoản?&nbsp;
            <Link
              href="/auth/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Đăng ký
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
