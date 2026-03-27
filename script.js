document.addEventListener("DOMContentLoaded", function () {

  // =============================================
  //  LOGIN — admin y cliente
  // =============================================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const usuario    = document.getElementById("usuario").value.trim();
      const clave      = document.getElementById("clave").value.trim();
      const loginError = document.getElementById("loginError");
      loginError.style.display = "none";

      // Admin
      if (usuario === "admin" && clave === "1234expo") {
        sessionStorage.setItem("adminLogged", "true");
        window.location.href = "admin.html";
        return;
      }

      // Cliente — correo + contraseña
      const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
      const cliente  = clientes.find(c => c.correo === usuario && c.contrasena === clave);

      if (cliente) {
        sessionStorage.setItem("clienteLogged", JSON.stringify(cliente));
        window.location.href = "paginaprincipalcliente.html";
      } else {
        loginError.style.display = "block";
        loginError.textContent   = "Correo o contraseña incorrectos.";
      }
    });
  }

  // =============================================
  //  REGISTRO DE CLIENTE
  // =============================================
  const registroForm = document.getElementById("registroForm");
  if (registroForm) {
    registroForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const dni        = document.getElementById("dni");
      const nombre     = document.getElementById("nombre");
      const edad       = document.getElementById("edad");
      const telefono   = document.getElementById("telefono");
      const correo     = document.getElementById("correo");
      const contrasena = document.getElementById("contrasena");
      const regError   = document.getElementById("regError");
      const regOk      = document.getElementById("regOk");

      limpiarEstilos();
      regError.style.display = "none";
      regOk.style.display    = "none";

      const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
      let valido = true;
      let mensajeError = "";

      if (!/^\d{8}$/.test(dni.value.trim())) {
        marcarError(dni); valido = false;
        mensajeError = mensajeError || "El DNI debe tener exactamente 8 dígitos.";
      } else if (clientes.some(c => c.dni === dni.value.trim())) {
        marcarError(dni); valido = false;
        mensajeError = mensajeError || "Ya existe un cliente con ese DNI.";
      }

      if (nombre.value.trim().length < 3) {
        marcarError(nombre); valido = false;
        mensajeError = mensajeError || "El nombre debe tener al menos 3 caracteres.";
      }

      if (edad.value === "" || parseInt(edad.value) < 18) {
        marcarError(edad); valido = false;
        mensajeError = mensajeError || "Debes ser mayor de 18 años.";
      }

      if (telefono.value.trim() !== "" && !/^\d{9}$/.test(telefono.value.trim())) {
        marcarError(telefono); valido = false;
        mensajeError = mensajeError || "El teléfono debe tener 9 dígitos.";
      }

      if (!/^\S+@\S+\.\S+$/.test(correo.value.trim())) {
        marcarError(correo); valido = false;
        mensajeError = mensajeError || "Ingresa un correo electrónico válido.";
      } else if (clientes.some(c => c.correo === correo.value.trim())) {
        marcarError(correo); valido = false;
        mensajeError = mensajeError || "Ya existe una cuenta con ese correo.";
      }

      if (contrasena.value.length < 6) {
        marcarError(contrasena); valido = false;
        mensajeError = mensajeError || "La contraseña debe tener al menos 6 caracteres.";
      }

      if (!valido) {
        regError.style.display = "block";
        regError.textContent   = mensajeError;
        return;
      }

      clientes.push({
        dni:        dni.value.trim(),
        nombre:     nombre.value.trim(),
        edad:       edad.value,
        telefono:   telefono.value.trim(),
        correo:     correo.value.trim(),
        contrasena: contrasena.value
      });

      localStorage.setItem("clientes", JSON.stringify(clientes));
      registroForm.reset();

      regOk.style.display = "block";
      regOk.textContent   = "¡Registro exitoso! Redirigiendo al inicio de sesión...";
      setTimeout(() => { window.location.href = "login.html"; }, 1600);
    });
  }

  // =============================================
  //  ADMIN DASHBOARD — protección + render
  // =============================================
  const tablaBody = document.getElementById("tablaBody");
  if (tablaBody) {
    if (sessionStorage.getItem("adminLogged") !== "true") {
      window.location.href = "login.html";
      return;
    }
    renderTabla();
  }

  // =============================================
  //  HELPERS
  // =============================================
  function marcarError(input) {
    input.style.border    = "2px solid #e05555";
    input.style.boxShadow = "0 0 5px rgba(224,85,85,0.3)";
  }

  function limpiarEstilos() {
    document.querySelectorAll("input, textarea").forEach(el => {
      el.style.border    = "";
      el.style.boxShadow = "";
    });
  }

}); // end DOMContentLoaded


// =============================================
//  ADMIN — funciones globales
// =============================================
let editIndex  = null;
let quejaIndex = null;

