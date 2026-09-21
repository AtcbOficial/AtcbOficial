// Datos iniciales precargados
const INITIAL_DATA = {
  historia: `Soy Luis Bonilla, técnico especializado en refrigeración comercial e industrial con años de experiencia. Fundé ATCB Oficial (@AtcbOficial) para ofrecer soluciones integrales: fabricación de cuartos fríos, neveras exhibidoras, mantenimiento y reparación de equipos de frío.

Mi compromiso es la calidad, la puntualidad y el servicio al cliente. Trabajamos con empresas y particulares. Ofrecemos venta de implementos, fabricación a medida y servicio técnico profesional.`,

  phone: "+58 000-0000000",
  whatsapp: "580000000000",
  instagram: "AtcbOficial",
  adminPass: "atcb2024",

  gallery: [
    {
      id: 1,
      desc: "Instalación de cuarto frío industrial completo",
      img: "images/banner.png"
    },
    {
      id: 2,
      desc: "Nevera exhibidora comercial lista para negocio",
      img: "images/logo.png"
    },
    {
      id: 3,
      desc: "Mantenimiento y reparación de sistemas de refrigeración",
      img: "images/foto.png"
    }
  ],

  products: [
    {
      id: 1,
      name: "Cuarto Frío 10m³",
      cat: "cuartos",
      price: 4500,
      desc: "Cuarto frío industrial de 10 metros cúbicos. Incluye paneles aislantes, unidad condensadora y evaporadora. Ideal para carnes y lácteos.",
      img: "images/banner.png",
      available: true
    },
    {
      id: 2,
      name: "Nevera Exhibidora Vertical 2 Puertas",
      cat: "exhibidoras",
      price: 1850,
      desc: "Nevera exhibidora comercial vertical de 2 puertas de vidrio. Capacidad 800L. Ideal para bebidas y productos lácteos.",
      img: "images/logo.png",
      available: true
    },
    {
      id: 3,
      name: "Nevera Doméstica 350L",
      cat: "domestica",
      price: 420,
      desc: "Nevera doméstica de 350 litros, eficiencia energética A+. Color plata. Garantía 1 año.",
      img: "images/foto.png",
      available: true
    },
    {
      id: 4,
      name: "Lavadora Industrial 15kg",
      cat: "lavadoras",
      price: 980,
      desc: "Lavadora industrial de 15kg de capacidad. Ideal para lavanderías y hoteles. Ciclos programables.",
      img: "images/banner.png",
      available: false
    },
    {
      id: 5,
      name: "Manifold Digital R410A",
      cat: "herramientas",
      price: 185,
      desc: "Manifold digital profesional para gases R410A, R22, R134a. Pantalla LCD, mangueras incluidas.",
      img: "images/logo.png",
      available: true
    },
    {
      id: 6,
      name: "Kit de Herramientas Básicas",
      cat: "herramientas",
      price: 95,
      desc: "Set completo de herramientas para técnico de refrigeración: llaves, destornilladores, pinzas, multímetro básico.",
      img: "images/foto.png",
      available: true
    },
    {
      id: 7,
      name: "Unidad Condensadora 3HP",
      cat: "otros",
      price: 720,
      desc: "Unidad condensadora de 3HP para sistemas de refrigeración comercial. Gas R404A.",
      img: "images/banner.png",
      available: true
    },
    {
      id: 8,
      name: "Nevera Exhibidora Horizontal",
      cat: "exhibidoras",
      price: 1250,
      desc: "Nevera exhibidora horizontal tipo isla. Capacidad 500L. Ideal para supermercados y carnicerías.",
      img: "images/logo.png",
      available: true
    }
  ]
};
