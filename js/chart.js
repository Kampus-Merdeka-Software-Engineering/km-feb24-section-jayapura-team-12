let originalData = null;
let charts = {};

document.addEventListener("DOMContentLoaded", () => {
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      originalData = data;
      updateCharts(data);
    })
    .catch((error) => console.error("Error fetching data:", error));
});

function handleCheckboxChange() {
  const checkboxes = document.querySelectorAll(
    ".dropdown-content input[type=checkbox]"
  );
  const selectedBoroughs = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  filterDataByBoroughs(selectedBoroughs);
}

function filterDataByBoroughs(boroughs) {
  if (!originalData) return;

  const filteredData = originalData.filter((entry) =>
    boroughs.includes(entry.borough)
  );

  updateCharts(filteredData);
}

function updateCharts(data) {
  const {
    sortedBoroughLabels,
    sortedTotalRevenueByBorough,
    sortedSalesByBoroughLabels,
    sortedTotalSalesByBorough,
    sortedMonthlyLabels,
    boroughMonthlySales,
    sortedQuarterlyLabels,
    boroughQuarterlySales,
    totalSales,
    totalRevenue,
    totalResidentialUnits,
    totalCommercialUnits,
    top3BuildingClassCategories,
  } = prepareChartData(data);

  // Create or update charts
  charts.revenueByBorough = createOrUpdateChart(
    charts.revenueByBorough,
    "revenueByBorough",
    "bar",
    "Total Revenue by Borough",
    sortedBoroughLabels,
    sortedTotalRevenueByBorough
  );
  charts.salesByBorough = createOrUpdateChart(
    charts.salesByBorough,
    "salesByBorough",
    "bar",
    "Total Sales by Borough",
    sortedSalesByBoroughLabels,
    sortedTotalSalesByBorough
  );
  charts.monthlySales = createOrUpdateLineChart(
    charts.monthlySales,
    "monthlySales",
    "Total Sales per Month by Borough",
    sortedMonthlyLabels,
    boroughMonthlySales,
    0.3
  );
  charts.quarterlySales = createOrUpdateLineChart(
    charts.quarterlySales,
    "quarterlySales",
    "Total Sales per Quarter by Borough", // Perubahan
    sortedQuarterlyLabels,
    boroughQuarterlySales, // Perubahan
    0.3
  );

  // Create or update pie charts
  charts.salesPercentageByBorough = createOrUpdatePieChart(
    charts.salesPercentageByBorough,
    "salesPercentageByBorough",
    "Sales Percentage by Borough",
    sortedSalesByBoroughLabels,
    calculatePercentage(sortedTotalSalesByBorough)
  );

  charts.unitDistributionPercentage = createOrUpdatePieChart(
    charts.unitDistributionPercentage,
    "unitDistributionPercentage",
    "Residential vs Commercial Units",
    ["Residential Units", "Commercial Units"],
    calculatePercentage([totalResidentialUnits, totalCommercialUnits])
  );

  charts.top3BuildingClassCategories = createOrUpdatePieChart(
    charts.top3BuildingClassCategories,
    "top3BuildingClassCategories",
    "Top 3 Building Class Categories",
    top3BuildingClassCategories.labels,
    top3BuildingClassCategories.percentages
  );

  // Update KPI Cards with compact number formatting
  document.getElementById("totalSalesValue").textContent =
    formatNumberCompact(totalSales);
  document.getElementById("totalRevenueValue").textContent =
    formatNumberCompact(totalRevenue);
  document.getElementById("totalResidentialUnitsValue").textContent =
    formatNumberCompact(totalResidentialUnits);
  document.getElementById("totalCommercialUnitsValue").textContent =
    formatNumberCompact(totalCommercialUnits);
}

