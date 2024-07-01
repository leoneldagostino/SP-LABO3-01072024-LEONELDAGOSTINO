import { Planeta } from "./planeta.js"
import { mostrarSpinner, ocultarSpinner } from "./spinner.js";


const ENDPOINT = "http://localhost:3000/planetas";
let items = []; // array vacio
const formulario = document.getElementById("form-item");
const btnBorrar = document.getElementById("btnEliminar");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");
const Modal = document.getElementById("btnModal");
const overlay = document.createElement('div');
overlay.classList.add('modal-overlay');

document.addEventListener("DOMContentLoaded", onInit); // importante no poner parentesis, es un callback
document.addEventListener("click", handlerClick)
btnCancelar.addEventListener("click", botonCancelar);
Modal.addEventListener("click", mostrarModal);
overlay.addEventListener("click", cerrarModal);

btnBorrar.addEventListener("click", botonEliminar);



function onInit() {
  obtenerPlanetas();
  escuchandoFormulario();
  escuchandoBtnDeleteAll();
  setupFilterControls();
  setupColumnControls();
  obtenerAño();
}

function setupFilterControls() {
  const filterType = document.getElementById("filtarTipo");
  filterType.addEventListener("change", handleFilter);
}
function handleFilter() {
  const filtradoPorTipo = document.getElementById("filtarTipo").value;
  let filtrado = items;

  if (filtradoPorTipo) {
    filtrado = items.filter(item => item.tipo === filtradoPorTipo);
  }

  rellenarTabla(filtrado);
  calcularPromedioDistancia(filtrado);
}

function calcularPromedioDistancia(filtrados) {
  const promedioDistancia = document.getElementById("promedio");
  if (filtrados.length === 0) {
    
    promedioDistancia.textContent = "N/A";
    return;
  }

  const totalDistancia = filtrados.reduce((acc, item) => acc + parseInt(item.distanciaAlSol, 10), 0);
  const promedio = totalDistancia / filtrados.length;

  promedioDistancia.textContent = promedio; 

  if(isNaN(promedio)){
    promedioDistancia.textContent = "N/A";
  
  }
}


/**
 * Maneja el evento click en la tabla
 * si el evento es en una celda de la tabla carga los datos en el formulario
 * si el evento es en cualquier otro lugar cierra el modal y limpia el formulario
 * 
 */
function handlerClick(e) {
  if(e.target.matches('td')){
    let idMathc = e.target.parentNode.firstChild;

    const item = items.filter((dato) => dato.id == idMathc.firstChild.textContent)[0];
    

    cargarDatos(formulario, item);
    modificacionBotones(true);
    mostrarModal();
  } 
  else if(!e.target.matches('input') && !e.target.matches('select') && !e.target.matches('textarea') && !e.target.matches('button') )
  {
    modificacionBotones(false);
    actualizarFormulario();
  }
}


/**
 * Modifica el estilo de los botones de borrar 
 * si habilitado es true cambia la clase a activado
 * si es false cambia la clase a desactivado
 *
 * @param {boolean} [habilitado=false] 
 */
function modificacionBotones(habilitado=false){
  if(habilitado){
    btnBorrar.setAttribute("class", "btn btn-eliminar activado")
  }else{
    btnBorrar.setAttribute("class", "btn btn-eliminar desactivado")
  }
  
}


/**
 * Elimina un item del array items y del local storage
 * @async
 * @param {*} e
 * @returns {*}
 */
async function botonEliminar(e){

  
  const idEliminar = e.target.dataset.id || formulario.id.value;

  if (idEliminar && confirm("Desea eliminar el item seleccionado?")) {
    cerrarModal();
    mostrarSpinner();
    try{
      await eliminarPlaneta(idEliminar);
      items = items.filter((dato) => dato.id != idEliminar);
      rellenarTabla();
    }
    catch(error){
      console.error("Error al eliminar el planeta: ", error);
    }
    finally{
      ocultarSpinner();
      actualizarFormulario();
    }
  }
}





