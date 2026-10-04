export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                error: "No estás autenticado"
            });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceKey) {
            return res.status(500).json({
                error: "Faltan variables de Supabase"
            });
        }

        // ===============================
        // COMPROBAR USUARIO
        // ===============================

        const usuarioRespuesta = await fetch(
            `${supabaseUrl}/auth/v1/user`,
            {
                method: "GET",
                headers: {
                    "apikey": serviceKey,
                    "Authorization": authorization
                }
            }
        );

        const usuario = await usuarioRespuesta.json();

        if (!usuarioRespuesta.ok || !usuario.id) {
            return res.status(401).json({
                error: "Sesión inválida"
            });
        }

        // ===============================
        // COMPROBAR QUE ES ADMIN
        // ===============================

        const perfilRespuesta = await fetch(
            `${supabaseUrl}/rest/v1/profiles` +
            `?id=eq.${encodeURIComponent(usuario.id)}` +
            `&select=id,email,role`,
            {
                method: "GET",
                headers: {
                    "apikey": serviceKey,
                    "Authorization": `Bearer ${serviceKey}`
                }
            }
        );

        const perfiles = await perfilRespuesta.json();

        if (
            !perfilRespuesta.ok ||
            !perfiles.length ||
            perfiles[0].role !== "admin"
        ) {
            return res.status(403).json({
                error: "No tienes permisos de administrador"
            });
        }

        // ===============================
        // VER SOLICITUDES
        // ===============================

        if (req.method === "GET") {

            const respuesta = await fetch(
                `${supabaseUrl}/rest/v1/deposit_requests` +
                `?select=id,user_id,amount,status,proof_url,created_at,reviewed_at` +
                `&order=id.desc`,
                {
                    method: "GET",
                    headers: {
                        "apikey": serviceKey,
                        "Authorization":
                            `Bearer ${serviceKey}`
                    }
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                return res.status(500).json({
                    error: "No se pudieron obtener las solicitudes"
                });
            }

            return res.status(200).json(datos);
        }

        // ===============================
        // APROBAR SOLICITUD
        // ===============================

        if (req.method === "POST") {

            const { request_id } = req.body || {};

            if (!request_id) {
                return res.status(400).json({
                    error: "Falta request_id"
                });
            }

            const respuesta = await fetch(
                `${supabaseUrl}/rest/v1/rpc/approve_deposit`,
                {
                    method: "POST",
                    headers: {
                        "apikey": serviceKey,
                        "Authorization":
                            `Bearer ${serviceKey}`,
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        p_request_id: Number(request_id)
                    })
                }
            );

            const texto = await respuesta.text();

            if (!respuesta.ok) {
                console.error(
                    "Error aprobando:",
                    texto
                );

                return res.status(500).json({
                    error: "No se pudo aprobar la solicitud"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Recarga aprobada correctamente"
            });
        }

        return res.status(405).json({
            error: "Método no permitido"
        });

    } catch (error) {

        console.error("Error admin:", error);

        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }
}
