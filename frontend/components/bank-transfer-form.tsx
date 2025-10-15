'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CreditCard, Calendar, User, Building, FileText, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Plan {
  _id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

interface BankTransferFormProps {
  plan: Plan;
  onSuccess: () => void;
}

export default function BankTransferForm({ plan, onSuccess }: BankTransferFormProps) {
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    transferAmount: plan.price,
    transferDate: '',
    transferNote: '',
    transferReference: ''
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng chọn file ảnh (JPG, PNG, WEBP)',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Lỗi',
          description: 'Kích thước file không được vượt quá 5MB',
          variant: 'destructive'
        });
        return;
      }

      setProofFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.bankName || !formData.accountNumber || !formData.accountHolder || 
        !formData.transferDate || !proofFile) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin và tải lên ảnh chứng minh',
        variant: 'destructive'
      });
      return;
    }

    // Validate transfer amount
    if (formData.transferAmount < plan.price) {
      toast({
        title: 'Lỗi',
        description: `Số tiền chuyển phải ít nhất ${plan.price.toLocaleString('vi-VN')} VND`,
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('subscriptionPlanId', plan._id);
      submitData.append('bankName', formData.bankName);
      submitData.append('accountNumber', formData.accountNumber);
      submitData.append('accountHolder', formData.accountHolder);
      submitData.append('transferAmount', formData.transferAmount.toString());
      submitData.append('transferDate', formData.transferDate);
      submitData.append('transferNote', formData.transferNote);
      submitData.append('transferReference', formData.transferReference);
      submitData.append('proofOfPayment', proofFile);

      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: 'Thành công!',
          description: 'Thông tin thanh toán đã được gửi. Vui lòng chờ admin xác nhận.',
        });
        onSuccess();
      } else {
        toast({
          title: 'Lỗi',
          description: result.message || 'Không thể gửi thông tin thanh toán',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Submit payment error:', error);
      toast({
        title: 'Lỗi',
        description: 'Lỗi kết nối server. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Thông tin chuyển khoản
        </CardTitle>
        <CardDescription>
          Vui lòng điền thông tin chuyển khoản và tải lên ảnh chứng minh thanh toán
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Building className="h-4 w-4" />
          <AlertDescription>
            <strong>Thông tin tài khoản nhận:</strong><br />
            Ngân hàng: Vietcombank<br />
            Số tài khoản: 1234567890<br />
            Chủ tài khoản: CÔNG TY TNHH AN GI Ở ĐÂU<br />
            Nội dung: {plan.name} - [Tên của bạn]
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Ngân hàng chuyển *</Label>
              <Input
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                placeholder="VD: Vietcombank, BIDV, Techcombank..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Số tài khoản *</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Số tài khoản của bạn"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolder">Chủ tài khoản *</Label>
            <Input
              id="accountHolder"
              name="accountHolder"
              value={formData.accountHolder}
              onChange={handleInputChange}
              placeholder="Tên chủ tài khoản (như trên thẻ ngân hàng)"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transferAmount">Số tiền chuyển *</Label>
              <Input
                id="transferAmount"
                name="transferAmount"
                type="number"
                value={formData.transferAmount}
                onChange={handleInputChange}
                min={plan.price}
                required
              />
              <p className="text-sm text-muted-foreground">
                Tối thiểu: {formatCurrency(plan.price)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferDate">Ngày chuyển *</Label>
              <Input
                id="transferDate"
                name="transferDate"
                type="datetime-local"
                value={formData.transferDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transferNote">Nội dung chuyển khoản</Label>
            <Input
              id="transferNote"
              name="transferNote"
              value={formData.transferNote}
              onChange={handleInputChange}
              placeholder={`${plan.name} - ${formData.accountHolder || '[Tên của bạn]'}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transferReference">Mã tham chiếu (nếu có)</Label>
            <Input
              id="transferReference"
              name="transferReference"
              value={formData.transferReference}
              onChange={handleInputChange}
              placeholder="Mã giao dịch từ ngân hàng"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proofOfPayment">Ảnh chứng minh thanh toán *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Proof of payment preview" 
                    className="max-w-full h-48 object-contain mx-auto rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setProofFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Thay đổi ảnh
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <Label htmlFor="proofOfPayment" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Chọn ảnh</span>
                      <span className="text-gray-500"> hoặc kéo thả vào đây</span>
                    </Label>
                    <Input
                      id="proofOfPayment"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Hỗ trợ: JPG, PNG, WEBP (tối đa 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Lưu ý:</strong> Sau khi gửi thông tin, bạn cần chờ admin xác nhận thanh toán. 
              Quá trình này thường mất 1-24 giờ trong giờ làm việc. 
              Bạn sẽ nhận được thông báo khi thanh toán được xác nhận.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Gửi thông tin thanh toán
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}