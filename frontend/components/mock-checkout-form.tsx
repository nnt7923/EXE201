'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MockCheckoutFormProps {
  onSuccess: () => void;
}

export function MockCheckoutForm({ onSuccess }: MockCheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMockPayment = () => {
    setIsProcessing(true);
    toast.info('Đang xử lý thanh toán giả lập...');

    setTimeout(() => {
      // Simulate a successful payment
      setIsProcessing(false);
      toast.success('Thanh toán giả lập thành công!');
      onSuccess();
    }, 2500); // Simulate a 2.5-second delay
  };

  return (
    <div className="space-y-6 text-center">
        <p className="text-sm text-muted-foreground">
            Đây là màn hình thanh toán giả lập cho mục đích demo.
            Nhấn nút bên dưới để mô phỏng một giao dịch thành công.
        </p>
        <Button
            disabled={isProcessing}
            className="w-full text-lg py-6"
            onClick={handleMockPayment}
        >
            {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
                'Xác nhận thanh toán (Giả lập)'
            )}
        </Button>
    </div>
  );
}
