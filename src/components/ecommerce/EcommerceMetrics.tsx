import React from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

// 1. Definisikan tipe data props yang dibutuhkan
interface MetricItem {
  title: string;
  value: string | number;
  changeRate: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

interface EcommerceMetricsProps {
  metrics: MetricItem[];
}

// 2. Ubah komponen agar menerima props `metrics`
export default function EcommerceMetrics({ metrics }: EcommerceMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {metrics.map((item, index) => (
        <div 
          key={index} 
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {item.icon}
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {item.title}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {item.value}
              </h4>
            </div>
            
            <Badge color={item.isPositive ? "success" : "error"}>
              {item.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {item.changeRate}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}