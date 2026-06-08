import React from "react";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
    children: React.ReactNode;
    wrapperClassName?: string;
}

export const Table: React.FC<TableProps> = ({ 
    children, 
    className = "", 
    wrapperClassName = "", 
    ...props 
}) => (
    <div className={`overflow-x-auto w-full rounded-xl border border-slate-200 ${wrapperClassName}`}>
        <table className={`w-full border-collapse text-left text-sm ${className}`} {...props}>
            {children}
        </table>
    </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ 
    children, 
    className = "", 
    ...props 
}) => (
    <thead className={`bg-slate-50 border-b border-slate-200 ${className}`} {...props}>
        {children}
    </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ 
    children, 
    className = "", 
    ...props 
}) => (
    <tbody className={`divide-y divide-slate-100 bg-white ${className}`} {...props}>
        {children}
    </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ 
    children, 
    className = "", 
    ...props 
}) => (
    <tr className={`hover:bg-slate-50/60 transition-colors ${className}`} {...props}>
        {children}
    </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ 
    children, 
    className = "", 
    ...props 
}) => (
    <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${className}`} {...props}>
        {children}
    </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ 
    children, 
    className = "", 
    ...props 
}) => (
    <td className={`px-4 py-3.5 align-middle text-slate-700 ${className}`} {...props}>
        {children}
    </td>
);