/**
 * Carga los datos del item en el formulario
 * si el item no existe limpia el formulario
 * si el item existe carga los datos en el formulario
 *
 * @param {*} formCarga 
 * @param {*} datos 
 */
function cargarDatos(formCarga, datos){
  formCarga.id.value = datos.id;
  formCarga.nombre.value = datos.nombre;
  formCarga.tamaño.value = parseInt(datos.tamano);
  formCarga.masa.value = datos.masa;
  formCarga.distancia.value = parseInt(datos.distanciaAlSol);
  formCarga.vida.checked = datos.presenciaVida === "si";
  formCarga.anillo.checked = datos.poseeAnillo === "si";

  formCarga.vida.value = datos.presenciaVida;
  formCarga.anillo.value = datos.poseeAnillo;
  formCarga.atmosfera.value = datos.composicionAtmosferica;

  const tipoSelect = formCarga.tipo;
  for (let i = 0; i < tipoSelect.options.length; i++) {
    if (tipoSelect.options[i].value === datos.tipo) {
      tipoSelect.selectedIndex = i;
      break;
    }
  }
}

/**
 * Carga los items del local storage en el array items
 * si no hay items en el local storage crea un array vacio
 * convierte los items en objetos de la clase Planeta
 * rellena la tabla con los datos de los items
 *
 * @returns {*} retorna un array de objetos de la clase Planeta
 */
// async function loadItems() {
//   mostrarSpinner();
//   let str = await leer(KEY_STORAGE);
//   ocultarSpinner();

//   const objetos = jsonToObject(str) || [];
  
//   objetos.forEach(obj => {
//     const model = new Planeta(
//         obj.id,
//         obj.nombre,
//         obj.tamaño,
//         obj.masa,
//         obj.tipo,
//         obj.distancia,
//         obj.vida,
//         obj.anillo,
//         obj.atmosfera
//     );
//     items.push(model);
//   });

//   rellenarTabla();
// }




/**
 * Rellena la tabla con los datos de los items
 * limpia la tabla antes de rellenarla
 * crea las celdas y las filas de la tabla
 * agrega los botones de modificar y borrar a cada fila
 * agrega los eventos a los botones de modificar y borrar
 */
function rellenarTabla(filteredItems = items) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  filteredItems.forEach(item => {
    const nuevaFila = document.createElement("tr");
    nuevaFila.innerHTML = `
    <td data-column="id" style="display:none;">${item.id}</td>
    <td data-column="nombre">${item.nombre}</td>
    <td data-column="tamaño">${item.tamano}</td>
    <td data-column="masa">${item.masa}</td>
    <td data-column="tipo">${item.tipo}</td>
    <td data-column="distancia">${item.distanciaAlSol}</td> 
    <td data-column="vida">${item.presenciaVida}</td> 
    <td data-column="anillo">${item.poseeAnillo}</td> 
    <td data-column="atmosfera">${item.composicionAtmosferica}</td>
    <td data-column="acciones">
      <button class="btn btn-modificar-tabla">Modificar</button>
      <button class="btn btn-borrar-tabla" data-id="${item.id}">Borrar</button>
    </td>
  `;

    nuevaFila.querySelector(".btn-modificar-tabla").addEventListener("click", () => {
      cargarDatos(formulario, item);
      modificacionBotones(true);
      mostrarModal();
    });

    nuevaFila.querySelector(".btn-borrar-tabla").addEventListener("click", botonEliminar);

    tbody.appendChild(nuevaFila);
  });
  handleColumnChange();
}


/**
 * Escucha el evento submit del formulario
 * trae los datos de los campos realizando su validacion y los guarda en el local storage
 * si el item ya existe lo actualiza
 * si no existe lo agrega al array items
 * muestra un alert si los datos son incorrectos
 * limpia el formulario
 * actualiza la tabla
 *
 */
