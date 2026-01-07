import React from 'react';

export const SettingsView: React.FC = () => {
  return (
    <main className="flex-1 px-4 py-8 md:px-20 lg:px-40 flex justify-center">
        <div className="flex flex-col max-w-[960px] w-full gap-8">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 px-4">
                <div className="flex min-w-72 flex-col gap-3">
                    <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Cài đặt người dùng</h1>
                    <p className="text-slate-500 dark:text-[#92adc9] text-base font-normal leading-normal max-w-2xl">
                        Quản lý thông tin tài khoản cá nhân, tinh chỉnh hành vi phân tích của AI Agent và xem thông tin ứng dụng.
                    </p>
                </div>
            </div>

            {/* Section 1: Account */}
            <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-[#15202b] shadow-sm">
                <div className="border-b border-slate-200 dark:border-border-dark px-6 py-4">
                    <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Thông tin tài khoản
                    </h3>
                </div>
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex flex-wrap items-start gap-6">
                        <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-slate-100 dark:border-[#192633]">
                            <div className="h-full w-full bg-gradient-to-tr from-blue-500 to-cyan-400"></div>
                            <button className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-primary">
                                <span className="material-symbols-outlined" style={{fontSize: '16px'}}>edit</span>
                            </button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-[#92adc9]">Tên hiển thị</span>
                                <input className="w-full rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#192633] px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" type="text" defaultValue="Nguyễn Văn A" />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-[#92adc9]">Email</span>
                                <input className="w-full cursor-not-allowed rounded-lg border border-slate-200 dark:border-[#324d67] bg-slate-100 dark:bg-[#111a22] px-4 py-3 text-base text-slate-500 dark:text-[#92adc9]/60 opacity-75" disabled type="email" defaultValue="user@example.com" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: AI Settings */}
            <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-[#15202b] shadow-sm">
                 <div className="border-b border-slate-200 dark:border-border-dark px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">tune</span>
                        Cài đặt ứng dụng
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-primary/20 text-primary">Beta Feature</span>
                 </div>
                 <div className="divide-y divide-slate-200 dark:divide-border-dark">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                        <div className="flex flex-col gap-1 max-w-2xl">
                            <p className="text-base font-medium text-slate-900 dark:text-white">Bật gợi ý từ AI Agent</p>
                            <p className="text-sm text-slate-500 dark:text-[#92adc9]">Cho phép AI tự động đề xuất các intent phân tích (AGENT_SUGGESTED) dựa trên dữ liệu bảng tính.</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input type="checkbox" className="peer sr-only" defaultChecked />
                            <div className="peer h-7 w-12 rounded-full bg-slate-200 dark:bg-[#233648] peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
                        </label>
                    </div>
                    {/* Additional Toggles */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                        <div className="flex flex-col gap-1 max-w-2xl">
                            <p className="text-base font-medium text-slate-900 dark:text-white">Cảnh báo dữ liệu STALE</p>
                            <p className="text-sm text-slate-500 dark:text-[#92adc9]">Hiển thị chỉ báo trực quan khi dữ liệu nguồn đã thay đổi và kết quả phân tích cần được cập nhật.</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input type="checkbox" className="peer sr-only" defaultChecked />
                            <div className="peer h-7 w-12 rounded-full bg-slate-200 dark:bg-[#233648] peer-checked:bg-primary after:absolute after:left-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
                        </label>
                    </div>
                 </div>
            </div>
            
             {/* Global Action */}
            <div className="sticky bottom-4 z-10 flex justify-end pt-4 pb-2">
                <div className="bg-white/80 dark:bg-[#111a22]/80 backdrop-blur p-2 rounded-xl shadow-lg border border-slate-200 dark:border-border-dark">
                    <button className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95">
                        <span className="mr-2 material-symbols-outlined">save</span>
                        Lưu cài đặt
                    </button>
                </div>
            </div>

        </div>
    </main>
  );
};