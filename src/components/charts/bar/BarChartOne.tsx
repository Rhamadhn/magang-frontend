import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

// Definisikan tipe props agar dinamis
interface BarChartOneProps {
  categories?: string[];
  seriesData: {
    name: string;
    data: number[];
  }[];
}

export default function BarChartOne({ 
  categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 
  seriesData 
}: BarChartOneProps) {
  
  const options: ApexOptions = {
    colors: ["#465fff", "#10B981", "#8B5CF6"], // Ditambahkan variasi warna jika series lebih dari satu
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories, // Menggunakan kategori dinamis dari props
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      {/* Jika categories sedikit, min-w bisa dikurangi agar responsif, atau biarkan 1000px jika data bulanan padat */}
      <div id="chartOne" className="min-w-[800px] xl:min-w-full">
        <Chart options={options} series={seriesData} type="bar" height={180} />
      </div>
    </div>
  );
}