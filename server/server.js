import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";  // Asegúrate de importar "open" correctamente
import paypal from '@paypal/checkout-server-sdk';
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';



const app = express();
app.use(express.json());
app.use(cors({
    origin: "*", // Permitir todas (para pruebas). En producción, pon el dominio exacto.
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

// Conectar a la base de datos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas absolutas para las dos bases
const dbPath1 = path.join(__dirname, '..', 'database', 'database.db');
const dbPath2 = path.join(__dirname, '..', 'database', 'database2.db');

// Ahora sí: dbPromise 1 y 2
export const dbPromise = open({
  filename: dbPath1,
  driver: sqlite3.Database
});

export const dbPromise2 = open({
  filename: dbPath2,
  driver: sqlite3.Database
});
app.get("/reviews", async (req, res) => {
    try {
        const db = await dbPromise2;
        const reviews = await db.all("SELECT * FROM reviews");

        const reviewsConImagen = reviews.map((review) => {
            let imagenBase64 = null;

            if (review.foto && review.foto instanceof Buffer) {
                const base64 = review.foto.toString("base64");
                imagenBase64 = `data:image/jpeg;base64,${base64}`;
            }

            return {
                ...review,
                imagen: imagenBase64,
            };
        });

        res.json(reviewsConImagen);
    } catch (error) {
        console.error("❌ Error al obtener reseñas:", error);
        res.status(500).json({ error: "Error al obtener las reseñas" });
    }
})

// Ruta para obtener productos
// Ruta para obtener productos
app.get("/productos", async (req, res) => {
    try {
        const db = await dbPromise;
        const productos = await db.all("SELECT * FROM productos");

        const productosConImagen = productos.map((producto) => {
            let imagenBase64 = null;

            if (producto.imagen && producto.imagen instanceof Buffer) {
                const base64 = producto.imagen.toString("base64");
                imagenBase64 = `data:image/jpeg;base64,${base64}`;
            }

            return {
                ...producto,
                imagen: imagenBase64, // Sobreescribimos la propiedad "imagen"
            };
        });

        res.json(productosConImagen);
    } catch (error) {
        console.error("❌ Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener los productos" });
    }
});


app.put("/productos/favorito/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const db = await dbPromise;
        
        // Obtener el estado actual del producto
        const producto = await db.get("SELECT favorito FROM productos WHERE id = ?", [id]);

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Alternar el valor de favorito
        const nuevoFavorito = producto.favorito ? 0 : 1;
        
        // Actualizar en la base de datos
        await db.run("UPDATE productos SET favorito = ? WHERE id = ?", [nuevoFavorito, id]);

        res.json({ id, favorito: nuevoFavorito });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el favorito" });
    }
});

app.put("/productos/cart/:id", async (req, res) => {
    try{
        const { id } = req.params;
        const db = await dbPromise;

        const producto = await db.get("SELECT cart FROM productos WHERE id = ?", [id]);

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const nuevoCart = producto.cart ? 0 : 1;

        await db.run("UPDATE productos SET cart = ? WHERE id = ?", [nuevoCart, id]);

        res.json({ id, cart: nuevoCart });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el carrito" });
    }
});

app.get("/banner/foto_banner/:id", async (req,res) => {
    try {
        const { id } = req.params;
        const db = await dbPromise2;
        const banner = await db.get("SELECT * FROM banner WHERE id = ?", [id]);

        if (!banner) {
            return res.status(404).json({ error: "Banner no encontrado" });
        }

        let imagenBase64 = null;

        if (banner.foto_banner && banner.foto_banner instanceof Buffer) {
            const base64 = banner.foto_banner.toString("base64");
            imagenBase64 = `data:image/jpeg;base64,${base64}`;
        }

        res.json({
            ...banner,
            imagen: imagenBase64,
        });
    } catch (error) {
        console.error("❌ Error al obtener banner:", error);
        res.status(500).json({ error: "Error al obtener banner" });
    }
});

app.get("/perfil/foto_de_perfil/:id", async (req,res) => {
    try {
        const { id } = req.params;
        const db = await dbPromise2;
        const perfil = await db.get("SELECT * FROM perfil WHERE id = ?", [id]);

        if (!perfil) {
            return res.status(404).json({ error: "Perfil no encontrado" });
        }

        let imagenBase64 = null;

        if (perfil.foto_de_perfil && perfil.foto_de_perfil instanceof Buffer) {
            const base64 = perfil.foto_de_perfil.toString("base64");
            imagenBase64 = `data:image/jpeg;base64,${base64}`;
        }

        res.json({
            ...perfil,
            imagen: imagenBase64,
        });
    } catch (error) {
        console.error("❌ Error al obtener perfil:", error);
        res.status(500).json({ error: "Error al obtener perfil" });
    }
});

  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));