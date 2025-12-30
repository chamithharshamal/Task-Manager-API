import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    isLoading = false,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: 'bg-red-500/10 text-red-500 border-red-500/20',
        warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        info: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    };

    const buttonStyles = {
        danger: 'bg-red-600 hover:bg-red-500 shadow-red-900/20',
        warning: 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20',
        info: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md glass-card p-8 animate-in zoom-in-95 duration-200 border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-full ${variantStyles[variant]} border`}>
                        <AlertCircle className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                        <p className="text-gray-400 leading-relaxed">{message}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 ${buttonStyles[variant]} text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : confirmText}
                        </button>
                        {cancelText !== 'NONE' && (
                            <button
                                onClick={onCancel}
                                disabled={isLoading}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 px-6 rounded-xl border border-white/10 transition-all active:scale-95"
                            >
                                {cancelText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