function renderTabla() {
  const clientes  = JSON.parse(localStorage.getItem("clientes")) || [];
  const tablaBody = document.getElementById("tablaBody");
  const contador  = document.getElementById("contador");

  if (contador) {
    contador.textContent = clientes.length === 1 ? "1 cliente" : `${clientes.length} clientes`;
  }

  if (!tablaBody) return;
  tablaBody.innerHTML = "";

  if (clientes.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="7" class="table-empty">No hay clientes registrados aún.</td></tr>`;
    return;
  }

  clientes.forEach((c, i) => {
    tablaBody.innerHTML += `
      <tr>
        <td style="color:#555;">${i + 1}</td>
        <td>${c.dni}</td>
        <td style="color:var(--text-light);font-weight:500;">${c.nombre}</td>
        <td>${c.edad}</td>
        <td>${c.telefono || '<span style="color:#444;">—</span>'}</td>
        <td>${c.correo}</td>
        <td>
          <div class="table-actions">
            <button class="btn-primary"   style="padding:6px 12px;" onclick="abrirEditar(${i})">Editar</button>
            <button class="btn-danger"    style="padding:6px 12px;" onclick="eliminarCliente(${i})">Eliminar</button>
            <button class="btn-secondary" style="padding:6px 12px;" onclick="abrirQueja(${i})">Queja</button>
          </div>
        </td>
      </tr>`;
  });
}

function eliminarCliente(i) {
  if (!confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) return;
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  clientes.splice(i, 1);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  renderTabla();
}

// --- Editar ---
function abrirEditar(i) {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const c = clientes[i];
  editIndex = i;
  document.getElementById("editDni").value      = c.dni;
  document.getElementById("editNombre").value   = c.nombre;
  document.getElementById("editEdad").value     = c.edad;
  document.getElementById("editTelefono").value = c.telefono || "";
  document.getElementById("editCorreo").value   = c.correo;
  document.getElementById("editError").style.display = "none";
  document.getElementById("modalEditar").classList.add("active");
}

function guardarEdicion() {
  const editError = document.getElementById("editError");
  editError.style.display = "none";

  const nombre   = document.getElementById("editNombre").value.trim();
  const edad     = document.getElementById("editEdad").value;
  const telefono = document.getElementById("editTelefono").value.trim();
  const correo   = document.getElementById("editCorreo").value.trim();

  if (nombre.length < 3) {
    editError.style.display = "block";
    editError.textContent = "El nombre debe tener al menos 3 caracteres."; return;
  }
  if (edad === "" || parseInt(edad) < 18) {
    editError.style.display = "block";
    editError.textContent = "La edad debe ser al menos 18 años."; return;
  }
  if (telefono !== "" && !/^\d{9}$/.test(telefono)) {
    editError.style.display = "block";
    editError.textContent = "El teléfono debe tener 9 dígitos."; return;
  }
  if (!/^\S+@\S+\.\S+$/.test(correo)) {
    editError.style.display = "block";
    editError.textContent = "Ingresa un correo válido."; return;
  }

  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  clientes[editIndex].nombre   = nombre;
  clientes[editIndex].edad     = edad;
  clientes[editIndex].telefono = telefono;
  clientes[editIndex].correo   = correo;
  localStorage.setItem("clientes", JSON.stringify(clientes));
  cerrarModal("modalEditar");
  renderTabla();
}

// --- Quejas ---
function abrirQueja(i) {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  quejaIndex = i;
  document.getElementById("quejaCliente").value     = `${clientes[i].nombre} — DNI: ${clientes[i].dni}`;
  document.getElementById("quejaMotivo").value      = "";
  document.getElementById("quejaDescripcion").value = "";
  document.getElementById("quejaError").style.display = "none";
  document.getElementById("quejaMotivo").style.border = "";
  document.getElementById("modalQueja").classList.add("active");
}

function guardarQueja() {
  const motivo      = document.getElementById("quejaMotivo");
  const descripcion = document.getElementById("quejaDescripcion");
  const quejaError  = document.getElementById("quejaError");
  quejaError.style.display = "none";
  motivo.style.border = "";

  if (motivo.value.trim() === "") {
    motivo.style.border = "2px solid #e05555";
    quejaError.style.display = "block";
    quejaError.textContent = "El motivo es obligatorio."; return;
  }

  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const quejas   = JSON.parse(localStorage.getItem("quejas"))   || [];

  quejas.push({
    clienteNombre: clientes[quejaIndex].nombre,
    clienteDni:    clientes[quejaIndex].dni,
    motivo:        motivo.value.trim(),
    descripcion:   descripcion.value.trim(),
    fecha: new Date().toLocaleDateString("es-PE", { day:"2-digit", month:"2-digit", year:"numeric" })
  });

  localStorage.setItem("quejas", JSON.stringify(quejas));
  cerrarModal("modalQueja");
}

// --- Modales ---
function cerrarModal(id) {
  document.getElementById(id).classList.remove("active");
}

document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) cerrarModal(overlay.id);
  });
});

function cerrarSesion() {
  sessionStorage.removeItem("adminLogged");
  window.location.href = "login.html";
}
