export async function onRequestPost(context) {

    try {

        const formData = await context.request.formData();

        const name = formData.get("name") || "";
        const email = formData.get("email") || "";
        const event = formData.get("event") || "";
        const date = formData.get("date") || "";
        const location = formData.get("location") || "";
        const message = formData.get("message") || "";

        const response = await fetch("https://api.resend.com/emails", {

            method: "POST",

            headers: {
                "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                from: "Freddie Fierce Bookings <website@freddiefierce.com>",

                to: [
                    "bookings@freddiefierce.com"
                ],

                reply_to: email,

                subject: `NEW BOOKING ENQUIRY — ${event || name}`,

                html: `
                    <h2>New Freddie Fierce Booking Enquiry</h2>

                    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                    <p><strong>Event / Organisation:</strong> ${escapeHtml(event)}</p>
                    <p><strong>Event Date:</strong> ${escapeHtml(date)}</p>
                    <p><strong>Location:</strong> ${escapeHtml(location)}</p>

                    <hr>

                    <p><strong>Message:</strong></p>
                    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
                `
            })

        });


        if (!response.ok) {

            const error = await response.text();

            console.error("Resend error:", error);

            throw new Error("Email failed");

        }


        return new Response(
            JSON.stringify({ success: true }),
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    }

    catch (error) {

        console.error(error);

        return new Response(
            JSON.stringify({ success: false }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    }

}


function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}