function escuchandoFormulario() {
  const form = document.getElementById("form-item");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = form.querySelector("#id").value || Date.now();
    const nombre = form.querySelector("#nombre").value;
    const tamaño = form.querySelector("#tamaño").value;
    const masa = form.querySelector("#masa").value;
    const tipo = form.querySelector("#tipo").value;
    const distancia = form.querySelector("#distancia").value;
    const vida = form.querySelector("#vida").checked ? "si" : "no";
    const anillo = form.querySelector("#anillo").checked ? "si" : "no";
    const atmosfera = form.querySelector("#atmosfera").value;
    const campos = [
      { valor: nombre, validacion: { obligatorio: true }, nombreCampo: "nombre" },
      { valor: tamaño, validacion: { obligatorio: true ,tipo: "numerico" }, nombreCampo: "tamaño" },
      { valor: masa, validacion: { obligatorio: true }, nombreCampo: "masa" },
      { valor: tipo, validacion: { obligatorio: true }, nombreCampo: "tipo" },
      { valor: distancia, validacion: { obligatorio: true, tipo: "numerico" }, nombreCampo: "distancia" },
      { valor: atmosfera, validacion: { obligatorio: true }, nombreCampo: "atmosfera" }
    ];

    let validar = validacionCampos(campos)

    if(!validar)
      {
        return;
      }
    
    const model = new Planeta(id, nombre, tamaño, masa, tipo, distancia, vida, anillo, atmosfera);
    const respuesta = model.verify();

    if (respuesta) {
      cerrarModal();
      
      try{
        mostrarSpinner();
        if(!items.find(item => item.id == id)){
          console.log("agregar planeta");
          await agregarPlaneta(model);
        }else{
          console.log("editar planeta"  );
          await editarPlaneta(model);
        }
        obtenerPlanetas();
      }catch(error)
      {
        console.error("Error al guardar el planeta: ",error);
      }
      finally{
        ocultarSpinner();
        obtenerPlanetas();
        actualizarFormulario();
      }
    } else {
      alert(respuesta);
    }
  });
}

/**
 * Limpia el formulario
 */
function actualizarFormulario() {
  const form = document.getElementById("form-item");
  form.reset();
  
}

/**
 * Escucha el evento click del boton de eliminar todos los items
 */
function escuchandoBtnDeleteAll() {
  const btn = document.getElementById("btn-delete-all");

  btn.addEventListener("click", async (e) => {

    const rta = confirm('Desea eliminar todos los Items?');

    mostrarSpinner();
    if(rta) {
      items.splice(0, items.length);
      
      try {
        await items.map(async (item) => eliminarPlaneta(item.id));
        obtenerPlanetas();
      }
      catch (error) {
        alert(error);
      }
    }
    ocultarSpinner();
  });
}

/**
 * Obtiene el año actual y lo muestra en el footer
 */
function obtenerAño(){
  var fechaActual = new Date();
  let fechaMostrar = document.getElementById("año");
  fechaMostrar.textContent = fechaActual.getFullYear();

}

/**
 * Muestra el modal
 */
function mostrarModal() {
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');
  document.body.appendChild(overlay);
  formulario.classList.remove('hidden');
}

/**
 * Cierra el modal
 */
function cerrarModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
  formulario.classList.add('hidden');
}


/**
 * La funcion cierra el modal y limpia el formulario
 */
function botonCancelar()
{
  cerrarModal();
  modificacionBotones(false);
  actualizarFormulario();
}

/**
 * Realiza validaciones de los campos
 *
 * @param {*} campos se espera un array de objetos con la siguiente estructura { valor: "", validacion: { obligatorio: true, tipo: "numerico" }, nombreCampo: "nombre" }
 * @returns {boolean} retorna true si los campos son validos, false si no lo son
 */