function prepareChartData(data) {
  const boroughData = {};
  const monthlySalesData = {};
  const quarterlySalesData = {};
  const buildingClassData = {};
  let totalSales = 0;
  let totalRevenue = 0;
  let totalResidentialUnits = 0;
  let totalCommercialUnits = 0;

  data.flat(2).forEach((entry) => {
    if (
      !entry.sale_price ||
      !entry.sale_date ||
      !entry.borough ||
      !entry.building_class_category
    ) {
      return;
    }

    // Aggregate data by borough
    if (!boroughData[entry.borough]) {
      boroughData[entry.borough] = {
        totalRevenue: 0,
        totalSales: 0,
        residentialUnits: 0,
        commercialUnits: 0,
      };
    }
    boroughData[entry.borough].totalRevenue += entry.sale_price;
    boroughData[entry.borough].totalSales += 1;

    // Aggregate total sales and revenue
    totalSales += 1;
    totalRevenue += entry.sale_price;

    // Aggregate residential and commercial units
    totalResidentialUnits += entry.residential_units || 0;
    totalCommercialUnits += entry.commercial_units || 0;
    boroughData[entry.borough].residentialUnits += entry.residential_units || 0;
    boroughData[entry.borough].commercialUnits += entry.commercial_units || 0;

    // Aggregate monthly sales data by borough
    const saleDate = new Date(entry.sale_date);
    const month = `${saleDate.getFullYear()}-${(
      "0" +
      (saleDate.getMonth() + 1)
    ).slice(-2)}`;
    if (!monthlySalesData[month]) {
      monthlySalesData[month] = {};
    }
    if (!monthlySalesData[month][entry.borough]) {
      monthlySalesData[month][entry.borough] = 0;
    }
    monthlySalesData[month][entry.borough] += 1;

    // Aggregate quarterly sales data by borough
    const quarter = `Q${
      Math.floor(saleDate.getMonth() / 3) + 1
    }-${saleDate.getFullYear()}`;
    if (!quarterlySalesData[quarter]) {
      quarterlySalesData[quarter] = {};
    }
    if (!quarterlySalesData[quarter][entry.borough]) {
      quarterlySalesData[quarter][entry.borough] = 0;
    }
    quarterlySalesData[quarter][entry.borough] += 1;

    // Aggregate sales by building class category
    if (!buildingClassData[entry.building_class_category]) {
      buildingClassData[entry.building_class_category] = 0;
    }
    buildingClassData[entry.building_class_category] += 1;
  });

  // Prepare data for charts

  // Data Total Revenue
  const boroughLabels = Object.keys(boroughData);
  const boroughRevenuePairs = boroughLabels.map((borough) => ({
    borough: borough,
    revenue: boroughData[borough].totalRevenue,
  }));

  // Sorting boroughs by total revenue
  boroughRevenuePairs.sort((a, b) => b.revenue - a.revenue);
  const sortedBoroughLabels = boroughRevenuePairs.map((pair) => pair.borough);
  const sortedTotalRevenueByBorough = boroughRevenuePairs.map(
    (pair) => pair.revenue
  );

  // Data Total Sales
  const totalSalesByBoroughPairs = boroughLabels.map((borough) => ({
    borough: borough,
    sales: boroughData[borough].totalSales,
  }));

  // Sorting by total sales
  totalSalesByBoroughPairs.sort((a, b) => b.sales - a.sales);
  const sortedSalesByBoroughLabels = totalSalesByBoroughPairs.map(
    (pair) => pair.borough
  );
  const sortedTotalSalesByBorough = totalSalesByBoroughPairs.map(
    (pair) => pair.sales
  );

  // Data Sales Trend by Month
  const monthlyLabels = Object.keys(monthlySalesData).sort();

  // Sort monthly labels by year and month
  const sortedMonthlyLabels = monthlyLabels.sort((a, b) => {
    const [yearA, monthA] = a.split("-");
    const [yearB, monthB] = b.split("-");
    if (yearA !== yearB) {
      return parseInt(yearA) - parseInt(yearB);
    } else {
      return parseInt(monthA) - parseInt(monthB);
    }
  });

  const boroughMonthlySales = sortedBoroughLabels.map((borough) => {
    return {
      label: borough,
      data: sortedMonthlyLabels.map(
        (month) => monthlySalesData[month][borough] || 0
      ),
    };
  });

  const buildingClassEntries = Object.entries(buildingClassData);
  buildingClassEntries.sort((a, b) => b[1] - a[1]);
  const top3BuildingClassCategories = {
    labels: buildingClassEntries.slice(0, 3).map((entry) => entry[0]),
    data: buildingClassEntries.slice(0, 3).map((entry) => entry[1]),
    percentages: calculatePercentage(
      buildingClassEntries.slice(0, 3).map((entry) => entry[1])
    ),
  };

  // Data Sales Trend by Quarter
  const quarterlyLabels = Object.keys(quarterlySalesData).sort();

  // Sort quarterly labels by year and quarter
  const sortedQuarterlyLabels = quarterlyLabels.sort((a, b) => {
    const [quarterA, yearA] = a.split("-");
    const [quarterB, yearB] = b.split("-");
    if (yearA !== yearB) {
      return parseInt(yearA) - parseInt(yearB);
    } else {
      return parseInt(quarterA.slice(1)) - parseInt(quarterB.slice(1));
    }
  });

  const boroughQuarterlySales = sortedBoroughLabels.map((borough) => {
    return {
      label: borough,
      data: sortedQuarterlyLabels.map(
        (quarter) => quarterlySalesData[quarter][borough] || 0
      ),
    };
  });

  const sortedQuarterlySales = sortedQuarterlyLabels.map(
    (quarter) => quarterlySalesData[quarter]
  );

  return {
    sortedBoroughLabels,
    sortedTotalRevenueByBorough,
    sortedSalesByBoroughLabels,
    sortedTotalSalesByBorough,
    sortedMonthlyLabels,
    boroughMonthlySales,
    sortedQuarterlyLabels,
    boroughQuarterlySales,
    sortedQuarterlySales,
    totalSales,
    totalRevenue,
    totalResidentialUnits,
    totalCommercialUnits,
    top3BuildingClassCategories,
  };
}

