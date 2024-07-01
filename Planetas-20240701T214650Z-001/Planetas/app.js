const cors = require("cors"); // Importa el paquete cors
const express = require("express");
const app = express();
const port = 3000;

app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json());

let items = [
  {
    id: 1,
    nombre: "Mercurio",
    tamano: 4879,
    masa: 0.33,
    tipo: "Rocoso",
    distanciaAlSol: 57.9,
    poseeAnillo: false,
    presenciaVida: false,
    composicionAtmosferica: "Oxígeno, Sodio, Hidrógeno",
  },
  {
    id: 2,
    nombre: "Venus",
    tamano: 12104,
    masa: 4.87,
    tipo: "Rocoso",
    distanciaAlSol: 108.2,
    poseeAnillo: false,
    presenciaVida: false,
    composicionAtmosferica: "Dióxido de carbono, Nitrógeno",
  },
  {
    id: 3,
    nombre: "Tierra",
    tamano: 12742,
    masa: 5.97,
    tipo: "Rocoso",
    distanciaAlSol: 149.6,
    poseeAnillo: false,
    presenciaVida: true,
    composicionAtmosferica: "Nitrógeno, Oxígeno",
  },
  {
    id: 4,
    nombre: "Marte",
    tamano: 6779,
    masa: 0.642,
    tipo: "Rocoso",
    distanciaAlSol: 227.9,
    poseeAnillo: false,
    presenciaVida: false,
    composicionAtmosferica: "Dióxido de carbono, Nitrógeno, Argón",
  },
  {
    id: 5,
    nombre: "Júpiter",
    tamaño: 139820,
    masa: 1898,
    tipo: "Gaseoso",
    distancia: 778.3,
    anillo: true,
    vida: false,
    atmosfera: "Hidrógeno, Helio",
  },
  {
    id: 6,
    nombre: "Saturno",
    tamano: 116460,
    masa: 568,
    tipo: "Gaseoso",
    distanciaAlSol: 1427,
    poseeAnillo: true,
    presenciaVida: false,
    composicionAtmosferica: "Hidrógeno, Helio",
  },
  {
    id: 7,
    nombre: "Urano",
    tamano: 50724,
    masa: 86.8,
    tipo: "Gaseoso",
    distanciaAlSol: 2871,
    poseeAnillo: true,
    presenciaVida: false,
    composicionAtmosferica: "Hidrógeno, Helio, Metano",
  },
  {
    id: 8,
    nombre: "Neptuno",
    tamano: 49244,
    masa: 102,
    tipo: "Gaseoso",
    distanciaAlSol: 4495,
    poseeAnillo: true,
    presenciaVida: false,
    composicionAtmosferica: "Hidrógeno, Helio, Metano",
  },
];

// Middleware para simular una demora de 3 segundos
const simulateDelay = (req, res, next) => {
  setTimeout(next, 3000);
};

/**
 * Obtiene todas los items
 */
app.get("/planetas", simulateDelay, (req, res) => {
  res.json(items);
});

/**
 * Crea una nueva Casa
 */
app.post("/planetas", simulateDelay, (req, res) => {
  const aux = req.body;
  aux.id = items.length + 1;

  items.push(aux);
  res.status(200).json(aux);
});

/**
 * Obtiene Casa por ID
 */
app.get("/planetas/:id", simulateDelay, (req, res) => {
  const id = parseInt(req.params.id);
  const aux = items.find((p) => p.id === id);

  if (aux) {
    res.json(aux);
  } else {
    res.status(404).send("Item no encontrado");
  }
});

/**
 * Edita item por ID
 */
app.put("/planetas/:id", simulateDelay, (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex((p) => p.id === id);

  if (index !== -1) {
    const aux = req.body;
    aux.id = id;
    items[index] = aux;

    res.json(aux);
  } else {
    res.status(404).send("No encontrado");
  }
});

/**
 * Elimina item por ID
 */
app.delete("/planetas/:id", simulateDelay, (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex((p) => p.id === id);
  if (index !== -1) {
    items.splice(index, 1);
    res.status(200).send();
  } else {
    res.status(404).send("No encontrado");
  }
});

/**
 * Elimina todas los item
 */
app.delete("/planetas", simulateDelay, (req, res) => {
  items = [];
  res.status(200).send("Todos los items han sido eliminados");
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
