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

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({
                error: "Faltan variables de Supabase en Vercel"
            });
        }

        const url =
            `${supabaseUrl}/rest/v1/profiles` +
            `?id=eq.${encodeURIComponent(userId)}` +
            `&select=id,email,balance`;

        console.log("Consultando Supabase:", `${supabaseUrl}/rest/v1/profiles`);

        const respuesta = await fetch(url, {
            method: "GET",
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`
            }
        });

        const texto = await respuesta.text();

        console.log("Supabase status:", respuesta.status);
        console.log("Supabase respuesta:", texto);

        let datos;

        try {
            datos = JSON.parse(texto);
        } catch {
            return res.status(500).json({
                error: "Supabase devolvió una respuesta no válida"
            });
        }

        if (!respuesta.ok) {
            return res.status(500).json({
                error: "Error al consultar Supabase",
                supabase: datos
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
        console.error("Error general:", error);

        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }
}
