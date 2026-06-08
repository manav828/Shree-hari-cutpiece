import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    wrapperClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, className = "", children, wrapperClassName = "", ...props }, ref) => {
        const hasWidth = wrapperClassName.split(' ').some(cls => cls.startsWith('w-'));
        const finalWrapperClass = `${hasWidth ? "" : "w-full"} ${wrapperClassName}`.trim();
        return (
            <div className={finalWrapperClass}>
                {label && (
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`w-full px-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all ${
                        error ? "border-red-500 focus:ring-red-500/10" : ""
                    } ${className}`}
                    {...props}
                >
                    {children}
                </select>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        );
    }
);

Select.displayName = "Select";
