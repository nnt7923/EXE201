'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CreditCard, Calendar, User, Building, FileText, Camera, DollarSign } from 'lucide-react';
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
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          Thông tin chuyển khoản
        </CardTitle>
        <CardDescription className="text-base">
          Vui lòng điền thông tin chuyển khoản và tải lên ảnh chứng minh thanh toán
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Bank Account Info - Highlighted Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Thông tin tài khoản nhận</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Ngân hàng:</span>
              <p className="text-gray-900 font-semibold">Vietcombank</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Số tài khoản:</span>
              <p className="text-gray-900 font-semibold font-mono">1234567890</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Chủ tài khoản:</span>
              <p className="text-gray-900 font-semibold">CÔNG TY TNHH AN GI Ở ĐÂU</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Nội dung:</span>
              <p className="text-gray-900 font-semibold">{plan.name} - [Tên của bạn]</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sender Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <User className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Thông tin người chuyển</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                  Ngân hàng chuyển *
                </Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="VD: Vietcombank, BIDV, Techcombank..."
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
                  Số tài khoản *
                </Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Số tài khoản của bạn"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="accountHolder" className="text-sm font-medium text-gray-700">
                Chủ tài khoản *
              </Label>
              <Input
                id="accountHolder"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleInputChange}
                placeholder="Tên chủ tài khoản (như trên thẻ ngân hàng)"
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Transfer Details Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Chi tiết giao dịch</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="transferAmount" className="text-sm font-medium text-gray-700">
                  Số tiền chuyển *
                </Label>
                <Input
                  id="transferAmount"
                  name="transferAmount"
                  type="number"
                  value={formData.transferAmount}
                  onChange={handleInputChange}
                  min={plan.price}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-mono text-lg"
                  required
                />
                <p className="text-sm text-green-600 font-medium">
                  Tối thiểu: {formatCurrency(plan.price)}
                </p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="transferDate" className="text-sm font-medium text-gray-700">
                  Ngày & giờ chuyển *
                </Label>
                <Input
                  id="transferDate"
                  name="transferDate"
                  type="datetime-local"
                  value={formData.transferDate}
                  onChange={handleInputChange}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="transferNote" className="text-sm font-medium text-gray-700">
                  Nội dung chuyển khoản
                </Label>
                <Input
                  id="transferNote"
                  name="transferNote"
                  value={formData.transferNote}
                  onChange={handleInputChange}
                  placeholder={`${plan.name} - ${formData.accountHolder || '[Tên của bạn]'}`}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="transferReference" className="text-sm font-medium text-gray-700">
                  Mã tham chiếu (nếu có)
                </Label>
                <Input
                  id="transferReference"
                  name="transferReference"
                  value={formData.transferReference}
                  onChange={handleInputChange}
                  placeholder="Mã giao dịch từ ngân hàng"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Proof of Payment Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Camera className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Chứng minh thanh toán</h3>
            </div>

            <div className="space-y-3">
              <Label htmlFor="proofOfPayment" className="text-sm font-medium text-gray-700">
                Ảnh chứng minh thanh toán *
              </Label>
              <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-8 text-center transition-colors bg-gray-50/50">
                {previewUrl ? (
                  <div className="space-y-6">
                    <div className="relative inline-block">
                      <img 
                        src={previewUrl} 
                        alt="Proof of payment preview" 
                        className="max-w-full h-64 object-contain mx-auto rounded-lg shadow-md border"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setProofFile(null);
                        setPreviewUrl(null);
                      }}
                      className="border-gray-300 hover:border-blue-500 hover:text-blue-600"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Thay đổi ảnh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-full w-fit mx-auto">
                      <Camera className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <Label htmlFor="proofOfPayment" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-semibold text-lg">Chọn ảnh</span>
                        <span className="text-gray-500 ml-2">hoặc kéo thả vào đây</span>
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
          </div>

          {/* Important Notice */}
          <Alert className="border-amber-200 bg-amber-50">
            <FileText className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Lưu ý quan trọng:</strong> Sau khi gửi thông tin, bạn cần chờ admin xác nhận thanh toán. 
              Quá trình này thường mất 1-24 giờ trong giờ làm việc. 
              Bạn sẽ nhận được thông báo khi thanh toán được xác nhận.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Đang gửi thông tin...
                </>
              ) : (
                <>
                  <Upload className="mr-3 h-5 w-5" />
                  Gửi thông tin thanh toán
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}