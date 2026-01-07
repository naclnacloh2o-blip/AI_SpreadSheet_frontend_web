import React from 'react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-10 transition-opacity" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative z-20 w-full max-w-lg bg-white dark:bg-background-dark rounded-xl shadow-[0_0_50px_-12px_rgba(236,19,19,0.25)] border border-red-600/20 overflow-hidden flex flex-col">
            <div className="flex flex-col items-center pt-8 pb-2 px-8 text-center">
                <div className="h-16 w-16 rounded-full bg-red-600/10 flex items-center justify-center mb-4 ring-1 ring-red-600/30">
                    <span className="material-symbols-outlined text-red-600 text-[40px] font-bold">warning</span>
                </div>
                <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-tight">
                    Cảnh báo: Reset Bảng tính
                </h2>
            </div>

            <div className="px-8 py-2 flex flex-col gap-4">
                <p className="text-gray-600 dark:text-gray-300 text-base font-normal leading-relaxed text-center">
                    Bạn sắp xóa toàn bộ dữ liệu do AI tạo ra và tất cả các lệnh AI (Intent) hiện có trong bảng tính này. <br/>
                    <span className="text-red-600 font-bold">Hành động này không thể hoàn tác.</span>
                </p>

                <div className="bg-red-600/5 rounded-lg border border-red-600/10 p-4 mt-2">
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-600 text-xl mt-0.5 shrink-0">delete_forever</span>
                            <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">Xóa tất cả cột do AI tạo ra.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-600 text-xl mt-0.5 shrink-0">delete_forever</span>
                            <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">Xóa toàn bộ lệnh AI (Intent).</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-600 text-xl mt-0.5 shrink-0">history</span>
                            <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">Khôi phục bảng tính về trạng thái dữ liệu gốc.</span>
                        </li>
                    </ul>
                </div>

                <div className="mt-4">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Để xác nhận, vui lòng gõ <span className="font-mono font-bold text-red-600 select-none">RESET</span> vào ô bên dưới:
                    </label>
                    <input 
                        autoComplete="off" 
                        className="w-full h-12 px-4 rounded-lg bg-white dark:bg-[#331919] border border-gray-300 dark:border-[#673232] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#c99292] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-mono transition-all shadow-sm"
                        placeholder="RESET" 
                        type="text"
                    />
                </div>
            </div>

            <div className="p-6 mt-2 flex items-center justify-end gap-3 bg-gray-50 dark:bg-[#2a1414] border-t border-gray-200 dark:border-[#482323]">
                <button 
                    onClick={onClose}
                    className="px-5 h-10 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#482323] hover:bg-gray-100 dark:hover:bg-[#5a2f2f] border border-gray-300 dark:border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-[#221010]"
                >
                    Hủy bỏ
                </button>
                <button 
                    onClick={onConfirm}
                    className="px-5 h-10 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 dark:focus:ring-offset-[#221010]"
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        <span>Reset Bảng tính</span>
                    </div>
                </button>
            </div>
        </div>
    </div>
  );
};