function validacionCampos(campos)
{
  for (let campo of campos) 
    {
      let { valor, validacion, nombreCampo } = campo;

      if (validacion.obligatorio && !valor) {
        alert(`El campo ${nombreCampo} es obligatorio`);
        return false;
      }

      if (validacion.tipo === "numerico" && (isNaN(valor) || valor <= 0)) {
        alert(`El campo ${nombreCampo} debe ser un número positivo`);
        return false;
      }
    }

    return true;
}


function setupColumnControls() {
  const controlColumnas = document.querySelectorAll('.columnas-control input[type="checkbox"]');
  controlColumnas.forEach(control => {
    control.addEventListener("change", handleColumnChange);
  });
}

function handleColumnChange(){
  const columnas = document.querySelectorAll('.columnas-control input[type="checkbox"]');
  columnas.forEach(control =>{
    const columna = control.dataset.column;
    const check = control.checked;
    const columnElements = document.querySelectorAll(`td[data-column="${columna}"], th[data-column="${columna}"]`);
    columnElements.forEach(elemento =>{
      elemento.style.display = check ? "table-cell" : "none";
    }); 
  });
}

function getColumnIndex(columnName) {
  const columns = ["id", "nombre", "tamaño", "masa", "tipo", "distancia", "vida", "anillo", "atmosfera", "acciones"];
  return columns.indexOf(columnName);
}


async function obtenerPlanetas() {
  mostrarSpinner();
  try {
    const response = await fetch(ENDPOINT);
    if (!response.ok) {
      throw new Error('Error en la respuesta de la API');
    }

    const data = await response.json();
    items = data.map(item => new Planeta(
      item.id,
      item.nombre,
      item.tamano,
      item.masa,
      item.tipo,
      item.distanciaAlSol,
      item.presenciaVida ? "si" : "no",
      item.poseeAnillo ? "si" : "no",
      item.composicionAtmosferica
    ));
    rellenarTabla();
  } catch (error) {
    console.error('Error al obtener los datos:', error);
  } finally {
    ocultarSpinner();
  }
}


function obtenerPlaneta(id) {
  let xhr = new XMLHttpRequest();

  xhr.addEventListener("readystatechange", function () {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        const obj = JSON.parse(xhr.responseText);
        console.log(obj);
        // Aquí puedes realizar alguna acción con el planeta obtenido por ID
      } else {
        console.error(`Error al obtener el planeta ${id}:`, xhr.status, xhr.statusText);
      }
    }
  });

  xhr.open("GET", `${ENDPOINT}/${id}`);
  xhr.send();
}

function agregarPlaneta(planeta) {
  const xhr = new XMLHttpRequest();

  try{
    mostrarSpinner();
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          console.log("Planeta agregado:", data);
        } else {
          console.error(`Error al agregar el planeta: ${xhr.status} - ${xhr.statusText}`);
        }
      }
    };
  }
  finally{
    ocultarSpinner();
  }

  xhr.open("POST", `${ENDPOINT}`);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(planeta));
}

function editarPlaneta(planeta) {
  let xhr = new XMLHttpRequest();

  try{
    mostrarSpinner();
    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          console.log("Planeta actualizado con éxito");
          // Aquí puedes realizar alguna acción después de actualizar el planeta
        } else {
          console.error(`Error al actualizar el planeta: ${xhr.status} - ${xhr.statusText}`);
        }
      }
    });
  }
  finally{
    ocultarSpinner();
  }


  xhr.open("PUT", `${ENDPOINT}/${planeta.id}`); 
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(planeta));
}

function eliminarPlaneta(id) {
  let xhr = new XMLHttpRequest();

  try{
    mostrarSpinner();
    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          console.log("Planeta eliminado con éxito");
          // Aquí puedes realizar alguna acción después de eliminar el planeta
        } else {
          console.error(`Error al eliminar el planeta ${id}: ${xhr.status} - ${xhr.statusText}`);
        }
      }
    });
  }
  finally{
    ocultarSpinner();
  }


  xhr.open("DELETE", `${ENDPOINT}/${id}`);
  xhr.send();
}


