document.addEventListener("DOMContentLoaded", () => {
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      const {
        sortedBoroughLabels,
        sortedTotalRevenueByBorough,
        sortedSalesByBoroughLabels,
        sortedTotalSalesByBorough,
        sortedMonthlyLabels,
        sortedMonthlySales,
        sortedQuarterlyLabels,
        sortedQuarterlySales,
        totalSales,
        totalRevenue,
        totalResidentialUnits,
        totalCommercialUnits,
        top5BuildingClassCategories,
      } = prepareChartData(data);

      // Create Charts
      createChart(
        "revenueByBorough",
        "bar",
        "Total Revenue by Borough",
        sortedBoroughLabels,
        sortedTotalRevenueByBorough
      );
      createChart(
        "salesByBorough",
        "bar",
        "Total Sales by Borough",
        sortedSalesByBoroughLabels,
        sortedTotalSalesByBorough
      );
      createChart(
        "monthlySales",
        "line",
        "Total Sales per Month",
        sortedMonthlyLabels,
        sortedMonthlySales,
        0.3
      );
      createChart(
        "quarterlySales",
        "line",
        "Total Sales per Quarter",
        sortedQuarterlyLabels,
        sortedQuarterlySales,
        0.3
      );

      // Create additional pie charts
      createPieChart(
        "salesPercentageByBorough",
        "Sales Percentage by Borough",
        sortedSalesByBoroughLabels,
        calculatePercentage(sortedTotalSalesByBorough)
      );

      createPieChart(
        "unitDistributionPercentage",
        "Residential vs Commercial Units",
        ["Residential Units", "Commercial Units"],
        calculatePercentage([totalResidentialUnits, totalCommercialUnits])
      );

      createPieChart(
        "top5BuildingClassCategories",
        "Top 5 Building Class Categories",
        top5BuildingClassCategories.labels,
        top5BuildingClassCategories.percentages
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
    })
    .catch((error) => console.error("Error fetching data:", error));
});

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

    // Aggregate monthly sales data
    const saleDate = new Date(entry.sale_date);
    const month = `${saleDate.getFullYear()}-${(
      "0" +
      (saleDate.getMonth() + 1)
    ).slice(-2)}`;
    if (!monthlySalesData[month]) {
      monthlySalesData[month] = 0;
    }
    monthlySalesData[month] += 1;

    // Aggregate quarterly sales data
    const quarter = `Q${
      Math.floor(saleDate.getMonth() / 3) + 1
    }-${saleDate.getFullYear()}`;
    if (!quarterlySalesData[quarter]) {
      quarterlySalesData[quarter] = 0;
    }
    quarterlySalesData[quarter] += 1;

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

  // Menghitung rata-rata harga properti per borough
  const averagePropertyPriceByBorough = sortedBoroughLabels.map((borough) => {
    const totalPrices = boroughData[borough].totalRevenue;
    const totalSales = boroughData[borough].totalSales;
    return totalPrices / totalSales;
  });

  const buildingClassEntries = Object.entries(buildingClassData);
  buildingClassEntries.sort((a, b) => b[1] - a[1]);
  const top5BuildingClassCategories = {
    labels: buildingClassEntries.slice(0, 5).map((entry) => entry[0]),
    data: buildingClassEntries.slice(0, 5).map((entry) => entry[1]),
    percentages: calculatePercentage(
      buildingClassEntries.slice(0, 5).map((entry) => entry[1])
    ),
  };

  // Reorder monthly sales data based on sorted labels
  const sortedMonthlySales = sortedMonthlyLabels.map(
    (month) => monthlySalesData[month]
  );

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

  const sortedQuarterlySales = sortedQuarterlyLabels.map(
    (quarter) => quarterlySalesData[quarter]
  );

  return {
    sortedBoroughLabels,
    sortedTotalRevenueByBorough,
    sortedSalesByBoroughLabels,
    sortedTotalSalesByBorough,
    sortedMonthlyLabels,
    sortedMonthlySales,
    sortedQuarterlyLabels,
    sortedQuarterlySales,
    totalSales,
    totalRevenue,
    totalResidentialUnits,
    totalCommercialUnits,
    averagePropertyPriceByBorough,
    top5BuildingClassCategories,
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

function createChart(id, type, label, labels, data, lineTension = 0) {
  const ctx = document.getElementById(id).getContext("2d");
  new Chart(ctx, {
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
      scales: {
        y: {
          ticks: {
            callback: function (value) {
              return formatNumberCompact(value);
            },
          },
        },
      },
    },
  });
}

function createPieChart(id, label, labels, data) {
  const ctx = document.getElementById(id).getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: [
            "rgba(135, 122, 241, 0.37)",
            "rgba(109, 152, 220, 0.64)",
            "rgba(92, 172, 206, 0.85)",
            "rgba(83, 182, 199, 0.91)",
            "rgba(75, 192, 192, 1.0)",
            "rgba(118, 142, 227, 0.5)",
            "rgba(127, 132, 234, 0.46)",
            "rgba(135, 122, 241, 0.37)",
            "rgba(144, 112, 248, 0.28)",
            "rgba(153, 102, 255, 0.19)",
          ],
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
            boxWidth: 10,
          },
        },
        datalabels: {
          color: "#fff",
          font: {
            weight: "semi bold",
          },
          formatter: (value, context) => {
            return value + "%";
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}
