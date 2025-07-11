import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";  // Asegúrate de importar "open" correctamente
import paypal from '@paypal/checkout-server-sdk';


const app = express();
app.use(express.json());
app.use(cors());

// Conectar a la base de datos
const dbPromise = open({
    filename: "https://backend-ecomerce-vl7n.onrender.com/database/database.db",  // Asegúrate de que la ruta es correcta
    driver: sqlite3.Database
});

app.get("/reviews", async (req, res) => {
    try {
        const db = await dbPromise;
        const reviews = await db.all("SELECT * FROM reviews");
        console.log("📝 Reseñas obtenidas:", reviews);  // Ver en consola si realmente obtiene los datos
        res.json(reviews);
    } catch (error) {
        console.error("❌ Error al obtener reseñas:", error);
        res.status(500).json({ error: "Error al obtener las reseñas" });
    }
})

// Ruta para obtener productos
app.get("/productos", async (req, res) => {
    try {
        const db = await dbPromise;
        const productos = await db.all("SELECT * FROM productos");
        console.log("📦 Productos obtenidos:", productos);  // Ver en consola si realmente obtiene los datos
        res.json(productos);
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
  
  app.listen(5000, () => console.log("🚀 Servidor corriendo en http://localhost:5000"));
