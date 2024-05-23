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
      } = prepareChartData(data);

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
    })
    .catch((error) => console.error("Error fetching data:", error));
});

function prepareChartData(data) {
  const boroughData = {};
  const monthlySalesData = {};
  const quarterlySalesData = {};

  data.flat(2).forEach((entry) => {
    if (!entry["SALE PRICE"] || !entry["SALE DATE"] || !entry.BOROUGH) {
      return;
    }

    // Aggregate data by borough
    if (!boroughData[entry.BOROUGH]) {
      boroughData[entry.BOROUGH] = {
        totalRevenue: 0,
        totalSales: 0,
      };
    }
    boroughData[entry.BOROUGH].totalRevenue += entry["SALE PRICE"];
    boroughData[entry.BOROUGH].totalSales += 1;

    // Aggregate monthly sales data
    const saleDate = new Date(entry["SALE DATE"]);
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
  };
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
        },
      ],
    },
  });
}
