import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    wrapperClassName?: string;
}

export const inputClassName = "w-full px-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg placeholder:text-slate-350 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 outline-none transition-all";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = "", wrapperClassName = "", ...props }, ref) => {
        const hasWidth = wrapperClassName.split(' ').some(cls => cls.startsWith('w-'));
        const finalWrapperClass = `${hasWidth ? "" : "w-full"} ${wrapperClassName}`.trim();
        return (
            <div className={finalWrapperClass}>
                {label && (
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`${inputClassName} ${
                        error ? "border-red-500 focus:ring-red-500/10" : ""
                    } ${className}`}
                    {...props}
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
