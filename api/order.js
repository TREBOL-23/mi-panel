export default async function handler(req, res) {
    // Permitir comunicación con GitHub Pages
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Responder a OPTIONS
    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    // Solo permitimos POST
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método no permitido"
        });
    }

    try {
        const { service, link, quantity } = req.body || {};

        // Comprobar datos
        if (!service) {
            return res.status(400).json({
                error: "Falta el servicio"
            });
        }

        if (!link) {
            return res.status(400).json({
                error: "Falta el enlace"
            });
        }

        if (!quantity || Number(quantity) < 1) {
            return res.status(400).json({
                error: "Cantidad inválida"
            });
        }

        const datos = new URLSearchParams();

        datos.append("key", process.env.N1_API_KEY);
        datos.append("action", "add");
        datos.append("service", String(service));
        datos.append("link", String(link));
        datos.append("quantity", String(quantity));

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
            error: "Error al crear la orden"
        });
    }
}