function calculatePercentage(data) {
  const total = data.reduce((acc, curr) => acc + curr, 0);
  return data.map((value) => ((value / total) * 100).toFixed(2));
}

function formatNumberCompact(number) {
  if (number >= 1e9) {
    return (number / 1e9).toFixed(1) + "B";
  } else if (number >= 1e6) {
    return (number / 1e6).toFixed(1) + "M";
  } else {
    return number.toLocaleString();
  }
}

function createOrUpdateChart(
  chartInstance,
  id,
  type,
  label,
  labels,
  data,
  lineTension = 0
) {
  if (chartInstance) {
    // Destroy existing chart before creating a new one
    chartInstance.destroy();
  }

  const ctx = document.getElementById(id).getContext("2d");
  chartInstance = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          lineTension: lineTension,
          fill: "start",
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: "#fff",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#fff",
          },
        },
        y: {
          ticks: {
            color: "#fff",
            callback: (value) => formatNumberCompact(value),
          },
        },
      },
    },
  });

  return chartInstance;
}

function createOrUpdateLineChart(
  chartInstance,
  id,
  label,
  labels,
  datasets,
  lineTension = 0
) {
  if (chartInstance) {
    // Destroy existing chart before creating a new one
    chartInstance.destroy();
  }

  const legendMargin = {
    id: "legendMargin",
    beforeInit(chart) {
      const fitValue = chart.legend.fit;
      chart.legend.fit = function fit() {
        fitValue.bind(chart.legend)();
        return (this.height += 20);
      };
    },
  };

  const ctx = document.getElementById(id).getContext("2d");
  const backgroundColor = [
    "rgba(80, 48, 145)",
    "rgba(153, 153, 255, 0.5)",
    "rgba(102, 204, 255, 0.6)",
    "rgba(255, 204, 102, 0.9)",
    "rgba(255, 153, 51, 1)",
  ];
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasets.map((dataset) => ({
        ...dataset,
        lineTension: lineTension,
        borderWidth: 2,
        borderColor: backgroundColor,
        pointRadius: 2,
        pointStyle: "point",
        pointBorderColor: "rgba(102, 204, 255, 0.6)",
      })),
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: "#fff",
          },
        },
      },
      scales: {
        x: {
          textBaseline: "top",
          ticks: {
            padding: 10,
            color: "#fff",
          },
        },
        y: {
          ticks: {
            padding: 20,
            color: "#fff",
            callback: (value) => formatNumberCompact(value),
          },
        },
      },
    },
    plugins: [legendMargin],
  });

  return chartInstance;
}

function createOrUpdatePieChart(chartInstance, id, label, labels, data) {
  if (chartInstance) {
    // Destroy existing chart before creating a new one
    chartInstance.destroy();
  }

  const ctx = document.getElementById(id).getContext("2d");
  const backgroundColor = [
    "rgba(135, 122, 241, 0.37)",
    "rgba(109, 152, 220, 0.64)",
    "rgba(92, 172, 206, 0.85)",
    "rgba(83, 182, 199, 0.91)",
    "rgba(75, 192, 192, 1.0)",
  ];
  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "#fff",
            boxWidth: 10,
          },
        },
        datalabels: {
          color: "#fff",
          font: {
            weight: "semi bold",
          },
          formatter: (value) => value + "%",
        },
      },
    },
    plugins: [ChartDataLabels],
  });

  return chartInstance;
}
