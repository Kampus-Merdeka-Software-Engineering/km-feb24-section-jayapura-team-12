$(document).ready(function () {
  $("#myTable").DataTable({
    responsive: true,
    ajax: {
      url: "../data.json",
      dataSrc: "",
    },
    columns: [
      { data: "borough" },
      { data: "neighborhood" },
      { data: "building_class_category" },
      { data: "address" },
      { data: "residential_units" },
      { data: "commercial_units" },
      { data: "total_units" },
      { data: "year_build" },
      { data: "tax_class" },
      { data: "building_class" },
      { data: "sale_price" },
      { data: "sale_date" },
    ],
  });
});
