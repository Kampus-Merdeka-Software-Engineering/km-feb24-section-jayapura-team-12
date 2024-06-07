const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
$(document).ready(function () {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });

  $("#myTable").DataTable({
    responsive: true,
    ajax: {
      url: "../data.json",
      dataSrc: "",
    },
    columns: [
      {
        data: null,
        title: "No",
        render: function (data, type, row, meta) {
          return meta.row + 1; // Menambahkan nomor baris
        },
      },
      { data: "borough" },
      { data: "neighborhood" },
      { data: "building_class_category" },
      { data: "address" },
      { data: "residential_units" },
      { data: "commercial_units" },
      { data: "total_units" },
      { data: "year_build" },
      { data: "sale_price" },
      { data: "sale_date" },
    ],
    pageLength: 10,
  });
});
