export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Método no permitido"
        });
    }

    try {
        const userId = req.query.user_id;

        if (!userId) {
            return res.status(400).json({
                error: "Falta user_id"
            });
        }

        const respuesta = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,email,balance`,
            {
                method: "GET",
                headers: {
                    "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                }
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            console.error("Error Supabase:", datos);

            return res.status(500).json({
                error: "Error al consultar Supabase"
            });
        }

        if (!datos.length) {
            return res.status(404).json({
                error: "Usuario no encontrado"
            });
        }

        return res.status(200).json({
            id: datos[0].id,
            email: datos[0].email,
            balance: datos[0].balance
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }
}
