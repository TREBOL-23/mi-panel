export default async function handler(req, res) {
    // Permitir que tu página de GitHub pueda comunicarse con este backend
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Responder a las solicitudes OPTIONS
    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    // Solo permitimos GET
    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Método no permitido"
        });
    }

    try {
        const datos = new URLSearchParams();

        datos.append("key", process.env.N1_API_KEY);
        datos.append("action", "services");

        const respuesta = await fetch(
            "https://n1panel.com/api/v2",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: datos
            }
        );

        const resultado = await respuesta.json();

        return res.status(respuesta.status).json(resultado);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Error al conectar con N1 Panel"
        });
    }
}
