// Contenedores
const productosContainer = document.getElementById("productos-container");
const carritoList = document.getElementById("carrito-list");
const btnFactura = document.getElementById("btnFactura");

let carrito = [];

// 1️⃣ Cargar productos desde la API
async function cargarProductos() {
  const res = await fetch("/api/ropa");
  const productos = await res.json();

  productosContainer.innerHTML = "";

  productos.forEach((producto) => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <h3>${producto.nombre}</h3>
      <p>Precio: ${producto.precio}€</p>
      <p>Stock: ${producto.stockDisponible}</p>
      <button onclick="agregarCarrito(${producto._id}, '${producto.nombre}', ${producto.precio}, ${producto.stockDisponible})">Añadir al carrito</button>
    `;
    productosContainer.appendChild(div);
  });
}

// 2️⃣ Agregar producto al carrito
function agregarCarrito(id, nombre, precio, stockDisponible) {
  const itemExistente = carrito.find((i) => i.id === id);
  if (itemExistente) {
    if (itemExistente.cantidad < stockDisponible) itemExistente.cantidad++;
    else return alert("Stock insuficiente");
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1, stockDisponible });
  }
  mostrarCarrito();
}

// 3️⃣ Mostrar carrito
function mostrarCarrito() {
  carritoList.innerHTML = "";
  carrito.forEach((item) => {
    const li = document.createElement("li");
    li.innerText = `${item.nombre} x${item.cantidad} - ${item.precio}€ c/u`;
    carritoList.appendChild(li);
  });
}

// 4️⃣ Generar factura
btnFactura.addEventListener("click", async () => {
  if (carrito.length === 0) return alert("Carrito vacío");

  const cliente = { nombre: "Cliente Demo", email: "demo@correo.com" };

  const res = await fetch("/factura", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cliente, carrito }),
  });

  const data = await res.json();
  if (data.ticket) {
    // Guardar en localStorage y abrir factura.html
    localStorage.setItem("ultimaFactura", JSON.stringify(data));
    window.location.href = "/factura.html";
  } else {
    alert("Error generando factura: " + data.error);
  }
});

// Ejecutar al cargar
cargarProductos();